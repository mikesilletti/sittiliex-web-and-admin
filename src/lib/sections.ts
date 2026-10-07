import { cache } from "react";
import { getPublicSupabaseClient } from "@/lib/supabase/server";
import type { SectionContentMap, SectionType } from "@/types/content";

/**
 * Content of the first visible section of a type. Standalone pages
 * (/acquisitions, /faq, /contact) render the same CMS section as the
 * homepage, so an edit in the admin updates both places.
 */
export const getSectionContent = cache(
  async <T extends SectionType>(type: T): Promise<SectionContentMap[T] | null> => {
    const supabase = getPublicSupabaseClient();
    const { data, error } = await supabase
      .from("sections")
      .select("content")
      .eq("type", type)
      .eq("is_visible", true)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    // Throw on a fetch error so ISR keeps serving the last good page.
    if (error) throw new Error(`Failed to load ${type} section: ${error.message}`);
    return (data?.content as SectionContentMap[T] | undefined) ?? null;
  }
);
