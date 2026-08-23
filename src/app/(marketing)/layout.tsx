import { getSiteSettings } from "@/lib/site-settings";
import { COMPANY } from "@/lib/company";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { CursorGlow } from "@/components/motion/CursorGlow";
import { ScrollProgressBar } from "@/components/motion/ScrollProgressBar";
import { ScrollAscentRail } from "@/components/motion/ScrollAscentRail";
import { LoadingScreen } from "@/components/motion/LoadingScreen";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const nav = settings?.nav_items ?? [];

  return (
    <>
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
          contactEmail={settings?.contact_email ?? COMPANY.email}
          contactPhone={COMPANY.phone}
          contactPhoneHref={COMPANY.phoneHref}
        />
      </SmoothScrollProvider>
    </>
  );
}
