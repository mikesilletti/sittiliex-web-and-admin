"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { GlowGridBackground } from "@/components/motion/GlowGridBackground";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { hero } from "@/content/site";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-40 pb-28 md:pt-52 md:pb-36">
      <GlowGridBackground />

      <Container className="relative">
        <motion.p
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-eyebrow uppercase text-accent mb-6"
        >
          {hero.eyebrow}
        </motion.p>

        <h1 className="max-w-4xl text-display-lg font-heading text-foreground text-balance">
          {hero.headlineLines.map((line, i) => (
            <motion.span
              key={line.text}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className={line.accent ? "block text-accent drop-shadow-[0_0_32px_rgba(26,180,255,0.35)]" : "block"}
            >
              {line.text}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 max-w-xl text-body-lg text-foreground-muted text-balance"
        >
          {hero.subhead}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <ButtonLink href={hero.primaryCta.href} variant="primary">
            {hero.primaryCta.label}
            <ArrowRight size={16} />
          </ButtonLink>
          <ButtonLink href={hero.secondaryCta.href} variant="secondary">
            {hero.secondaryCta.label}
          </ButtonLink>
        </motion.div>
      </Container>
    </section>
  );
}
