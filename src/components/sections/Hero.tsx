"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { GlowGridBackground } from "@/components/motion/GlowGridBackground";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { SplitText } from "@/components/motion/SplitText";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { HERO_SCROLL_LABEL_DEFAULT } from "@/lib/content-defaults";
import type { HeroContent } from "@/types/content";

export function Hero({ content }: { content: HeroContent }) {
  const hero = content;
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const vignetteOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.7]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pt-40 pb-32 md:pt-56 md:pb-44 min-h-screen flex items-center"
    >
      <motion.div
        className="absolute inset-0"
        style={shouldReduceMotion ? undefined : { scale: imageScale }}
      >
        <ParallaxImage
          src={hero.backgroundImage}
          alt={hero.backgroundImageAlt}
          className="absolute inset-0"
          imgClassName="opacity-80"
          strength={80}
          priority
        />
      </motion.div>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, var(--color-background) 5%, rgba(7,9,12,0.75) 35%, rgba(7,9,12,0.25) 70%, rgba(7,9,12,0.55) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,9,12,0.35) 0%, transparent 30%, transparent 70%, var(--color-background) 100%)",
        }}
      />
      <GlowGridBackground />
      {!shouldReduceMotion && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-background"
          style={{ opacity: vignetteOpacity }}
        />
      )}

      <motion.div style={shouldReduceMotion ? undefined : { opacity: contentOpacity, y: contentY }}>
        <Container className="relative">
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 text-eyebrow uppercase text-accent mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {hero.eyebrow}
          </motion.p>

          <h1 className="max-w-4xl text-display-lg font-heading text-foreground text-balance">
            {hero.headlineLines.map((line) => (
              <span
                key={line.text}
                className={
                  line.accent
                    ? "block text-accent drop-shadow-[0_0_32px_rgba(26,180,255,0.35)]"
                    : "block"
                }
              >
                <SplitText text={line.text} delay={0.1} />
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 max-w-xl text-body-lg text-foreground-muted text-balance"
          >
            {hero.subhead}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <MagneticButton>
              <ButtonLink href={hero.primaryCta.href} variant="primary">
                {hero.primaryCta.label}
                <ArrowRight size={16} />
              </ButtonLink>
            </MagneticButton>
            <MagneticButton>
              <ButtonLink href={hero.secondaryCta.href} variant="secondary">
                {hero.secondaryCta.label}
              </ButtonLink>
            </MagneticButton>
          </motion.div>
        </Container>
      </motion.div>

      <motion.div
        style={shouldReduceMotion ? undefined : { opacity: contentOpacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="flex flex-col items-center gap-2 text-foreground-subtle"
        >
          <span className="text-xs uppercase tracking-widest">
            {hero.scrollLabel ?? HERO_SCROLL_LABEL_DEFAULT}
          </span>
          <motion.div
            animate={shouldReduceMotion ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={18} />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
