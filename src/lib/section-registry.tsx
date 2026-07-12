import type { ComponentType } from "react";
import type { SectionContentMap, SectionType } from "@/types/content";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { WhySellToUs } from "@/components/sections/WhySellToUs";
import { OurPromise } from "@/components/sections/OurPromise";
import { IndustriesGrid } from "@/components/sections/IndustriesGrid";
import { AcquisitionProcess } from "@/components/sections/AcquisitionProcess";
import { RecentAcquisitions } from "@/components/sections/RecentAcquisitions";
import { FAQ } from "@/components/sections/FAQ";
import { Contact } from "@/components/sections/Contact";

export const sectionRegistry: {
  [K in SectionType]: ComponentType<{ content: SectionContentMap[K] }>;
} = {
  hero: Hero,
  "trust-strip": TrustStrip,
  "why-sell-to-us": WhySellToUs,
  "our-promise": OurPromise,
  "industries-grid": IndustriesGrid,
  "acquisition-process": AcquisitionProcess,
  "recent-acquisitions": RecentAcquisitions,
  faq: FAQ,
  contact: Contact,
};

export const sectionLabels: Record<SectionType, string> = {
  hero: "Hero",
  "trust-strip": "Trust Strip",
  "why-sell-to-us": "Why Sell to Us",
  "our-promise": "Our Promise",
  "industries-grid": "Industries Grid",
  "acquisition-process": "Acquisition Process",
  "recent-acquisitions": "Recent Acquisitions",
  faq: "FAQ",
  contact: "Contact",
};
