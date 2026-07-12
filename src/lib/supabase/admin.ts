import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client that bypasses RLS. Used exclusively by admin Server
 * Actions for writes. The `server-only` import above makes it a build error
 * to ever import this from a Client Component, so this key can never reach
 * the browser.
 */
export function getAdminSupabaseClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
