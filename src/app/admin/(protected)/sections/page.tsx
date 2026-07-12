import Link from "next/link";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { SectionsList } from "@/components/admin/SectionsList";
import type { SectionRow } from "@/types/content";

export default async function AdminSectionsPage() {
  const supabase = getAdminSupabaseClient();
  const { data } = await supabase.from("sections").select("*").order("sort_order", { ascending: true });
  const sections = (data ?? []) as SectionRow[];

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
    </div>
  );
}
