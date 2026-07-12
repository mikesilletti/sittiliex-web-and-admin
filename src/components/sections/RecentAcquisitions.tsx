"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { RecentAcquisitionsContent } from "@/types/content";

export function RecentAcquisitions({ content: recentAcquisitions }: { content: RecentAcquisitionsContent }) {
  const shouldReduceMotion = useReducedMotion();
  const { placeholderImages } = recentAcquisitions;

  return (
    <section id="acquisitions" className="relative overflow-hidden py-24 md:py-32 bg-background-raised/40">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 55% at 50% 40%, rgba(26,180,255,0.07), transparent 70%)",
        }}
      />
      <Container className="relative">
        <RevealOnScroll>
          <SectionHeading
            eyebrow={recentAcquisitions.eyebrow}
            heading={recentAcquisitions.heading}
            description={recentAcquisitions.body}
            align="center"
          />
        </RevealOnScroll>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {[0, 1, 2].map((i) => (
            <RevealOnScroll key={i} delay={i * 0.08}>
              <div className="group relative flex h-48 flex-col justify-end overflow-hidden rounded-md border border-dashed border-border-strong transition-colors duration-300 hover:border-accent/50">
                <Image
                  src={placeholderImages[i]}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 33vw, 90vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent"
                />
                {!shouldReduceMotion && (
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent"
                    initial={{ x: "-100%" }}
                    whileInView={{ x: "100%" }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 1.6, delay: 0.3 + i * 0.15, ease: "easeInOut" }}
                  />
                )}
                <div className="relative flex items-center justify-between gap-2 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-foreground">
                      Acquisition {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="text-[11px] text-foreground-muted">Reserved</p>
                  </div>
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-background/60 text-foreground-subtle backdrop-blur-sm transition-colors duration-300 group-hover:border-accent/50 group-hover:text-accent",
                      !shouldReduceMotion && "animate-pulse-glow"
                    )}
                  >
                    <Plus size={18} className="transition-transform duration-300 group-hover:rotate-90" />
                  </span>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll delay={0.2}>
          <div className="mt-12 flex justify-center">
            <MagneticButton>
              <ButtonLink href={recentAcquisitions.cta.href} variant="secondary">
                {recentAcquisitions.cta.label}
              </ButtonLink>
            </MagneticButton>
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
