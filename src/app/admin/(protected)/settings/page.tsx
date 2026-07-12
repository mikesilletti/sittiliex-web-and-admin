import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { SettingsForm } from "@/components/admin/SettingsForm";
import type { SiteSettings } from "@/types/content";

export default async function AdminSettingsPage() {
  const supabase = getAdminSupabaseClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  const settings = data as SiteSettings;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-display-sm font-heading text-foreground">Settings</h1>
      <p className="mt-1 text-body-sm text-foreground-muted">
        Navigation, footer, contact email, and SEO defaults.
      </p>

      <div className="mt-8">
        <SettingsForm
          initial={{
            site_name: settings.site_name,
            contact_email: settings.contact_email,
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
    </div>
  );
}
