/**
 * Public-facing company details used by the standalone compliance pages
 * (/sms, /privacy, /terms). Kept out of the CMS on purpose: these values are
 * submitted to carriers as part of the A2P 10DLC registration and must match
 * the application exactly, so they should only change deliberately in code.
 */
export const COMPANY = {
  brand: "SillettiX",
  /**
   * Registered legal entity. Taken from the consent text HighLevel renders
   * inside the A2P chat widget ("SILLETTI VENTURES LLC"), so the site matches
   * what the carrier application says. Set to null to hide the footer line.
   */
  legalEntity: "Silletti Ventures LLC" as string | null,
  email: "mike@sillettix.com",
  phone: "551-305-4030",
  phoneHref: "tel:+15513054030",
  site: "https://www.sillettix.com",
} as const;

/** Last-updated stamp shown on /privacy and /terms. */
export const LEGAL_LAST_UPDATED = "August 23, 2026";
