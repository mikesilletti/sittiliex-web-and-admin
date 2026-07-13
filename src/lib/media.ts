// Shared (client-safe) rules for what image paths the site can actually
// render. next.config.ts only allowlists the Supabase bucket host for
// next/image, so anything else typed into an admin image field would throw
// at render time on the public site.
export const SITE_MEDIA_PUBLIC_PREFIX =
  "https://qomizjeefzyrfmwnxhgz.supabase.co/storage/v1/object/public/site-media/";

export const IMAGE_PATH_HINT =
  "Upload the image or use a site image path (e.g. /images/…) — external image URLs aren't supported.";

/** Empty means "not set yet"; otherwise local public/ paths or bucket uploads only. */
export function isAllowedImagePath(value: string): boolean {
  return value === "" || value.startsWith("/") || value.startsWith(SITE_MEDIA_PUBLIC_PREFIX);
}
