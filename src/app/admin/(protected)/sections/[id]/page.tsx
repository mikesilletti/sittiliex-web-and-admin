import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { formRegistry } from "@/lib/admin/form-registry";
import { sectionLabels } from "@/lib/section-registry";
import type { SectionRow } from "@/types/content";

export default async function EditSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getAdminSupabaseClient();
  const { data } = await supabase.from("sections").select("*").eq("id", id).single();

  if (!data) {
    notFound();
  }

  const section = data as SectionRow;
  const Form = formRegistry[section.type];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/admin/sections" className="text-xs text-foreground-muted hover:text-foreground">
        ← Sections
      </Link>
      <h1 className="mt-2 text-display-sm font-heading text-foreground">
        Edit {sectionLabels[section.type]}
      </h1>

      <div className="mt-8">
        <Form id={section.id} content={section.content as never} />
      </div>
    </div>
  );
}
