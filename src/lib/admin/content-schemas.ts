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
    .array(z.object({ id: short, name: short, image: imagePath, alt: short }))
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
    .array(z.object({ id: short, name: short, subtitle: short, image: imagePath, alt: short }))
    .max(50)
    .optional(),
  placeholderImages: z.array(imagePath).max(50).optional(),
});

const faqSchema = z.object({
  eyebrow: short,
  heading: short,
  items: z.array(z.object({ id: short, question: short, answer: long })).max(50),
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
]);

export function contentSchemaFor(type: SectionType): z.ZodTypeAny {
  return schemas[type];
}
