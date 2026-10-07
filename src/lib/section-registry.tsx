import type { ComponentType } from "react";
import type { HomeSectionType, PageOnlySectionType, SectionContentMap, SectionType } from "@/types/content";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { WhySellToUs } from "@/components/sections/WhySellToUs";
import { OurPromise } from "@/components/sections/OurPromise";
import { IndustriesGrid } from "@/components/sections/IndustriesGrid";
import { AcquisitionProcess } from "@/components/sections/AcquisitionProcess";
import { RecentAcquisitions } from "@/components/sections/RecentAcquisitions";
import { FAQ } from "@/components/sections/FAQ";
import { Contact } from "@/components/sections/Contact";
import { FounderSpotlight } from "@/components/sections/FounderSpotlight";

/** Homepage section components. Page-only types (the About page) render on their own route. */
export const sectionRegistry: {
  [K in HomeSectionType]: ComponentType<{ content: SectionContentMap[K] }>;
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
  "founder-spotlight": FounderSpotlight,
};

export const PAGE_ONLY_TYPES: readonly PageOnlySectionType[] = ["about-page"];

export function isPageOnlyType(type: SectionType): type is PageOnlySectionType {
  return (PAGE_ONLY_TYPES as readonly SectionType[]).includes(type);
}

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
  "founder-spotlight": "Founder Spotlight",
  "about-page": "About Page",
};

/** One-line summary of what each section shows, for the admin list. */
export const sectionDescriptions: Record<SectionType, string> = {
  hero: "Big headline, intro and buttons at the top of the homepage",
  "trust-strip": "Trust badges and the scrolling banner of selling points",
  "why-sell-to-us": "\"Why sell to us\" heading, photo and the four reason cards",
  "our-promise": "The promise statement that lights up as you scroll",
  "industries-grid": "Industry photo cards, industry list and what we look for",
  "acquisition-process": "The step-by-step selling process and its photo",
  "recent-acquisitions": "Portfolio timeline and next-chapter card, also the /acquisitions page",
  faq: "Questions and answers, also the /faq page",
  contact: "Contact form copy, email and phone, also the /contact page",
  "founder-spotlight": "Michael's photo card with a link to the About page",
  "about-page": "Everything on the /about page: hero, story, playbook, Q&A and closing",
};

/** Where each section can be seen on the live site. */
export const sectionViewPaths: Record<SectionType, string> = {
  hero: "/",
  "trust-strip": "/",
  "why-sell-to-us": "/",
  "our-promise": "/",
  "industries-grid": "/",
  "acquisition-process": "/",
  "recent-acquisitions": "/acquisitions",
  faq: "/faq",
  contact: "/contact",
  "founder-spotlight": "/",
  "about-page": "/about",
};
