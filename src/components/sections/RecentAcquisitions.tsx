"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Lock, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { PORTFOLIO_NEXT_DEFAULTS, PORTFOLIO_STATUS_LABELS, acquisitionTiles } from "@/lib/content-defaults";
import type { PortfolioStatus, RecentAcquisitionsContent } from "@/types/content";

const STATUS_STYLE: Record<PortfolioStatus, string> = {
  founded: "bg-accent text-background",
  acquired: "bg-emerald-400/90 text-background",
  "in-progress": "bg-amber-400/90 text-background",
  confidential: "bg-foreground/15 text-foreground",
};

function StatusPill({ status }: { status: PortfolioStatus }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest",
        STATUS_STYLE[status]
      )}
    >
      {status === "founded" && <Sparkles size={10} />}
      {status === "confidential" && <Lock size={10} />}
      {PORTFOLIO_STATUS_LABELS[status]}
    </span>
  );
}

function StepNumber({ n, muted }: { n: number; muted?: boolean }) {
  return (
    <div
      className={cn(
        "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border bg-background text-sm font-heading font-bold",
        muted ? "border-dashed border-foreground-subtle text-foreground-subtle" : "border-accent text-accent"
      )}
    >
      {String(n).padStart(2, "0")}
    </div>
  );
}

export function RecentAcquisitions({ content }: { content: RecentAcquisitionsContent }) {
  const shouldReduceMotion = useReducedMotion();
  const tiles = acquisitionTiles(content);
  const nextEyebrow = content.nextEyebrow || PORTFOLIO_NEXT_DEFAULTS.nextEyebrow;
  const nextHeading = content.nextHeading || PORTFOLIO_NEXT_DEFAULTS.nextHeading;
  const nextBody = content.nextBody || PORTFOLIO_NEXT_DEFAULTS.nextBody;
  const columns = tiles.length + 1;

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
          <SectionHeading eyebrow={content.eyebrow} heading={content.heading} description={content.body} align="center" />
        </RevealOnScroll>

        <div className="relative mx-auto mt-16 max-w-6xl">
          {/* Timeline rail behind the step numbers (desktop only). */}
          <motion.div
            aria-hidden="true"
            className="absolute left-0 right-0 top-6 hidden h-px origin-left bg-gradient-to-r from-accent via-accent/40 to-border lg:block"
            initial={shouldReduceMotion ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />

          <div
            className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:gap-8 lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
            style={{ "--cols": columns } as React.CSSProperties}
          >
            {tiles.map((tile, i) => (
              <RevealOnScroll key={tile.id} delay={i * 0.1}>
                <div className="flex h-full flex-col">
                  <StepNumber n={i + 1} />
                  <div className="group mt-6 flex flex-1 flex-col overflow-hidden rounded-lg border border-border-strong bg-background-raised transition-colors duration-300 hover:border-accent/40">
                    <div className="relative h-40 overflow-hidden bg-background-overlay">
                      {tile.image && (
                        <Image
                          src={tile.image}
                          alt={tile.alt}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 90vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      {tile.status && <StatusPill status={tile.status} />}
                      <h3 className="mt-3 text-lg font-heading font-bold text-foreground">{tile.name}</h3>
                      {tile.subtitle && (
                        <p className="mt-1 text-xs leading-relaxed text-foreground-muted">{tile.subtitle}</p>
                      )}
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}

            <RevealOnScroll delay={tiles.length * 0.1}>
              <div className="flex h-full flex-col">
                <StepNumber n={tiles.length + 1} muted />
                <a
                  href={content.cta.href || "#contact"}
                  className="group mt-6 flex min-h-64 flex-1 flex-col justify-center rounded-lg border border-dashed border-accent/40 bg-accent/5 p-6 transition-colors duration-300 hover:bg-accent/10 focus-ring"
                >
                  <p className="text-xs uppercase tracking-widest text-accent">{nextEyebrow}</p>
                  <h3 className="mt-2 text-2xl font-heading font-extrabold text-foreground">{nextHeading}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-foreground-muted">{nextBody}</p>
                  {content.cta.label && (
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                      {content.cta.label}
                      <ArrowUpRight
                        size={14}
                        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  )}
                </a>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </Container>
    </section>
  );
}
