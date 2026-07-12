import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { ScrubReveal } from "@/components/motion/ScrubReveal";
import type { FaqContent } from "@/types/content";

export function FAQ({ content }: { content: FaqContent }) {
  return (
    <section id="faq" className="py-24 md:py-32 bg-background-raised/40">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <RevealOnScroll>
            <p className="text-eyebrow uppercase text-accent mb-4">{content.eyebrow}</p>
          </RevealOnScroll>
          <ScrubReveal
            as="h2"
            text={content.heading}
            className="justify-center text-display-sm md:text-display-md font-heading text-foreground"
          />
        </div>

        <RevealOnScroll delay={0.1}>
          <div className="mt-14 max-w-2xl mx-auto">
            <Accordion items={content.items} />
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
