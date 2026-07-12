import { Container } from "@/components/ui/Container";
import { TiltCard } from "@/components/motion/TiltCard";
import { RevealImage } from "@/components/motion/RevealImage";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { ScrubReveal } from "@/components/motion/ScrubReveal";
import { whySellToUs } from "@/content/site";

export function WhySellToUs() {
  return (
    <section id="why-us" className="py-24 md:py-32 overflow-hidden">
      <Container>
        <div className="max-w-2xl">
          <RevealOnScroll>
            <p className="text-eyebrow uppercase text-accent mb-4">{whySellToUs.eyebrow}</p>
          </RevealOnScroll>
          <ScrubReveal
            as="h2"
            text={whySellToUs.heading}
            className="text-display-sm md:text-display-md font-heading text-foreground"
          />
          <RevealOnScroll delay={0.1}>
            <p className="mt-4 text-body-lg text-foreground-muted text-balance">{whySellToUs.intro}</p>
          </RevealOnScroll>
        </div>

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
                <TiltCard className="relative h-full overflow-hidden">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-4 select-none font-heading text-7xl font-semibold text-foreground/[0.04]"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="relative text-lg font-heading font-semibold text-foreground">
                    {point.title}
                  </h3>
                  <p className="relative mt-3 text-body-md text-foreground-muted">
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
