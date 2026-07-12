import { cache } from "react";
import { getPublicSupabaseClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/types/content";

// cache() dedupes this across every call within the same request (root
// layout's theme injection, the marketing layout's Header/Footer data,
// generateMetadata, etc.) so the settings row is only fetched once per
// page load no matter how many places need it.
export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  const supabase = getPublicSupabaseClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  return data;
});
