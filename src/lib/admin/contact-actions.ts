"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export interface NewSubmissionSummary {
  id: string;
  name: string;
  company: string | null;
  created_at: string;
}

/**
 * Polled from the admin panel (see ContactNotifications) to surface new
 * leads as they arrive. Polling rather than Supabase Realtime: Realtime's
 * postgres_changes stream is authorized via the row's RLS, and
 * contact_submissions deliberately has no public SELECT policy (service
 * role only) — a Realtime subscription would require punching a hole in
 * that for the public anon key, exposing every lead's name/email/message to
 * anyone who reads the key out of the client bundle.
 */
export async function checkNewSubmissions(sinceIso: string): Promise<NewSubmissionSummary[]> {
  await requireAdminSession();
  const supabase = getAdminSupabaseClient();

  const { data, error } = await supabase
    .from("contact_submissions")
    .select("id, name, company, created_at")
    .gt("created_at", sinceIso)
    .order("created_at", { ascending: true })
    .limit(20);
  if (error) return [];

  return data as NewSubmissionSummary[];
}

export async function deleteContactSubmission(id: string): Promise<{ error: string | null }> {
  await requireAdminSession();
  const supabase = getAdminSupabaseClient();

  const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/contacts");
  return { error: null };
}
