import { getPublicSupabaseClient } from "@/lib/supabase/server";
import { sectionRegistry } from "@/lib/section-registry";
import type { SectionRow } from "@/types/content";

export const revalidate = 300;

export default async function Home() {
  const supabase = getPublicSupabaseClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  // Throw rather than render an empty page: with ISR a transient fetch error
  // would otherwise be cached as a blank homepage for the whole revalidate
  // window; a throw keeps serving the last good version instead.
  if (error) throw new Error(`Failed to load sections: ${error.message}`);
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
