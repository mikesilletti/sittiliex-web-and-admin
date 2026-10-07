"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { frame, cancelFrame } from "framer-motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const firstPath = useRef(true);

  useEffect(() => {
    if (shouldReduceMotion) return;
    // Phones and tablets already have native momentum scrolling; running Lenis
    // there only adds a second scroll loop that can fight the finger.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function update(data: { timestamp: number }) {
      lenis.raf(data.timestamp);
    }

    frame.update(update, true);

    return () => {
      cancelFrame(update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [shouldReduceMotion]);

  // Client-side page switches keep this layout (and Lenis's remembered scroll
  // position) alive, so a new page would open mid-way down. Start each new
  // page at the top unless it was opened with a section hash.
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    if (window.location.hash) return;
    const toTop = () => {
      lenisRef.current?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    toTop();
    // Next.js runs its own post-navigation scroll after this commit; repeat
    // once the new page has painted so that can't leave it mid-way down.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(toTop);
    });
    const timer = window.setTimeout(toTop, 120);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(timer);
    };
  }, [pathname]);

  return <>{children}</>;
}
