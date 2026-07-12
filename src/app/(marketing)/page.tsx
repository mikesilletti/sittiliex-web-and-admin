import { getPublicSupabaseClient } from "@/lib/supabase/server";
import { sectionRegistry } from "@/lib/section-registry";
import type { SectionRow } from "@/types/content";

export const revalidate = 300;

export default async function Home() {
  const supabase = getPublicSupabaseClient();
  const { data } = await supabase
    .from("sections")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  const sections = (data ?? []) as SectionRow[];

  return (
    <main>
      {sections.map((section) => {
        const Component = sectionRegistry[section.type];
        if (!Component) return null;
        return <Component key={section.id} content={section.content as never} />;
      })}
    </main>
  );
}
