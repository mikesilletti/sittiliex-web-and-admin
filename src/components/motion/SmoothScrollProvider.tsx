"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { frame, cancelFrame } from "framer-motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function update(data: { timestamp: number }) {
      lenis.raf(data.timestamp);
    }

    frame.update(update, true);

    return () => {
      cancelFrame(update);
      lenis.destroy();
    };
  }, [shouldReduceMotion]);

  return <>{children}</>;
}
