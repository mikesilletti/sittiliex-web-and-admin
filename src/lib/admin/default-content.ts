import type { SectionContentMap, SectionType } from "@/types/content";

// Structurally valid but empty-ish starting content for a newly created
// section — the admin fills in real copy immediately after creation.
const defaults: { [K in SectionType]: SectionContentMap[K] } = {
  hero: {
    eyebrow: "",
    headlineLines: [{ text: "", accent: false }],
    subhead: "",
    primaryCta: { label: "", href: "#contact" },
    secondaryCta: { label: "", href: "#" },
    backgroundImage: "",
    backgroundImageAlt: "",
  },
  "trust-strip": {
    badges: [],
    marqueeItems: [],
  },
  "why-sell-to-us": {
    eyebrow: "",
    heading: "",
    intro: "",
    image: "",
    imageAlt: "",
    points: [],
  },
  "our-promise": {
    eyebrow: "",
    heading: "",
    body: "",
  },
  "industries-grid": {
    eyebrow: "",
    heading: "",
    industries: [],
    featuredIndustries: [],
    whatWeLookForHeading: "",
    whatWeLookFor: [],
  },
  "acquisition-process": {
    eyebrow: "",
    heading: "",
    body: "",
    image: "",
    imageAlt: "",
    steps: [],
  },
  "recent-acquisitions": {
    eyebrow: "",
    heading: "",
    body: "",
    cta: { label: "", href: "#contact" },
    placeholderImages: [],
  },
  faq: {
    eyebrow: "",
    heading: "",
    items: [],
  },
  contact: {
    eyebrow: "",
    heading: "",
    body: "",
    email: "",
    backgroundImage: "",
  },
};

export function defaultContentFor<T extends SectionType>(type: T): SectionContentMap[T] {
  return structuredClone(defaults[type]);
}
