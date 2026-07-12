import type { ComponentType } from "react";
import type { SectionContentMap, SectionType } from "@/types/content";
import { HeroForm } from "@/components/admin/section-forms/HeroForm";
import { TrustStripForm } from "@/components/admin/section-forms/TrustStripForm";
import { WhySellToUsForm } from "@/components/admin/section-forms/WhySellToUsForm";
import { OurPromiseForm } from "@/components/admin/section-forms/OurPromiseForm";
import { IndustriesGridForm } from "@/components/admin/section-forms/IndustriesGridForm";
import { AcquisitionProcessForm } from "@/components/admin/section-forms/AcquisitionProcessForm";
import { RecentAcquisitionsForm } from "@/components/admin/section-forms/RecentAcquisitionsForm";
import { FaqForm } from "@/components/admin/section-forms/FaqForm";
import { ContactForm } from "@/components/admin/section-forms/ContactForm";

export const formRegistry: {
  [K in SectionType]: ComponentType<{ id: string; content: SectionContentMap[K] }>;
} = {
  hero: HeroForm,
  "trust-strip": TrustStripForm,
  "why-sell-to-us": WhySellToUsForm,
  "our-promise": OurPromiseForm,
  "industries-grid": IndustriesGridForm,
  "acquisition-process": AcquisitionProcessForm,
  "recent-acquisitions": RecentAcquisitionsForm,
  faq: FaqForm,
  contact: ContactForm,
};
