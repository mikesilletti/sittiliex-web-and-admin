"use client";

import { useEffect, useState } from "react";

export function useActiveSection(hrefs: string[]) {
  const [activeHref, setActiveHref] = useState<string | null>(null);

  useEffect(() => {
    // Only in-page anchors name a section to observe. Nav items are CMS-authored
    // and can point at a route ("/sms"), which is not a valid CSS selector —
    // passing one to querySelector throws and takes the whole effect with it.
    const sections = hrefs
      .filter((href) => href.startsWith("#") && href.length > 1)
      .map((href) => document.querySelector(href))
      .filter((el): el is Element => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHref(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [hrefs]);

  return activeHref;
}
