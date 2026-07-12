import type { Metadata } from "next";
import { allFontVariableClassNames, getFontPairing } from "@/lib/fonts";
import { getSiteSettings } from "@/lib/site-settings";
import "./globals.css";

const HEX = /^#[0-9a-fA-F]{6}$/;
function safeHex(value: string | null | undefined, fallback: string) {
  return value && HEX.test(value) ? value : fallback;
}

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
        {children}
      </body>
    </html>
  );
}
