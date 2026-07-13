import type { SupabaseClient } from "@supabase/supabase-js";
import type { SectionRow } from "@/types/content";

// How many snapshots to keep per section / per settings scope. Old ones are
// pruned on each new snapshot so the tables can't grow unbounded.
const VERSIONS_KEPT = 20;

/**
 * Snapshot a section row into section_versions. Failures are returned, not
 * thrown — a snapshot problem shouldn't block the save itself, but callers
 * that care (delete!) must check it: the delete snapshot is the only way to
 * restore a deleted section.
 */
export async function snapshotSection(
  supabase: SupabaseClient,
  row: SectionRow,
  reason: "edit" | "delete" | "restore"
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("section_versions").insert({
    section_id: row.id,
    type: row.type,
    content: row.content,
    sort_order: row.sort_order,
    is_visible: row.is_visible,
    reason,
  });
  if (error) return { error: error.message };

  await pruneVersions(supabase, "section_versions", "section_id", row.id);
  return { error: null };
}

export async function snapshotSettings(
  supabase: SupabaseClient,
  scope: "theme" | "settings",
  data: Record<string, unknown>
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("settings_versions").insert({ scope, data });
  if (error) return { error: error.message };

  await pruneVersions(supabase, "settings_versions", "scope", scope);
  return { error: null };
}

async function pruneVersions(
  supabase: SupabaseClient,
  table: "section_versions" | "settings_versions",
  keyColumn: "section_id" | "scope",
  keyValue: string
) {
  // Best-effort: pruning failures are invisible to the user and harmless
  // (the next snapshot retries), so no error propagation.
  const { data: stale } = await supabase
    .from(table)
    .select("id")
    .eq(keyColumn, keyValue)
    .order("created_at", { ascending: false })
    .range(VERSIONS_KEPT, VERSIONS_KEPT + 99);
  if (stale && stale.length > 0) {
    await supabase.from(table).delete().in(
      "id",
      stale.map((row) => row.id)
    );
  }
}
