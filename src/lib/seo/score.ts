import type {
  AcquisitionProcessContent,
  ContactContent,
  FaqContent,
  IndustriesGridContent,
  SectionRow,
  SiteSettings,
  WhySellToUsContent,
} from "@/types/content";

export interface SeoCheck {
  id: string;
  label: string;
  weight: number;
  passed: boolean;
  detail: string;
}

export interface SeoScoreResult {
  score: number;
  checks: SeoCheck[];
}

// Fields that hold URLs, ids, or other non-prose strings — excluded from the
// word-count heuristic so hrefs/image paths don't inflate "body copy" length.
const NON_COPY_KEYS = new Set([
  "id",
  "href",
  "image",
  "imageAlt",
  "alt",
  "backgroundImage",
  "backgroundImageAlt",
  "email",
]);

function extractCopyStrings(value: unknown, key?: string): string[] {
  if (key && NON_COPY_KEYS.has(key)) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap((v) => extractCopyStrings(v, key));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => extractCopyStrings(v, k));
  }
  return [];
}

function countVisibleWords(sections: SectionRow[]): number {
  const text = sections.flatMap((s) => extractCopyStrings(s.content)).join(" ");
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

/**
 * Pure heuristic scorer over the current site_settings + sections data —
 * not a live crawl. Weights sum to 100.
 */
export function scoreSite(settings: SiteSettings, allSections: SectionRow[]): SeoScoreResult {
  const visible = allSections.filter((s) => s.is_visible);
  const checks: SeoCheck[] = [];

  const titleLen = settings.seo_site_title.length;
  checks.push({
    id: "title-length",
    label: "Title length (30–60 characters)",
    weight: 10,
    passed: titleLen >= 30 && titleLen <= 60,
    detail: `${titleLen} characters`,
  });

  const descLen = settings.seo_meta_description.length;
  checks.push({
    id: "meta-description-length",
    label: "Meta description length (120–160 characters)",
    weight: 10,
    passed: descLen >= 120 && descLen <= 160,
    detail: `${descLen} characters`,
  });

  const heroCount = visible.filter((s) => s.type === "hero").length;
  checks.push({
    id: "single-h1",
    label: "Exactly one visible Hero section (page H1)",
    weight: 10,
    passed: heroCount === 1,
    detail: `${heroCount} visible hero section${heroCount === 1 ? "" : "s"}`,
  });

  const nonHeroCount = visible.filter((s) => s.type !== "hero").length;
  checks.push({
    id: "heading-hierarchy",
    label: "At least 3 visible sections besides Hero",
    weight: 10,
    passed: nonHeroCount >= 3,
    detail: `${nonHeroCount} non-hero section${nonHeroCount === 1 ? "" : "s"} visible`,
  });

  let meaningfulImages = 0;
  let imagesWithAlt = 0;
  for (const s of visible) {
    if (s.type === "why-sell-to-us") {
      const c = s.content as WhySellToUsContent;
      if (c.image) {
        meaningfulImages++;
        if (c.imageAlt?.trim()) imagesWithAlt++;
      }
    }
    if (s.type === "industries-grid") {
      const c = s.content as IndustriesGridContent;
      for (const fi of c.featuredIndustries) {
        if (fi.image) {
          meaningfulImages++;
          if (fi.alt?.trim()) imagesWithAlt++;
        }
      }
    }
    if (s.type === "acquisition-process") {
      const c = s.content as AcquisitionProcessContent;
      if (c.image) {
        meaningfulImages++;
        if (c.imageAlt?.trim()) imagesWithAlt++;
      }
    }
  }
  checks.push({
    id: "image-alt-coverage",
    label: "Content images have alt text",
    weight: 20,
    passed: meaningfulImages === 0 || imagesWithAlt === meaningfulImages,
    detail: meaningfulImages === 0 ? "No content images yet" : `${imagesWithAlt}/${meaningfulImages} images have alt text`,
  });

  checks.push({
    id: "og-image",
    label: "Open Graph image set",
    weight: 10,
    passed: !!settings.seo_og_image_url,
    detail: settings.seo_og_image_url ? "Set" : "Not set",
  });

  const wordCount = countVisibleWords(visible);
  checks.push({
    id: "word-count",
    label: "At least 400 words of visible copy",
    weight: 10,
    passed: wordCount >= 400,
    detail: `${wordCount} words`,
  });

  const faqSection = visible.find((s) => s.type === "faq");
  const faqItemCount = faqSection ? (faqSection.content as FaqContent).items.length : 0;
  checks.push({
    id: "faq-depth",
    label: "Visible FAQ with 3+ questions",
    weight: 5,
    passed: !!faqSection && faqItemCount >= 3,
    detail: faqSection ? `${faqItemCount} FAQ item${faqItemCount === 1 ? "" : "s"}` : "No visible FAQ section",
  });

  const contactSection = visible.find((s) => s.type === "contact");
  const contactEmail = contactSection ? (contactSection.content as ContactContent).email : "";
  const validEmail = /^\S+@\S+\.\S+$/.test(contactEmail);
  checks.push({
    id: "contact-present",
    label: "Visible Contact section with a valid email",
    weight: 5,
    passed: !!contactSection && validEmail,
    detail: !contactSection
      ? "No visible Contact section"
      : validEmail
        ? "Present with a valid email"
        : "Present, but the email looks invalid",
  });

  checks.push({
    id: "homepage-completeness",
    label: "At least 5 visible sections",
    weight: 5,
    passed: visible.length >= 5,
    detail: `${visible.length} visible section${visible.length === 1 ? "" : "s"}`,
  });

  const titleIncludesBrand = settings.seo_site_title
    .toLowerCase()
    .includes(settings.site_name.toLowerCase());
  checks.push({
    id: "title-includes-brand",
    label: "Site title includes the brand name",
    weight: 5,
    passed: titleIncludesBrand,
    detail: titleIncludesBrand ? "Brand name present" : `Missing "${settings.site_name}"`,
  });

  const score = checks.reduce((sum, c) => sum + (c.passed ? c.weight : 0), 0);
  return { score, checks };
}
