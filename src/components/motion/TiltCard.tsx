"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

export function TiltCard({
  children,
  className,
  glow = true,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
  const spx = useSpring(px, springConfig);
  const spy = useSpring(py, springConfig);

  const rotateX = useTransform(spy, [0, 1], [7, -7]);
  const rotateY = useTransform(spx, [0, 1], [-7, 7]);
  const glowX = useTransform(spx, (v) => `${v * 100}%`);
  const glowY = useTransform(spy, (v) => `${v * 100}%`);
  const glowBackground = useTransform(
    [glowX, glowY],
    ([gx, gy]) => `radial-gradient(240px circle at ${gx} ${gy}, rgba(26,180,255,0.15), transparent 70%)`
  );

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (shouldReduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        shouldReduceMotion
          ? undefined
          : { rotateX, rotateY, transformPerspective: 800 }
      }
      className={cn(
        "group relative rounded-md border border-border bg-background-raised p-6 transition-colors duration-300 hover:border-accent/40",
        className
      )}
    >
      {glow && !shouldReduceMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glowBackground }}
        />
      )}
      <div className="relative">{children}</div>
    </motion.div>
  );
}
