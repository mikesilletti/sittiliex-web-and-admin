import type { ThemeInput } from "@/lib/admin/settings-schemas";

// The site's original design palette. The root layout falls back to these
// when a stored value is missing/invalid, and the admin theme page offers
// "Reset to default theme" using the same values.
export const DEFAULT_THEME: ThemeInput = {
  color_background: "#07090c",
  color_background_raised: "#0d1117",
  color_background_overlay: "#11151b",
  color_foreground: "#f4f6f8",
  color_foreground_muted: "#9aa4b2",
  color_foreground_subtle: "#5c6675",
  color_accent: "#1ab4ff",
  color_accent_hover: "#3fc2ff",
  color_border: "#1e2530",
  color_border_strong: "#2a3340",
  // Matches DEFAULT_FONT_PAIRING_ID in fonts.ts (kept as a literal so this
  // module never pulls in the next/font loader).
  font_pairing_id: "space-grotesk-inter",
};
