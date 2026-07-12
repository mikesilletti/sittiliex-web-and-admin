"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { Marquee } from "@/components/motion/Marquee";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { IndustriesGridContent, FeaturedIndustry } from "@/types/content";

function IndustryTile({ industry }: { industry: FeaturedIndustry }) {
  return (
    <div className="group relative aspect-[4/5] overflow-hidden rounded-md border border-border">
      <Image
        src={industry.image}
        alt={industry.alt}
        fill
        sizes="(min-width: 1024px) 32vw, (min-width: 640px) 45vw, 78vw"
        className="object-cover grayscale-[40%] transition-transform duration-700 ease-out group-hover:scale-110 group-hover:grayscale-0"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent transition-opacity duration-500 group-hover:opacity-80"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-accent/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <span className="absolute bottom-4 left-4 right-4 translate-y-1 text-sm font-heading font-semibold text-foreground transition-transform duration-500 group-hover:translate-y-0">
        {industry.name}
      </span>
    </div>
  );
}

export function IndustriesGrid({ content }: { content: IndustriesGridContent }) {
  const { eyebrow, heading, industries, featuredIndustries, whatWeLookForHeading, whatWeLookFor } = content;
  const half = Math.ceil(industries.length / 2);
  const rowA = industries.slice(0, half);
  const rowB = industries.slice(half);

  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [pinHeight, setPinHeight] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  useEffect(() => {
    function measure() {
      if (!trackRef.current || !viewportRef.current) return;
      // The track has no width of its own — it's sized to its content, so its
      // scrollWidth must be compared against the clipping viewport's width,
      // not against itself (which is always equal and yields a distance of 0).
      const horizontalDistance = Math.max(
        0,
        trackRef.current.scrollWidth - viewportRef.current.clientWidth
      );
      setDistance(horizontalDistance);
      // Scroll distance matches the horizontal distance 1:1 (plus one viewport of
      // settle room) so the pin never runs longer than the cards actually need to travel.
      setPinHeight(horizontalDistance + window.innerHeight);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section id="industries" className="bg-background-raised/40 py-24 md:py-32">
      <RevealOnScroll>
        <Container>
          <SectionHeading eyebrow={eyebrow} heading={heading} align="center" />
        </Container>
      </RevealOnScroll>

      <div className="mt-14 flex flex-col gap-4">
        <Marquee durationClassName="animate-marquee [animation-duration:38s]">
          {rowA.map((industry) => (
            <span
              key={industry}
              className="inline-flex rounded-full border border-border bg-background px-6 py-3 text-sm text-foreground-muted"
            >
              {industry}
            </span>
          ))}
        </Marquee>
        <Marquee reverse durationClassName="animate-marquee [animation-duration:32s]">
          {rowB.map((industry) => (
            <span
              key={industry}
              className="inline-flex rounded-full border border-border bg-background px-6 py-3 text-sm text-foreground-muted"
            >
              {industry}
            </span>
          ))}
        </Marquee>
      </div>

      {shouldReduceMotion ? (
        <Container>
          <div className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
            {featuredIndustries.map((industry, i) => (
              <RevealOnScroll key={industry.id} delay={i * 0.06}>
                <IndustryTile industry={industry} />
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      ) : (
        <div
          ref={sectionRef}
          className="relative mt-20"
          style={{ height: pinHeight > 0 ? `${pinHeight}px` : `${featuredIndustries.length * 30}vh` }}
        >
          <div ref={viewportRef} className="sticky top-0 flex h-screen items-center overflow-hidden">
            <motion.div ref={trackRef} style={{ x }} className="flex gap-5 pl-6 md:pl-10">
              {featuredIndustries.map((industry) => (
                <div key={industry.id} className="w-[78vw] max-w-[420px] shrink-0 sm:w-[45vw] lg:w-[32vw]">
                  <IndustryTile industry={industry} />
                </div>
              ))}
              <div aria-hidden="true" className="w-6 shrink-0" />
            </motion.div>
          </div>
        </div>
      )}

      <Container>
        <RevealOnScroll delay={0.2}>
          <div className="mx-auto mt-16 max-w-3xl rounded-lg border border-border bg-background p-8 md:p-10">
            <h3 className="text-lg font-heading font-semibold text-foreground">{whatWeLookForHeading}</h3>
            <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {whatWeLookFor.map((item) => (
                <li key={item} className="flex items-start gap-3 text-body-md text-foreground-muted">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
