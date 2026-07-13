import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { ThemeForm } from "@/components/admin/ThemeForm";
import type { SiteSettings } from "@/types/content";

export default async function AdminThemePage() {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  if (error || !data) {
    throw new Error(`Failed to load site settings: ${error?.message ?? "row missing"}`);
  }
  const settings = data as SiteSettings;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-display-sm font-heading text-foreground">Theme</h1>
      <p className="mt-1 text-body-sm text-foreground-muted">
        Colors and fonts apply site-wide immediately after saving.
      </p>

      <div className="mt-8">
        <ThemeForm
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
    </div>
  );
}
