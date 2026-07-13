"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { defaultContentFor } from "@/lib/admin/default-content";
import { contentSchemaFor, sectionTypeSchema } from "@/lib/admin/content-schemas";
import { snapshotSection } from "@/lib/admin/versioning";
import type { SectionContentMap, SectionRow, SectionType } from "@/types/content";

export async function reorderSections(orderedIds: string[]): Promise<{ error: string | null }> {
  await requireAdminSession();
  const supabase = getAdminSupabaseClient();

  // Single atomic UPDATE via RPC. An upsert can't do this: NOT NULL checks
  // run on the insert tuple BEFORE conflict arbitration, so a partial-column
  // upsert of (id, sort_order) fails on `type` even for existing rows.
  // Unknown ids simply match nothing — no junk rows possible.
  const { error } = await supabase.rpc("reorder_sections", { ids: orderedIds });
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/sections");
  return { error: null };
}

export async function toggleSectionVisibility(id: string, isVisible: boolean): Promise<void> {
  await requireAdminSession();
  const supabase = getAdminSupabaseClient();

  const { error } = await supabase.from("sections").update({ is_visible: isVisible }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/sections");
}

export async function deleteSection(id: string): Promise<void> {
  await requireAdminSession();
  const supabase = getAdminSupabaseClient();

  // The delete snapshot is the only path back for a deleted section, so a
  // failed snapshot must abort the delete.
  const { data: row, error: fetchError } = await supabase
    .from("sections")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError || !row) throw new Error(fetchError?.message ?? "Section not found.");

  const snapshot = await snapshotSection(supabase, row as SectionRow, "delete");
  if (snapshot.error) throw new Error(`Couldn't back up the section: ${snapshot.error}`);

  const { error } = await supabase.from("sections").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/sections");
}

export async function createSection(type: SectionType): Promise<never> {
  await requireAdminSession();

  const parsedType = sectionTypeSchema.safeParse(type);
  if (!parsedType.success) throw new Error("Invalid section type.");

  const supabase = getAdminSupabaseClient();

  const { data: existing } = await supabase
    .from("sections")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data, error } = await supabase
    .from("sections")
    .insert({
      type: parsedType.data,
      sort_order: nextSortOrder,
      is_visible: true,
      content: defaultContentFor(parsedType.data),
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create section");

  redirect(`/admin/sections/${data.id}`);
}

export async function updateSectionContent<T extends SectionType>(
  id: string,
  content: SectionContentMap[T]
): Promise<{ error: string | null }> {
  await requireAdminSession();
  const supabase = getAdminSupabaseClient();

  // Validate against the schema for the row's STORED type (can't be spoofed
  // by the caller). parsed.data — not the raw input — is what gets written,
  // so unknown keys are stripped and size bounds enforced.
  const { data: row, error: fetchError } = await supabase
    .from("sections")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError || !row) return { error: "Section not found." };

  const parsed = contentSchemaFor(row.type as SectionType).safeParse(content);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid content." };
  }

  // Best-effort snapshot of what's being overwritten, for the History panel.
  await snapshotSection(supabase, row as SectionRow, "edit");

  const { error } = await supabase
    .from("sections")
    .update({ content: parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath(`/admin/sections/${id}`);
  return { error: null };
}
