"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useStableViewportHeight } from "@/lib/use-stable-viewport-height";
import type { OurPromiseContent } from "@/types/content";

function Word({
  progress,
  range,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  children: string;
}) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.28em] inline-block">
      {children}
    </motion.span>
  );
}

function ScrubbedWords({
  text,
  progress,
  start,
  end,
  className,
}: {
  text: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
  className?: string;
}) {
  const words = text.split(" ");
  const span = end - start;
  return (
    <p className={className}>
      {words.map((word, i) => {
        const wordStart = start + (i / words.length) * span;
        const wordEnd = start + ((i + 1) / words.length) * span;
        return (
          <Word key={i} progress={progress} range={[wordStart, wordEnd]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
}

export function OurPromise({ content: ourPromise }: { content: OurPromiseContent }) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const eyebrowOpacity = useTransform(scrollYProgress, [0, 0.12], [0, 1]);
  const vh = useStableViewportHeight();

  if (shouldReduceMotion) {
    return (
      <section className="py-24 md:py-32">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-6 text-eyebrow uppercase text-accent">{ourPromise.eyebrow}</p>
            <p className="text-display-sm md:text-display-md font-heading text-foreground text-balance">
              {ourPromise.heading}
            </p>
            <p className="mt-8 text-body-lg text-foreground-muted text-balance">{ourPromise.body}</p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative" style={{ height: vh ? `${vh * 2.2}px` : "220svh" }}>
      <div
        className="sticky top-0 flex h-[100svh] items-center overflow-hidden"
        style={vh ? { height: `${vh}px` } : undefined}
      >
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <motion.p
              style={{ opacity: eyebrowOpacity }}
              className="mb-6 text-eyebrow uppercase text-accent"
            >
              {ourPromise.eyebrow}
            </motion.p>
            <ScrubbedWords
              text={ourPromise.heading}
              progress={scrollYProgress}
              start={0.06}
              end={0.55}
              className="flex flex-wrap justify-center font-heading text-display-md text-foreground md:text-display-lg"
            />
            <ScrubbedWords
              text={ourPromise.body}
              progress={scrollYProgress}
              start={0.58}
              end={0.96}
              className="mt-8 flex flex-wrap justify-center text-body-lg text-foreground-muted"
            />
          </div>
        </Container>
      </div>
    </section>
  );
}
