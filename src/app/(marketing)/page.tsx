import { getPublicSupabaseClient } from "@/lib/supabase/server";
import { isPageOnlyType, sectionRegistry } from "@/lib/section-registry";
import { ScrollToHashOnLoad } from "@/components/motion/ScrollToHashOnLoad";
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
      <ScrollToHashOnLoad />
      {sections.map((section) => {
        // Page-only rows (the About page) share the table but render on their own route.
        if (isPageOnlyType(section.type)) return null;
        const Component = sectionRegistry[section.type];
        if (!Component) return null;
        return <Component key={section.id} content={section.content as never} />;
      })}
    </main>
  );
}
