import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { GlowGridBackground } from "@/components/motion/GlowGridBackground";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

/** Shared shell for the plain-prose legal pages (/privacy, /terms). */
export function LegalHeader({
  eyebrow,
  title,
  lastUpdated,
  intro,
}: {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  intro: string;
}) {
  return (
    <section className="relative overflow-hidden pt-40 pb-16 md:pt-48 md:pb-20">
      <GlowGridBackground />
      <Container className="relative">
        <p className="text-eyebrow uppercase text-accent mb-4">{eyebrow}</p>
        {/* Plain heading, no SplitText: these are reference documents people
            land on from a footer link or a carrier review, so the title should
            never depend on an animation having run. */}
        <h1 className="max-w-3xl text-display-sm md:text-display-md font-heading text-foreground text-balance">
          {title}
        </h1>
        <RevealOnScroll delay={0.35}>
          <p className="mt-6 max-w-2xl text-body-lg text-foreground-muted text-balance">{intro}</p>
        </RevealOnScroll>
        <RevealOnScroll delay={0.45}>
          <p className="mt-6 text-body-sm text-foreground-subtle">Last updated: {lastUpdated}</p>
        </RevealOnScroll>
      </Container>
    </section>
  );
}

export function LegalBody({ children }: { children: ReactNode }) {
  return (
    <section className="pb-28">
      <Container>
        <div className="max-w-3xl divide-y divide-border border-t border-border">{children}</div>
      </Container>
    </section>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <RevealOnScroll y={16}>
      <div className="py-10">
        <h2 className="font-heading text-lg font-semibold text-foreground">{heading}</h2>
        <div className="mt-4 flex flex-col gap-4 text-body-md text-foreground-muted">{children}</div>
      </div>
    </RevealOnScroll>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
