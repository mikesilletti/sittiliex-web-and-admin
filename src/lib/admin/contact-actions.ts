"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export async function deleteContactSubmission(id: string): Promise<{ error: string | null }> {
  await requireAdminSession();
  const supabase = getAdminSupabaseClient();

  const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/contacts");
  return { error: null };
}
