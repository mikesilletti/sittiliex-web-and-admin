import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { COMPANY } from "@/lib/company";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { VersionHistory } from "@/components/admin/VersionHistory";
import { restoreSettingsVersion } from "@/lib/admin/version-actions";
import type { SettingsVersion, SiteSettings } from "@/types/content";

export default async function AdminSettingsPage() {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  if (error || !data) {
    throw new Error(`Failed to load site settings: ${error?.message ?? "row missing"}`);
  }
  const settings = data as SiteSettings;

  const { data: versionRows } = await supabase
    .from("settings_versions")
    .select("id, created_at")
    .eq("scope", "settings")
    .order("created_at", { ascending: false })
    .limit(10);
  const versions = (versionRows ?? []) as Pick<SettingsVersion, "id" | "created_at">[];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-display-sm font-heading text-foreground">Settings</h1>
      <p className="mt-1 text-body-sm text-foreground-muted">
        Navigation, footer, contact details, and SEO defaults.
      </p>

      <div className="mt-8">
        <SettingsForm
          key={settings.updated_at}
          initial={{
            site_name: settings.site_name,
            contact_email: settings.contact_email,
            contact_phone: settings.contact_phone || COMPANY.phone,
            nav_items: settings.nav_items,
            header_cta_label: settings.header_cta_label,
            header_cta_href: settings.header_cta_href,
            footer_tagline: settings.footer_tagline,
            footer_copyright: settings.footer_copyright,
            seo_site_title: settings.seo_site_title,
            seo_meta_description: settings.seo_meta_description,
            seo_og_image_url: settings.seo_og_image_url,
          }}
        />
      </div>

      <VersionHistory
        heading="Settings history"
        description="Each save keeps the previous values. Restoring saves the current settings first."
        items={versions.map((v) => ({
          id: v.id,
          title: new Date(v.created_at).toLocaleString(),
          detail: "previous settings",
        }))}
        restoreAction={restoreSettingsVersion}
      />
    </div>
  );
}
