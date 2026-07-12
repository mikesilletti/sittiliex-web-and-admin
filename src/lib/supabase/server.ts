import { createClient } from "@supabase/supabase-js";

/**
 * Public, RLS-respecting client for reading site content. Safe to use in
 * Server Components — the anon key never reaches the browser since nothing
 * here is a Client Component.
 */
export function getPublicSupabaseClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
}
