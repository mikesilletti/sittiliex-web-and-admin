"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const ORBS = [
  { top: "10%", left: "15%", size: 420, x: [0, 40, 0], y: [0, 30, 0], duration: 18 },
  { top: "55%", left: "75%", size: 360, x: [0, -30, 0], y: [0, -40, 0], duration: 22 },
  { top: "75%", left: "25%", size: 320, x: [0, 25, 0], y: [0, -20, 0], duration: 20 },
];

export function GlowGridBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Base radial glow, top-center */}
      <div
        className={shouldReduceMotion ? "absolute inset-0" : "absolute inset-0 animate-pulse-glow"}
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(26,180,255,0.18), transparent 60%)",
        }}
      />

      {/* Fine grid lines */}
      <div
        className={shouldReduceMotion ? "absolute inset-0 opacity-40" : "absolute inset-0 opacity-40 animate-grid-drift"}
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)",
        }}
      />

      {/* Slow-drifting glow orbs */}
      {ORBS.map((orb, i) =>
        shouldReduceMotion ? (
          <div
            key={i}
            className="absolute rounded-full bg-accent/20 blur-3xl"
            style={{ top: orb.top, left: orb.left, width: orb.size, height: orb.size }}
          />
        ) : (
          <motion.div
            key={i}
            className="absolute rounded-full bg-accent/20 blur-3xl"
            style={{ top: orb.top, left: orb.left, width: orb.size, height: orb.size }}
            animate={{ x: orb.x, y: orb.y }}
            transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut" }}
          />
        )
      )}

      {/* Bottom fade into the page background so content below reads cleanly */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{ background: "linear-gradient(to bottom, transparent, var(--color-background))" }}
      />
    </div>
  );
}
