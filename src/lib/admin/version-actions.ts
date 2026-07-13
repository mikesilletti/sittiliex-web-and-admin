"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { contentSchemaFor } from "@/lib/admin/content-schemas";
import { scopeSchemas } from "@/lib/admin/settings-schemas";
import { snapshotSection, snapshotSettings } from "@/lib/admin/versioning";
import type { SectionRow, SectionType, SectionVersion } from "@/types/content";

/**
 * Restore a section to a snapshot. Works for both cases:
 * - section still exists → its content is reverted (current state is
 *   snapshotted first so the revert itself can be undone);
 * - section was deleted → it is re-created with its original id, so its
 *   older history keeps applying to it.
 */
export async function restoreSectionVersion(versionId: string): Promise<{ error: string | null }> {
  await requireAdminSession();
  const supabase = getAdminSupabaseClient();

  const { data: versionRow, error: versionError } = await supabase
    .from("section_versions")
    .select("*")
    .eq("id", versionId)
    .single();
  if (versionError || !versionRow) return { error: "Version not found." };
  const version = versionRow as SectionVersion;

  // Re-validate: snapshots were valid when written, but schemas evolve.
  const parsed = contentSchemaFor(version.type as SectionType).safeParse(version.content);
  if (!parsed.success) {
    return { error: "This snapshot is no longer compatible with the current content rules." };
  }

  const { data: existing } = await supabase
    .from("sections")
    .select("*")
    .eq("id", version.section_id)
    .maybeSingle();

  if (existing) {
    await snapshotSection(supabase, existing as SectionRow, "edit");
    const { error } = await supabase
      .from("sections")
      .update({ content: parsed.data, updated_at: new Date().toISOString() })
      .eq("id", version.section_id);
    if (error) return { error: error.message };
    revalidatePath(`/admin/sections/${version.section_id}`);
  } else {
    const { data: last } = await supabase
      .from("sections")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    const nextSortOrder = last && last.length > 0 ? last[0].sort_order + 1 : 0;

    const { data: restored, error } = await supabase
      .from("sections")
      .insert({
        id: version.section_id,
        type: version.type,
        sort_order: nextSortOrder,
        is_visible: true,
        content: parsed.data,
      })
      .select("*")
      .single();
    if (error || !restored) return { error: error?.message ?? "Failed to restore section." };

    await snapshotSection(supabase, restored as SectionRow, "restore");
  }

  revalidatePath("/");
  revalidatePath("/admin/sections");
  return { error: null };
}

export async function restoreSettingsVersion(versionId: string): Promise<{ error: string | null }> {
  await requireAdminSession();
  const supabase = getAdminSupabaseClient();

  const { data: version, error: versionError } = await supabase
    .from("settings_versions")
    .select("*")
    .eq("id", versionId)
    .single();
  if (versionError || !version) return { error: "Version not found." };

  const schema = scopeSchemas[version.scope as "theme" | "settings"];
  const parsed = schema.safeParse(version.data);
  if (!parsed.success) {
    return { error: "This snapshot is no longer compatible with the current settings rules." };
  }

  // Snapshot what we're about to overwrite so the restore is undoable.
  const { data: current, error: fetchError } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (fetchError || !current) return { error: fetchError?.message ?? "Settings row missing." };
  const currentScoped = schema.safeParse(current);
  if (currentScoped.success) {
    await snapshotSettings(supabase, version.scope, currentScoped.data);
  }

  const { error } = await supabase
    .from("site_settings")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath(`/admin/${version.scope}`);
  return { error: null };
}
