"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { AcquisitionProcessContent, ProcessStep } from "@/types/content";
import { cn } from "@/lib/utils";

export function AcquisitionProcess({ content }: { content: AcquisitionProcessContent }) {
  const { eyebrow, heading, body, image, imageAlt, steps: processSteps } = content;
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const dotTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(processSteps.length - 1, Math.floor(v * processSteps.length));
    setActive(idx);
  });

  if (shouldReduceMotion) {
    return (
      <section id="process" className="py-24 md:py-32">
        <Container>
          <SectionIntro eyebrow={eyebrow} heading={heading} body={body} />
          <div className="mt-16 max-w-2xl flex flex-col gap-10">
            {processSteps.map((step) => (
              <StepBlock key={step.id} step={step} active />
            ))}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section id="process" ref={containerRef} className="relative" style={{ height: `${processSteps.length * 100}vh` }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden py-24">
        <Container>
          <SectionIntro eyebrow={eyebrow} heading={heading} body={body} />

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: stepper */}
            <div className="relative pl-16">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-4 -top-10 select-none font-heading text-8xl font-semibold text-foreground/[0.04]"
              >
                {String(active + 1).padStart(2, "0")}
              </span>
              <div className="absolute left-6 top-1 bottom-1 w-px bg-border" />
              <motion.div
                className="absolute left-6 top-1 w-px origin-top bg-accent shadow-glow-sm"
                style={{ scaleY: lineScale, height: "calc(100% - 8px)" }}
              />
              <motion.div
                aria-hidden="true"
                className="absolute left-6 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-glow-md"
                style={{ top: dotTop }}
              />

              {processSteps.map((step, i) => (
                <div key={step.id} className="relative mb-10 last:mb-0">
                  <div
                    className={cn(
                      "absolute -left-16 flex h-12 w-12 items-center justify-center rounded-full border text-sm font-heading font-semibold transition-colors duration-500",
                      i === active
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-background-raised text-foreground-subtle"
                    )}
                  >
                    {String(step.index).padStart(2, "0")}
                  </div>
                  <StepBlock step={step} active={i === active} dim={i !== active} />
                </div>
              ))}
            </div>

            {/* Right: supporting image, crossfades subtly with active step */}
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border hidden lg:block">
              <Image
                src={image}
                alt={imageAlt}
                fill
                sizes="40vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
              />
              <div className="absolute bottom-6 left-6 right-6">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-background/80 backdrop-blur px-4 py-2 text-xs uppercase tracking-wide text-accent"
                >
                  Step {active + 1} of {processSteps.length}
                </motion.div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}

function SectionIntro({ eyebrow, heading, body }: { eyebrow: string; heading: string; body: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-eyebrow uppercase text-accent mb-4">{eyebrow}</p>
      <h2 className="text-display-sm md:text-display-md font-heading text-foreground text-balance">
        {heading}
      </h2>
      <p className="mt-4 text-body-lg text-foreground-muted text-balance">{body}</p>
    </div>
  );
}

function StepBlock({
  step,
  active,
  dim,
}: {
  step: ProcessStep;
  active: boolean;
  dim?: boolean;
}) {
  return (
    <div
      className={cn(
        "transition-opacity duration-500",
        dim ? "opacity-40" : "opacity-100"
      )}
    >
      <h3
        className={cn(
          "text-lg font-heading font-semibold transition-colors duration-500",
          active ? "text-foreground" : "text-foreground-muted"
        )}
      >
        {step.title}
      </h3>
      <p className="mt-2 text-body-md text-foreground-muted">{step.description}</p>
    </div>
  );
}
