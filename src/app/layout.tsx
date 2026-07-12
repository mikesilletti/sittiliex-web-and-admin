import type { Metadata } from "next";
import { cache } from "react";
import { allFontVariableClassNames, getFontPairing } from "@/lib/fonts";
import { getPublicSupabaseClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/types/content";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { CursorGlow } from "@/components/motion/CursorGlow";
import { ScrollProgressBar } from "@/components/motion/ScrollProgressBar";
import { ScrollAscentRail } from "@/components/motion/ScrollAscentRail";
import { LoadingScreen } from "@/components/motion/LoadingScreen";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";
import "./globals.css";

const HEX = /^#[0-9a-fA-F]{6}$/;
function safeHex(value: string | null | undefined, fallback: string) {
  return value && HEX.test(value) ? value : fallback;
}

// cache() dedupes this across generateMetadata() and RootLayout within the
// same request, so the settings row is only fetched once per page load.
const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  const supabase = getPublicSupabaseClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  return data;
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings?.seo_site_title ?? "SillettiX — Acquiring Businesses Built to Last";
  const description =
    settings?.seo_meta_description ??
    "SillettiX is a permanent-capital holding company acquiring profitable, founder-led businesses and operating them for decades — not private equity, not a broker.";

  return {
    metadataBase: new URL("https://sillettix.com"),
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(settings?.seo_og_image_url ? { images: [settings.seo_og_image_url] } : {}),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const pairing = getFontPairing(settings?.font_pairing_id);
  const nav = settings?.nav_items ?? [];

  const themeCss = `:root{
    --color-background:${safeHex(settings?.color_background, "#07090c")};
    --color-background-raised:${safeHex(settings?.color_background_raised, "#0d1117")};
    --color-background-overlay:${safeHex(settings?.color_background_overlay, "#11151b")};
    --color-foreground:${safeHex(settings?.color_foreground, "#f4f6f8")};
    --color-foreground-muted:${safeHex(settings?.color_foreground_muted, "#9aa4b2")};
    --color-foreground-subtle:${safeHex(settings?.color_foreground_subtle, "#5c6675")};
    --color-accent:${safeHex(settings?.color_accent, "#1ab4ff")};
    --color-accent-hover:${safeHex(settings?.color_accent_hover, "#3fc2ff")};
    --color-border:${safeHex(settings?.color_border, "#1e2530")};
    --color-border-strong:${safeHex(settings?.color_border_strong, "#2a3340")};
    --font-heading:var(${pairing.headingVar}), ui-sans-serif, sans-serif;
    --font-body:var(${pairing.bodyVar}), ui-sans-serif, sans-serif;
  }`;

  return (
    <html lang="en" className={`${allFontVariableClassNames} h-full`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-body antialiased">
        <LoadingScreen />
        <NoiseOverlay />
        <ScrollProgressBar />
        <ScrollAscentRail nav={nav} />
        <CursorGlow />
        <SmoothScrollProvider>
          <Header
            nav={nav}
            ctaLabel={settings?.header_cta_label ?? "Start a Confidential Conversation"}
            ctaHref={settings?.header_cta_href ?? "#contact"}
          />
          {children}
          <Footer
            nav={nav}
            tagline={settings?.footer_tagline ?? "Acquire. Build. Operate. Grow."}
            copyright={settings?.footer_copyright ?? `© ${new Date().getFullYear()} SillettiX. All rights reserved.`}
            contactEmail={settings?.contact_email ?? "hello@sillettix.com"}
          />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
