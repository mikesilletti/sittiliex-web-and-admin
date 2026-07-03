import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { industries, whatWeLookFor } from "@/content/site";

export function IndustriesGrid() {
  return (
    <section id="industries" className="py-24 md:py-32 bg-background-raised/40">
      <Container>
        <RevealOnScroll>
          <SectionHeading
            eyebrow="Industries We Acquire"
            heading="Businesses We Like."
            align="center"
          />
        </RevealOnScroll>

        <div className="mt-12 flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {industries.map((industry, i) => (
            <RevealOnScroll key={industry} delay={i * 0.02} y={12}>
              <span className="inline-flex rounded-full border border-border bg-background px-5 py-2.5 text-sm text-foreground-muted transition-colors duration-200 hover:border-accent/40 hover:text-foreground">
                {industry}
              </span>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll delay={0.2}>
          <div className="mt-20 mx-auto max-w-3xl rounded-lg border border-border bg-background p-8 md:p-10">
            <h3 className="text-lg font-heading font-semibold text-foreground">
              What We Look For
            </h3>
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
