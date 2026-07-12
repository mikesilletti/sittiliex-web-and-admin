// Client-safe font pairing labels for the admin theme picker — deliberately
// does NOT import next/font/google (see fonts.ts), so the admin's client
// bundle never pulls in the actual font loader module.
export const FONT_PAIRING_OPTIONS = [
  { id: "space-grotesk-inter", label: "Space Grotesk / Inter" },
  { id: "manrope-inter", label: "Manrope / Inter" },
  { id: "unbounded-plusjakarta", label: "Unbounded / Plus Jakarta Sans" },
  { id: "sora-worksans", label: "Sora / Work Sans" },
  { id: "archivo-ibmplex", label: "Archivo / IBM Plex Sans" },
  { id: "fraunces-inter", label: "Fraunces / Inter" },
] as const;
