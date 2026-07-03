import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { WhySellToUs } from "@/components/sections/WhySellToUs";
import { IndustriesGrid } from "@/components/sections/IndustriesGrid";
import { AcquisitionProcess } from "@/components/sections/AcquisitionProcess";
import { RecentAcquisitions } from "@/components/sections/RecentAcquisitions";
import { MeetTheTeam } from "@/components/sections/MeetTheTeam";
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
        <IndustriesGrid />
        <AcquisitionProcess />
        <RecentAcquisitions />
        <MeetTheTeam />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
