import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { ThemeForm } from "@/components/admin/ThemeForm";
import { VersionHistory } from "@/components/admin/VersionHistory";
import { restoreSettingsVersion } from "@/lib/admin/version-actions";
import type { SettingsVersion, SiteSettings } from "@/types/content";

export default async function AdminThemePage() {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  if (error || !data) {
    throw new Error(`Failed to load site settings: ${error?.message ?? "row missing"}`);
  }
  const settings = data as SiteSettings;

  const { data: versionRows } = await supabase
    .from("settings_versions")
    .select("id, created_at")
    .eq("scope", "theme")
    .order("created_at", { ascending: false })
    .limit(10);
  const versions = (versionRows ?? []) as Pick<SettingsVersion, "id" | "created_at">[];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-display-sm font-heading text-foreground">Theme</h1>
      <p className="mt-1 text-body-sm text-foreground-muted">
        Colors and fonts apply site-wide immediately after saving.
      </p>

      <div className="mt-8">
        <ThemeForm
          key={settings.updated_at}
          initial={{
            color_background: settings.color_background,
            color_background_raised: settings.color_background_raised,
            color_background_overlay: settings.color_background_overlay,
            color_foreground: settings.color_foreground,
            color_foreground_muted: settings.color_foreground_muted,
            color_foreground_subtle: settings.color_foreground_subtle,
            color_accent: settings.color_accent,
            color_accent_hover: settings.color_accent_hover,
            color_border: settings.color_border,
            color_border_strong: settings.color_border_strong,
            font_pairing_id: settings.font_pairing_id,
          }}
        />
      </div>

      <VersionHistory
        heading="Theme history"
        description="Each save keeps the previous colors and fonts. Restoring saves the current theme first."
        items={versions.map((v) => ({
          id: v.id,
          title: new Date(v.created_at).toLocaleString(),
          detail: "previous theme",
        }))}
        restoreAction={restoreSettingsVersion}
      />
    </div>
  );
}
