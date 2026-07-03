import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/motion/TiltCard";
import { RevealImage } from "@/components/motion/RevealImage";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { whySellToUs } from "@/content/site";

export function WhySellToUs() {
  return (
    <section id="why-us" className="py-24 md:py-32 overflow-hidden">
      <Container>
        <RevealOnScroll>
          <SectionHeading
            eyebrow={whySellToUs.eyebrow}
            heading={whySellToUs.heading}
            description={whySellToUs.intro}
          />
        </RevealOnScroll>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-stretch">
          <RevealImage
            src="/images/why-us-office.jpg"
            alt="Modern office interior"
            className="lg:col-span-2 rounded-lg min-h-[320px] lg:min-h-0"
            sizes="(min-width: 1024px) 40vw, 100vw"
          />

          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {whySellToUs.points.map((point, i) => (
              <RevealOnScroll key={point.id} delay={i * 0.08}>
                <TiltCard className="h-full">
                  <h3 className="text-lg font-heading font-semibold text-foreground">
                    {point.title}
                  </h3>
                  <p className="mt-3 text-body-md text-foreground-muted">
                    {point.description}
                  </p>
                </TiltCard>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
