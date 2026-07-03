"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

export function ProcessTimelineLine({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={containerRef} className="relative">
      {/* track */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
      {/* glow fill, scales down from top as the section transits the viewport */}
      <motion.div
        className="absolute left-6 top-0 w-px origin-top bg-accent shadow-glow-sm"
        style={{ scaleY, height: "100%" }}
      />
      <div className="flex flex-col gap-12">{children}</div>
    </div>
  );
}
