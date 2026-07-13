"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { themeSchema, settingsSchema, type ThemeInput, type SettingsInput } from "@/lib/admin/settings-schemas";
import { snapshotSettings } from "@/lib/admin/versioning";

async function saveScope(
  scope: "theme" | "settings",
  parsedData: Record<string, unknown>
): Promise<{ error: string | null }> {
  const supabase = getAdminSupabaseClient();

  // Snapshot the current values for this scope before overwriting, so the
  // save can be reverted from the History panel.
  const { data: current, error: fetchError } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (fetchError || !current) {
    return { error: fetchError?.message ?? "Settings row missing." };
  }
  const schema = scope === "theme" ? themeSchema : settingsSchema;
  const currentScoped = schema.safeParse(current);
  if (currentScoped.success) {
    await snapshotSettings(supabase, scope, currentScoped.data);
  }

  const { error } = await supabase
    .from("site_settings")
    .update({ ...parsedData, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath(`/admin/${scope}`);
  return { error: null };
}

export async function saveTheme(input: ThemeInput): Promise<{ error: string | null }> {
  await requireAdminSession();

  const parsed = themeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid theme values." };
  }

  return saveScope("theme", parsed.data);
}

export async function saveSettings(input: SettingsInput): Promise<{ error: string | null }> {
  await requireAdminSession();

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid settings values." };
  }

  return saveScope("settings", parsed.data);
}
