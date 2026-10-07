"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";

function Word({ progress, range, accent, children }: {
  progress: MotionValue<number>;
  range: [number, number];
  accent: boolean;
  children: string;
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className={accent ? "text-accent" : undefined}>
      {children}{" "}
    </motion.span>
  );
}

/**
 * A large statement whose words light up as it scrolls through the viewport.
 * Words wrapped in *asterisks* render in the accent color.
 */
export function ScrubStatement({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });

  const words = text.split(" ").map((raw) => ({
    word: raw.replace(/\*/g, ""),
    accent: raw.startsWith("*"),
  }));

  const className =
    "mx-auto max-w-5xl text-center font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance";

  if (shouldReduceMotion) {
    return (
      <p className={className}>
        {words.map(({ word, accent }, i) => (
          <span key={i} className={accent ? "text-accent" : undefined}>
            {word}{" "}
          </span>
        ))}
      </p>
    );
  }

  return (
    <p ref={ref} className={className}>
      {words.map(({ word, accent }, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} accent={accent}>
          {word}
        </Word>
      ))}
    </p>
  );
}
