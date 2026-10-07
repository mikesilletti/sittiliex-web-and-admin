"use client";

import { useEffect } from "react";

/**
 * Arriving at the landing page from another page with a section hash
 * (/about → /#faq) lets the browser jump before the scroll-driven sections
 * above it have measured themselves, so the target ends up far off-screen.
 * Re-align to the hash target a few times while the layout settles, and stop
 * as soon as the visitor scrolls on their own.
 */
export function ScrollToHashOnLoad() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.length < 2) return;

    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };
    const userEvents = ["wheel", "touchstart", "keydown"] as const;
    userEvents.forEach((e) => window.addEventListener(e, cancel, { passive: true, once: true }));

    // globals.css sets `scroll-behavior: smooth` on <html>, which turns the
    // browser's own hash jump into a glide toward a stale position; jump
    // instantly while aligning, then restore it.
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    const align = () => {
      if (cancelled) return;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    };
    const timers = [0, 150, 500, 1000, 1800, 2600].map((ms) => window.setTimeout(align, ms));
    const restore = window.setTimeout(() => {
      root.style.scrollBehavior = previousBehavior;
    }, 2700);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(restore);
      root.style.scrollBehavior = previousBehavior;
      userEvents.forEach((e) => window.removeEventListener(e, cancel));
    };
  }, []);

  return null;
}
