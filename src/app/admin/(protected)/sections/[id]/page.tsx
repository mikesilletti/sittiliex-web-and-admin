import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { formRegistry } from "@/lib/admin/form-registry";
import { sectionLabels } from "@/lib/section-registry";
import { restoreSectionVersion } from "@/lib/admin/version-actions";
import { VersionHistory } from "@/components/admin/VersionHistory";
import type { SectionRow, SectionVersion } from "@/types/content";

const reasonLabels: Record<SectionVersion["reason"], string> = {
  edit: "saved before an edit",
  delete: "backup taken when deleted",
  restore: "restored copy",
};

export default async function EditSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase.from("sections").select("*").eq("id", id).single();

  // PGRST116 = no matching row → a real 404. Anything else is a fetch
  // failure and must not masquerade as "section doesn't exist".
  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to load section: ${error.message}`);
  }
  if (!data) {
    notFound();
  }

  const section = data as SectionRow;
  const Form = formRegistry[section.type];

  const { data: versionRows } = await supabase
    .from("section_versions")
    .select("id, reason, created_at")
    .eq("section_id", id)
    .order("created_at", { ascending: false })
    .limit(10);
  const versions = (versionRows ?? []) as Pick<SectionVersion, "id" | "reason" | "created_at">[];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/admin/sections" className="text-xs text-foreground-muted hover:text-foreground">
        ← Sections
      </Link>
      <h1 className="mt-2 text-display-sm font-heading text-foreground">
        Edit {sectionLabels[section.type]}
      </h1>

      <div className="mt-8">
        {/* Key on updated_at: after a restore, router.refresh() must remount
            the form so its local state picks up the restored content. */}
        <Form key={section.updated_at} id={section.id} content={section.content as never} />
      </div>

      <VersionHistory
        heading="Version history"
        description="Every save keeps a copy of what it replaced. Restoring saves the current state first, so you can always go back."
        items={versions.map((v) => ({
          id: v.id,
          title: new Date(v.created_at).toLocaleString(),
          detail: reasonLabels[v.reason],
        }))}
        restoreAction={restoreSectionVersion}
      />
    </div>
  );
}
