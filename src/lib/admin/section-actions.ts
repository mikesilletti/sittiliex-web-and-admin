"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { defaultContentFor } from "@/lib/admin/default-content";
import type { SectionContentMap, SectionType } from "@/types/content";

export async function reorderSections(orderedIds: string[]): Promise<void> {
  await requireAdminSession();
  const supabase = getAdminSupabaseClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("sections").update({ sort_order: index }).eq("id", id)
    )
  );

  revalidatePath("/");
}

export async function toggleSectionVisibility(id: string, isVisible: boolean): Promise<void> {
  await requireAdminSession();
  const supabase = getAdminSupabaseClient();

  const { error } = await supabase.from("sections").update({ is_visible: isVisible }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function deleteSection(id: string): Promise<void> {
  await requireAdminSession();
  const supabase = getAdminSupabaseClient();

  const { error } = await supabase.from("sections").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/sections");
}

export async function createSection(type: SectionType): Promise<never> {
  await requireAdminSession();
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
      type,
      sort_order: nextSortOrder,
      is_visible: true,
      content: defaultContentFor(type),
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

  const { error } = await supabase.from("sections").update({ content }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath(`/admin/sections/${id}`);
  return { error: null };
}
