import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { ProcessTimelineLine } from "@/components/motion/ProcessTimelineLine";
import { processSteps } from "@/content/site";

export function AcquisitionProcess() {
  return (
    <section id="process" className="py-24 md:py-32">
      <Container>
        <RevealOnScroll>
          <SectionHeading
            eyebrow="Our Acquisition Process"
            heading="We Move Fast."
            description="Selling a business shouldn't take 12 months. Our acquisition process is designed to be straightforward."
          />
        </RevealOnScroll>

        <div className="mt-16 max-w-2xl">
          <ProcessTimelineLine>
            {processSteps.map((step, i) => (
              <RevealOnScroll key={step.id} delay={i * 0.05}>
                <div className="relative pl-16">
                  <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-background-raised text-sm font-heading font-semibold text-accent">
                    {String(step.index).padStart(2, "0")}
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-foreground pt-2">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-body-md text-foreground-muted">
                    {step.description}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </ProcessTimelineLine>
        </div>
      </Container>
    </section>
  );
}
