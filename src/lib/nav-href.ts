/**
 * Landing-page sections that also exist as their own page. A "#contact"-style
 * link keeps scrolling in place on the homepage, but elsewhere it goes to the
 * standalone page instead of bouncing back to the homepage.
 */
const SECTION_PAGES: Record<string, string> = {
  "#acquisitions": "/acquisitions",
  "#faq": "/faq",
  "#contact": "/contact",
};

export function navHref(href: string, pathname: string): string {
  if (!href.startsWith("#") || href.length < 2) return href;
  if (pathname === "/") return href;
  return SECTION_PAGES[href] ?? `/${href}`;
}

/** Internal routes navigate client-side (no full reload, no loading screen). */
export function isInternalRoute(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}
