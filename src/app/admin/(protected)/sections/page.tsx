import Link from "next/link";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { SectionsList } from "@/components/admin/SectionsList";
import { VersionHistory } from "@/components/admin/VersionHistory";
import { restoreSectionVersion } from "@/lib/admin/version-actions";
import { sectionLabels } from "@/lib/section-registry";
import type { SectionRow, SectionVersion } from "@/types/content";

export default async function AdminSectionsPage() {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .order("sort_order", { ascending: true });
  // Fail loudly: swallowing the error here shows a false "No sections yet"
  // empty state whenever the fetch transiently fails.
  if (error) throw new Error(`Failed to load sections: ${error.message}`);
  const sections = (data ?? []) as SectionRow[];

  // Deleted sections that can still be restored: their delete-snapshots,
  // newest per section, excluding any section that exists again.
  const { data: deletedRows } = await supabase
    .from("section_versions")
    .select("id, section_id, type, created_at")
    .eq("reason", "delete")
    .order("created_at", { ascending: false })
    .limit(50);
  const liveIds = new Set(sections.map((s) => s.id));
  const seen = new Set<string>();
  const deleted = ((deletedRows ?? []) as Pick<SectionVersion, "id" | "section_id" | "type" | "created_at">[]).filter(
    (v) => {
      if (liveIds.has(v.section_id) || seen.has(v.section_id)) return false;
      seen.add(v.section_id);
      return true;
    }
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-xs text-foreground-muted hover:text-foreground">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-display-sm font-heading text-foreground">Homepage Sections</h1>
          <p className="mt-1 text-body-sm text-foreground-muted">
            Drag to reorder. Toggle visibility or delete. Changes go live within seconds.
          </p>
        </div>
        <Link
          href="/admin/sections/new"
          className="focus-ring rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-background hover:shadow-glow-md"
        >
          + Add Section
        </Link>
      </div>

      <div className="mt-8">
        <SectionsList sections={sections} />
      </div>

      {deleted.length > 0 && (
        <VersionHistory
          heading="Recently deleted"
          description="Deleted sections keep a backup — restore brings them back at the bottom of the page."
          items={deleted.map((v) => ({
            id: v.id,
            title: sectionLabels[v.type],
            detail: `deleted ${new Date(v.created_at).toLocaleString()}`,
          }))}
          restoreAction={restoreSectionVersion}
          buttonLabel="Restore section"
        />
      )}
    </div>
  );
}
