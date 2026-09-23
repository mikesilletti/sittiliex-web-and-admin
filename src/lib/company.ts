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
  email: "deals@sillettix.com",
  phone: "+1 551-525-5019",
  phoneHref: "tel:+15515255019",
  site: "https://www.sillettix.com",
} as const;

/**
 * Turn a display phone number into a tel: href. Admin-entered numbers arrive
 * in whatever shape someone typed, so normalise to digits and assume US when
 * no country code is given.
 */
export function toTelHref(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return COMPANY.phoneHref;
  if (trimmed.startsWith("+")) return `tel:+${digits}`;
  return `tel:+${digits.length === 10 ? "1" : ""}${digits}`;
}

/** Last-updated stamp shown on /privacy and /terms. */
export const LEGAL_LAST_UPDATED = "August 23, 2026";
