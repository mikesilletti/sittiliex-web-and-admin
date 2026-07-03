"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { GlowGridBackground } from "@/components/motion/GlowGridBackground";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { SplitText } from "@/components/motion/SplitText";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { hero } from "@/content/site";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-40 pb-32 md:pt-56 md:pb-44 min-h-screen flex items-center">
      <ParallaxImage
        src="/images/hero-skyline.jpg"
        alt=""
        className="absolute inset-0"
        imgClassName="opacity-45"
        strength={80}
        priority
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,9,12,0.55) 0%, rgba(7,9,12,0.75) 45%, var(--color-background) 92%)",
        }}
      />
      <GlowGridBackground />

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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground-subtle"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={shouldReduceMotion ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  );
}
