import {
  Space_Grotesk,
  Inter,
  Manrope,
  Unbounded,
  Plus_Jakarta_Sans,
  Sora,
  Work_Sans,
  Archivo,
  IBM_Plex_Sans,
  Fraunces,
  Outfit,
} from "next/font/google";

// All fonts are loaded at build time (required by next/font's static
// analysis). Only the 2 referenced by the active pairing's CSS variables
// actually get downloaded by the browser — the rest sit as unused
// @font-face rules with zero network cost.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});
const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-unbounded",
  display: "swap",
});
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plus-jakarta",
  display: "swap",
});
const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});
const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-work-sans",
  display: "swap",
});
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-archivo",
  display: "swap",
});
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

export const FONT_PAIRINGS = {
  "space-grotesk-inter": {
    label: "Space Grotesk / Inter",
    headingVar: "--font-space-grotesk",
    bodyVar: "--font-inter",
  },
  "manrope-inter": {
    label: "Manrope / Inter",
    headingVar: "--font-manrope",
    bodyVar: "--font-inter",
  },
  "unbounded-plusjakarta": {
    label: "Unbounded / Plus Jakarta Sans",
    headingVar: "--font-unbounded",
    bodyVar: "--font-plus-jakarta",
  },
  "sora-worksans": {
    label: "Sora / Work Sans",
    headingVar: "--font-sora",
    bodyVar: "--font-work-sans",
  },
  "archivo-ibmplex": {
    label: "Archivo / IBM Plex Sans",
    headingVar: "--font-archivo",
    bodyVar: "--font-ibm-plex-sans",
  },
  "fraunces-inter": {
    label: "Fraunces / Inter",
    headingVar: "--font-fraunces",
    bodyVar: "--font-inter",
  },
  "outfit-inter": {
    label: "Outfit Extra Bold / Inter",
    headingVar: "--font-outfit",
    bodyVar: "--font-inter",
    // Display headings (text-display-*) render at this weight; other
    // pairings keep the 600 default from globals.css.
    displayWeight: 800,
  },
} as const satisfies Record<
  string,
  { label: string; headingVar: string; bodyVar: string; displayWeight?: number }
>;

export type FontPairingId = keyof typeof FONT_PAIRINGS;
export const DEFAULT_FONT_PAIRING_ID: FontPairingId = "space-grotesk-inter";

type FontPairing = { label: string; headingVar: string; bodyVar: string; displayWeight?: number };

export function getFontPairing(id: string | null | undefined): FontPairing {
  return FONT_PAIRINGS[id as FontPairingId] ?? FONT_PAIRINGS[DEFAULT_FONT_PAIRING_ID];
}

export const allFontVariableClassNames = [
  spaceGrotesk,
  inter,
  manrope,
  unbounded,
  plusJakarta,
  sora,
  workSans,
  archivo,
  ibmPlexSans,
  fraunces,
  outfit,
]
  .map((f) => f.variable)
  .join(" ");
