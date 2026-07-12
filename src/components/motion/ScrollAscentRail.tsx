"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring, useMotionValueEvent } from "framer-motion";
import { nav } from "@/content/site";
import { useActiveSection } from "@/lib/use-active-section";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

const hrefs = nav.map((item) => item.href);

export function ScrollAscentRail() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  const activeHref = useActiveSection(hrefs);
  const [percent, setPercent] = useState(0);
  const [marks, setMarks] = useState<{ href: string; offset: number }[]>([]);

  useMotionValueEvent(scrollYProgress, "change", (v) => setPercent(Math.round(v * 100)));

  useEffect(() => {
    function measure() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const next = nav
        .map((item) => {
          const el = document.querySelector(item.href);
          if (!el) return null;
          const top = el.getBoundingClientRect().top + window.scrollY;
          return { href: item.href, offset: Math.min(1, Math.max(0, top / docHeight)) };
        })
        .filter((m): m is { href: string; offset: number } => m !== null);
      setMarks(next);
    }
    measure();
    const timeout = window.setTimeout(measure, 500);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("resize", measure);
    };
  }, []);

  if (shouldReduceMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-8 top-1/2 z-40 hidden h-[38vh] -translate-y-1/2 xl:block"
    >
      <div className="relative h-full w-px bg-border">
        <motion.div
          className="absolute left-0 top-0 w-px origin-top bg-accent shadow-glow-sm"
          style={{ scaleY, height: "100%" }}
        />
        {marks.map((mark) => (
          <span
            key={mark.href}
            className={cn(
              "absolute -left-[3px] h-[7px] w-[7px] rounded-full border transition-colors duration-500",
              activeHref === mark.href
                ? "border-accent bg-accent shadow-glow-sm"
                : "border-border-strong bg-background"
            )}
            style={{ top: `${mark.offset * 100}%` }}
          />
        ))}
      </div>
      <div className="absolute left-0 top-[calc(100%+16px)] font-heading text-xs tabular-nums text-foreground-subtle">
        {String(percent).padStart(2, "0")}%
      </div>
    </div>
  );
}
