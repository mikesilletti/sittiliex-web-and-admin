export interface ProcessStep {
  id: string;
  index: number;
  title: string;
  description: string;
}

export interface TrustBadge {
  id: string;
  label: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface ValuePoint {
  id: string;
  title: string;
  description: string;
}

export interface CTAItem {
  label: string;
  href: string;
}

export interface FeaturedIndustry {
  id: string;
  name: string;
  image: string;
  alt: string;
}

// ── Per-section content shapes ──────────────────────────────────────────

export interface HeroContent {
  eyebrow: string;
  headlineLines: { text: string; accent: boolean }[];
  subhead: string;
  primaryCta: CTAItem;
  secondaryCta: CTAItem;
  backgroundImage: string;
  backgroundImageAlt: string;
  /** Optional: blank or absent shows "Scroll". */
  scrollLabel?: string;
}

export interface TrustStripContent {
  badges: TrustBadge[];
  marqueeItems: string[];
}

export interface WhySellToUsContent {
  eyebrow: string;
  heading: string;
  intro: string;
  image: string;
  imageAlt: string;
  points: ValuePoint[];
}

export interface OurPromiseContent {
  eyebrow: string;
  heading: string;
  body: string;
}

export interface IndustriesGridContent {
  eyebrow: string;
  heading: string;
  industries: string[];
  featuredIndustries: FeaturedIndustry[];
  whatWeLookForHeading: string;
  whatWeLookFor: string[];
}

export interface AcquisitionProcessContent {
  eyebrow: string;
  heading: string;
  body: string;
  image: string;
  imageAlt: string;
  steps: ProcessStep[];
}

export interface AcquisitionTile {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  alt: string;
}

export interface RecentAcquisitionsContent {
  eyebrow: string;
  heading: string;
  body: string;
  cta: CTAItem;
  /** Optional: sections saved before tiles were editable only have placeholderImages. */
  tiles?: AcquisitionTile[];
  /** Legacy image-only tiles; read as a fallback when `tiles` is absent. */
  placeholderImages?: string[];
}

export interface FaqContent {
  eyebrow: string;
  heading: string;
  items: FaqItem[];
}

export interface ContactContent {
  eyebrow: string;
  heading: string;
  body: string;
  email: string;
  /** Optional: sections saved before the field existed have no phone. */
  phone?: string;
  backgroundImage: string;
  /** Optional copy fields; blank or absent falls back to CONTACT_COPY_DEFAULTS. */
  emailLabel?: string;
  phoneLabel?: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
  companyPlaceholder?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  submittingLabel?: string;
  successHeading?: string;
  successMessage?: string;
  errorMessage?: string;
}

export type SectionType =
  | "hero"
  | "trust-strip"
  | "why-sell-to-us"
  | "our-promise"
  | "industries-grid"
  | "acquisition-process"
  | "recent-acquisitions"
  | "faq"
  | "contact";

export interface SectionContentMap {
  hero: HeroContent;
  "trust-strip": TrustStripContent;
  "why-sell-to-us": WhySellToUsContent;
  "our-promise": OurPromiseContent;
  "industries-grid": IndustriesGridContent;
  "acquisition-process": AcquisitionProcessContent;
  "recent-acquisitions": RecentAcquisitionsContent;
  faq: FaqContent;
  contact: ContactContent;
}

export interface SectionRow<T extends SectionType = SectionType> {
  id: string;
  type: T;
  sort_order: number;
  is_visible: boolean;
  content: SectionContentMap[T];
  created_at: string;
  updated_at: string;
}

// ── Global site settings (theme, SEO defaults, nav/footer/contact) ─────

export interface SiteSettings {
  id: number;
  color_background: string;
  color_background_raised: string;
  color_background_overlay: string;
  color_foreground: string;
  color_foreground_muted: string;
  color_foreground_subtle: string;
  color_accent: string;
  color_accent_hover: string;
  color_border: string;
  color_border_strong: string;
  font_pairing_id: string;
  seo_site_title: string;
  seo_meta_description: string;
  seo_og_image_url: string | null;
  site_name: string;
  contact_email: string;
  /** Nullable/absent until the contact_phone column exists; renders fall back to COMPANY.phone. */
  contact_phone: string | null;
  nav_items: NavItem[];
  header_cta_label: string;
  header_cta_href: string;
  footer_tagline: string;
  footer_copyright: string;
  updated_at: string;
}

// ── Contact form submissions (public form → admin inbox) ───────────────

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  created_at: string;
}

// ── Version history (snapshots taken before every overwrite/delete) ────

export interface SectionVersion {
  id: string;
  section_id: string;
  type: SectionType;
  content: SectionContentMap[SectionType];
  sort_order: number | null;
  is_visible: boolean | null;
  reason: "edit" | "delete" | "restore";
  created_at: string;
}

export interface SettingsVersion {
  id: string;
  scope: "theme" | "settings";
  data: Record<string, unknown>;
  created_at: string;
}
