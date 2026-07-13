import { z } from "zod";

// Shared between settings-actions.ts (saves) and version-actions.ts
// (restores) — "use server" modules can only export async functions, so the
// schemas live here.

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color like #1ab4ff");

export const themeSchema = z.object({
  color_background: hexColor,
  color_background_raised: hexColor,
  color_background_overlay: hexColor,
  color_foreground: hexColor,
  color_foreground_muted: hexColor,
  color_foreground_subtle: hexColor,
  color_accent: hexColor,
  color_accent_hover: hexColor,
  color_border: hexColor,
  color_border_strong: hexColor,
  font_pairing_id: z.string().min(1),
});

export type ThemeInput = z.infer<typeof themeSchema>;

export const settingsSchema = z.object({
  site_name: z.string().min(1),
  contact_email: z.string().email(),
  nav_items: z.array(z.object({ label: z.string().min(1), href: z.string().min(1) })),
  header_cta_label: z.string().min(1),
  header_cta_href: z.string().min(1),
  footer_tagline: z.string(),
  footer_copyright: z.string(),
  seo_site_title: z.string().min(1),
  seo_meta_description: z.string().min(1),
  seo_og_image_url: z.string().nullable(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

export const scopeSchemas = { theme: themeSchema, settings: settingsSchema } as const;
