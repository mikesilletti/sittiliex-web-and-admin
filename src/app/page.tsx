import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { WhySellToUs } from "@/components/sections/WhySellToUs";
import { OurPromise } from "@/components/sections/OurPromise";
import { IndustriesGrid } from "@/components/sections/IndustriesGrid";
import { AcquisitionProcess } from "@/components/sections/AcquisitionProcess";
import { RecentAcquisitions } from "@/components/sections/RecentAcquisitions";
import { FAQ } from "@/components/sections/FAQ";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <WhySellToUs />
        <OurPromise />
        <IndustriesGrid />
        <AcquisitionProcess />
        <RecentAcquisitions />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
