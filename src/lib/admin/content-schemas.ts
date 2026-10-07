import { z } from "zod";
import { isAllowedImagePath, IMAGE_PATH_HINT } from "@/lib/media";
import type { SectionType } from "@/types/content";

// Runtime mirrors of the *Content interfaces in src/types/content.ts.
// updateSectionContent writes parsed.data (not the raw input), so unknown
// keys are stripped and string/array bounds cap what can land in the JSONB
// column. Empty strings are allowed throughout: new sections start blank
// (see default-content.ts) and admins save progressively.
const short = z.string().max(500);
const long = z.string().max(5000);
const href = z.string().max(500);
const imagePath = z.string().max(1000).refine(isAllowedImagePath, IMAGE_PATH_HINT);
const emailOrBlank = z.union([z.literal(""), z.string().email().max(200)]);

const cta = z.object({ label: short, href });
const fact = z.object({ id: short, label: short, value: short });
// Search title/description for a section's standalone page (/faq, /contact, /acquisitions).
const pageSeo = { pageTitle: short.optional(), pageDescription: long.optional() };

const heroSchema = z.object({
  eyebrow: short,
  headlineLines: z.array(z.object({ text: short, accent: z.boolean() })).max(10),
  subhead: long,
  primaryCta: cta,
  secondaryCta: cta,
  backgroundImage: imagePath,
  backgroundImageAlt: short,
  scrollLabel: short.optional(),
});

const trustStripSchema = z.object({
  badges: z.array(z.object({ id: short, label: short })).max(50),
  marqueeItems: z.array(short).max(50),
});

const whySellToUsSchema = z.object({
  eyebrow: short,
  heading: short,
  intro: long,
  image: imagePath,
  imageAlt: short,
  points: z.array(z.object({ id: short, title: short, description: long })).max(50),
});

const ourPromiseSchema = z.object({
  eyebrow: short,
  heading: short,
  body: long,
});

const industriesGridSchema = z.object({
  eyebrow: short,
  heading: short,
  industries: z.array(short).max(50),
  featuredIndustries: z
    .array(z.object({ id: short, name: short, description: short.optional(), image: imagePath, alt: short }))
    .max(50),
  whatWeLookForHeading: short,
  whatWeLookFor: z.array(short).max(50),
});

const acquisitionProcessSchema = z.object({
  eyebrow: short,
  heading: short,
  body: long,
  image: imagePath,
  imageAlt: short,
  steps: z
    .array(z.object({ id: short, index: z.number().int(), title: short, description: long }))
    .max(50),
});

const recentAcquisitionsSchema = z.object({
  eyebrow: short,
  heading: short,
  body: long,
  cta,
  tiles: z
    .array(
      z.object({
        id: short,
        name: short,
        subtitle: short,
        image: imagePath,
        alt: short,
        status: z.enum(["founded", "acquired", "in-progress", "confidential", ""]).optional(),
      })
    )
    .max(50)
    .optional(),
  placeholderImages: z.array(imagePath).max(50).optional(),
  nextEyebrow: short.optional(),
  nextHeading: short.optional(),
  nextBody: long.optional(),
  ...pageSeo,
});

const faqSchema = z.object({
  eyebrow: short,
  heading: short,
  items: z.array(z.object({ id: short, question: short, answer: long })).max(50),
  ...pageSeo,
});

const contactSchema = z.object({
  eyebrow: short,
  heading: short,
  body: long,
  email: emailOrBlank,
  phone: short.default(""),
  backgroundImage: imagePath,
  emailLabel: short.optional(),
  phoneLabel: short.optional(),
  namePlaceholder: short.optional(),
  emailPlaceholder: short.optional(),
  companyPlaceholder: short.optional(),
  messagePlaceholder: short.optional(),
  submitLabel: short.optional(),
  submittingLabel: short.optional(),
  successHeading: short.optional(),
  successMessage: long.optional(),
  errorMessage: long.optional(),
  ...pageSeo,
});

const founderSpotlightSchema = z.object({
  eyebrow: short,
  heading: short,
  body: long,
  image: imagePath,
  imageAlt: short,
  facts: z.array(fact).max(6),
  linkLabel: short,
  linkHref: href,
});

const aboutPageSchema = z.object({
  seoTitle: short,
  seoDescription: long,
  heroBadge: short,
  headingLead: short,
  headingAccent: short,
  heroIntro: long,
  heroImage: imagePath,
  heroImageAlt: short,
  heroFacts: z.array(fact).max(6),
  heroCta: cta,
  statement: long,
  storyImage: imagePath,
  storyImageAlt: short,
  storyCaption: short,
  chapters: z.array(z.object({ id: short, tag: short, title: short, body: long })).max(20),
  playbookEyebrow: short,
  playbookHeading: short,
  playbookIntro: long,
  playbook: z.array(z.object({ id: short, title: short, description: long })).max(20),
  qaEyebrow: short,
  qaHeading: short,
  qaInitials: z.string().max(10),
  qa: z.array(z.object({ id: short, question: short, answer: long })).max(20),
  ctaEyebrow: short,
  ctaHeading: short,
  ctaBody: long,
  ctaImage: imagePath,
  ctaButton: cta,
  ctaPhoneLabel: short,
});

const schemas: Record<SectionType, z.ZodTypeAny> = {
  hero: heroSchema,
  "trust-strip": trustStripSchema,
  "why-sell-to-us": whySellToUsSchema,
  "our-promise": ourPromiseSchema,
  "industries-grid": industriesGridSchema,
  "acquisition-process": acquisitionProcessSchema,
  "recent-acquisitions": recentAcquisitionsSchema,
  faq: faqSchema,
  contact: contactSchema,
  "founder-spotlight": founderSpotlightSchema,
  "about-page": aboutPageSchema,
};

export const sectionTypeSchema = z.enum([
  "hero",
  "trust-strip",
  "why-sell-to-us",
  "our-promise",
  "industries-grid",
  "acquisition-process",
  "recent-acquisitions",
  "faq",
  "contact",
  "founder-spotlight",
  "about-page",
]);

export function contentSchemaFor(type: SectionType): z.ZodTypeAny {
  return schemas[type];
}
