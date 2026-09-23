import type { AcquisitionTile, ContactContent, RecentAcquisitionsContent } from "@/types/content";

// Fallbacks for optional copy fields added after sections were first seeded.
// Shared by the public components (what renders) and the admin forms (what the
// inputs start with), so an untouched field shows the same text in both.

export const HERO_SCROLL_LABEL_DEFAULT = "Scroll";

export const PORTFOLIO_NEXT_DEFAULTS = {
  nextEyebrow: "Next chapter",
  nextHeading: "Your business?",
  nextBody: "We're actively acquiring home services businesses.",
} as const;

export const PORTFOLIO_STATUS_LABELS = {
  founded: "Founded",
  acquired: "Acquired",
  "in-progress": "In Progress",
  confidential: "Confidential",
} as const;

export const CONTACT_COPY_DEFAULTS = {
  emailLabel: "Prefer email?",
  phoneLabel: "Rather talk?",
  namePlaceholder: "Your name",
  emailPlaceholder: "Email address",
  companyPlaceholder: "Company (optional)",
  messagePlaceholder: "Tell us about your business",
  submitLabel: "Send Message",
  submittingLabel: "Sending…",
  successHeading: "Message received.",
  successMessage: "Thank you for reaching out — we'll be in touch soon, in complete confidence.",
  errorMessage: "Something went wrong — please try again or email us directly.",
} satisfies Partial<Record<keyof ContactContent, string>>;

export type ContactCopyKey = keyof typeof CONTACT_COPY_DEFAULTS;

export function contactCopy(content: ContactContent, key: ContactCopyKey): string {
  return content[key] || CONTACT_COPY_DEFAULTS[key];
}

/**
 * Tiles to render/edit. Sections saved before tiles were editable only have
 * placeholderImages, which rendered as "Acquisition 01…03 / Reserved".
 */
export function acquisitionTiles(content: RecentAcquisitionsContent): AcquisitionTile[] {
  if (content.tiles) return content.tiles;
  return (content.placeholderImages ?? []).slice(0, 3).map((image, i) => ({
    id: `tile-${i + 1}`,
    name: `Acquisition ${String(i + 1).padStart(2, "0")}`,
    subtitle: "Reserved",
    image,
    alt: "",
  }));
}
