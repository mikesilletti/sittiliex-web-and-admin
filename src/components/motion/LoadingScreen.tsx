"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const X_MARK_PATH =
  "m980.26 532.66 23.38-25.83 14.26-15.76h.08l15.62-17.17h-27.24l-4.52 4.95-2.04 2.24-31.8 34.88-30.9-42.07h-51.29l54.52 72.42-25.15 27.58-28.94 32.2h27.56l4.8-5.31 34.25-37.84 32.48 43.15h48.87zm27.04-49.22h8.11l-46.24 50.78-3.64-4.91zm-96.66 115.05h-8.12l49.14-53.96.96 1.29 1.83 2.44.87 1.17zm52.35-46.75-12.42-16.67-35.4-47.48h13.73l29.14 39.29 12.36 16.66 35.95 48.46H993z";

export function LoadingScreen() {
  const shouldReduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const count = useMotionValue(0);
  const [displayCount, setDisplayCount] = useState(0);
  const barWidth = useTransform(count, (v) => `${v}%`);

  useEffect(() => {
    if (shouldReduceMotion) {
      // Reduced-motion preference is only knowable client-side; skipping the
      // loading screen post-mount (rather than via a lazy initial state) keeps
      // the first client render matching the SSR output.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(false);
      return;
    }

    document.body.style.overflow = "hidden";

    const unsubscribe = count.on("change", (v) => setDisplayCount(Math.round(v)));
    const controls = animate(count, 100, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onComplete: () => {
        window.setTimeout(() => setVisible(false), 300);
      },
    });

    // Safety net: requestAnimationFrame-driven animations can stall (a
    // throttled/backgrounded tab, a slow device, a browser quirk), and
    // onComplete above would then never fire, leaving this full-viewport
    // overlay permanently blocking the site. Guarantee dismissal regardless.
    const fallback = window.setTimeout(() => setVisible(false), 4000);

    return () => {
      controls.stop();
      unsubscribe();
      window.clearTimeout(fallback);
    };
  }, [shouldReduceMotion, count]);

  useEffect(() => {
    if (!visible) {
      document.body.style.overflow = "";
    }
  }, [visible]);

  if (shouldReduceMotion) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
          <motion.div
            aria-hidden="true"
            className="absolute h-[500px] w-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(26,180,255,0.25), transparent 70%)",
            }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative h-24 w-24">
            <svg viewBox="848.41 428.41 223.17 223.17" className="h-full w-full" aria-hidden="true">
              <motion.rect
                width="199.26"
                height="199.26"
                x="860.37"
                y="440.37"
                rx="46.23"
                ry="46.23"
                fill="#1ab4ff"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.path
                d={X_MARK_PATH}
                fill="none"
                stroke="#07090c"
                strokeWidth={7}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
              />
            </svg>
          </div>

          <p className="relative mt-8 font-heading text-sm uppercase tracking-[0.14em] text-foreground-muted">
            <span className="text-accent tabular-nums">{displayCount}</span>%
          </p>
          <div className="relative mt-4 h-[2px] w-40 overflow-hidden rounded-full bg-border">
            <motion.div className="h-full bg-accent shadow-glow-sm" style={{ width: barWidth }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
