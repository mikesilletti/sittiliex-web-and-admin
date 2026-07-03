import { Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { recentAcquisitions } from "@/content/site";

export function RecentAcquisitions() {
  return (
    <section id="acquisitions" className="py-24 md:py-32 bg-background-raised/40">
      <Container>
        <RevealOnScroll>
          <SectionHeading
            eyebrow={recentAcquisitions.eyebrow}
            heading={recentAcquisitions.heading}
            description={recentAcquisitions.body}
            align="center"
          />
        </RevealOnScroll>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {[0, 1, 2].map((i) => (
            <RevealOnScroll key={i} delay={i * 0.08}>
              <div className="group flex h-32 items-center justify-center rounded-md border border-dashed border-border-strong text-foreground-subtle transition-all duration-300 hover:border-accent/50 hover:bg-accent/5 hover:text-accent">
                <Plus size={24} className="transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll delay={0.2}>
          <div className="mt-12 flex justify-center">
            <MagneticButton>
              <ButtonLink href={recentAcquisitions.cta.href} variant="secondary">
                {recentAcquisitions.cta.label}
              </ButtonLink>
            </MagneticButton>
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
