import Link from "next/link";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { SectionsList } from "@/components/admin/SectionsList";
import { VersionHistory } from "@/components/admin/VersionHistory";
import { restoreSectionVersion } from "@/lib/admin/version-actions";
import { isPageOnlyType, sectionDescriptions, sectionLabels, sectionViewPaths } from "@/lib/section-registry";
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
  const homeSections = sections.filter((s) => !isPageOnlyType(s.type));
  const pageSections = sections.filter((s) => isPageOnlyType(s.type));

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
          <h1 className="mt-2 text-display-sm font-heading text-foreground">Site Content</h1>
          <p className="mt-1 text-body-sm text-foreground-muted">
            Edit any text, photo or button on the site. Changes go live within seconds.
          </p>
        </div>
        <Link
          href="/admin/sections/new"
          className="focus-ring rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-background hover:shadow-glow-md"
        >
          + Add Section
        </Link>
      </div>

      <h2 className="mt-10 text-xs font-semibold uppercase tracking-widest text-foreground-subtle">Homepage</h2>
      <p className="mt-1 text-xs text-foreground-subtle">
        Drag to reorder. The Acquisitions, FAQ and Contact pages use the same sections, so one edit updates both
        places.
      </p>
      <div className="mt-4">
        <SectionsList sections={homeSections} />
      </div>

      <h2 className="mt-10 text-xs font-semibold uppercase tracking-widest text-foreground-subtle">Other pages</h2>
      <div className="mt-4 flex flex-col gap-2">
        {pageSections.map((section) => (
          <div
            key={section.id}
            className="flex items-center gap-3 rounded-md border border-border bg-background-raised px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{sectionLabels[section.type]}</p>
              <p className="mt-0.5 truncate text-xs text-foreground-subtle">{sectionDescriptions[section.type]}</p>
            </div>
            <a
              href={sectionViewPaths[section.type]}
              target="_blank"
              rel="noreferrer"
              className="focus-ring hidden rounded-sm px-2 py-1 text-xs text-foreground-muted hover:text-foreground sm:inline"
            >
              View
            </a>
            <Link
              href={`/admin/sections/${section.id}`}
              className="focus-ring rounded-sm px-2 py-1 text-xs text-accent hover:text-accent-hover"
            >
              Edit
            </Link>
          </div>
        ))}
        {pageSections.length === 0 && (
          <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-xs text-foreground-subtle">
            The About page isn&apos;t set up for editing yet.
          </p>
        )}
      </div>

      {deleted.length > 0 && (
        <VersionHistory
          heading="Recently deleted"
          description="Deleted sections keep a backup. Restoring brings them back at the bottom of the page."
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
