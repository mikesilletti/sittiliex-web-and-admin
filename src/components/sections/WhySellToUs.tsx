import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { whySellToUs } from "@/content/site";

export function WhySellToUs() {
  return (
    <section id="why-us" className="py-24 md:py-32">
      <Container>
        <RevealOnScroll>
          <SectionHeading
            eyebrow={whySellToUs.eyebrow}
            heading={whySellToUs.heading}
            description={whySellToUs.intro}
          />
        </RevealOnScroll>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2">
          {whySellToUs.points.map((point, i) => (
            <RevealOnScroll key={point.id} delay={i * 0.08}>
              <Card className="h-full">
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  {point.title}
                </h3>
                <p className="mt-3 text-body-md text-foreground-muted">
                  {point.description}
                </p>
              </Card>
            </RevealOnScroll>
          ))}
        </div>
      </Container>
    </section>
  );
}
