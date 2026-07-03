import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { faqs } from "@/content/site";

export function FAQ() {
  return (
    <section id="faq" className="py-24 md:py-32 bg-background-raised/40">
      <Container>
        <RevealOnScroll>
          <SectionHeading eyebrow="FAQ" heading="Common Questions." align="center" />
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <div className="mt-14 max-w-2xl mx-auto">
            <Accordion items={faqs} />
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
