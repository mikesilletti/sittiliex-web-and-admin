import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { Marquee } from "@/components/motion/Marquee";
import { industries, featuredIndustries, whatWeLookFor } from "@/content/site";

export function IndustriesGrid() {
  const half = Math.ceil(industries.length / 2);
  const rowA = industries.slice(0, half);
  const rowB = industries.slice(half);

  return (
    <section id="industries" className="py-24 md:py-32 bg-background-raised/40 overflow-hidden">
      <RevealOnScroll>
        <Container>
          <SectionHeading
            eyebrow="Industries We Acquire"
            heading="Businesses We Like."
            align="center"
          />
        </Container>
      </RevealOnScroll>

      <div className="mt-14 flex flex-col gap-4">
        <Marquee durationClassName="animate-marquee [animation-duration:38s]">
          {rowA.map((industry) => (
            <span
              key={industry}
              className="inline-flex rounded-full border border-border bg-background px-6 py-3 text-sm text-foreground-muted"
            >
              {industry}
            </span>
          ))}
        </Marquee>
        <Marquee reverse durationClassName="animate-marquee [animation-duration:32s]">
          {rowB.map((industry) => (
            <span
              key={industry}
              className="inline-flex rounded-full border border-border bg-background px-6 py-3 text-sm text-foreground-muted"
            >
              {industry}
            </span>
          ))}
        </Marquee>
      </div>

      <Container>
        <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {featuredIndustries.map((industry, i) => (
            <RevealOnScroll key={industry.id} delay={i * 0.06}>
              <div className="group relative aspect-[4/5] overflow-hidden rounded-md border border-border">
                <Image
                  src={industry.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="object-cover grayscale-[40%] transition-transform duration-700 ease-out group-hover:scale-110 group-hover:grayscale-0"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent transition-opacity duration-500 group-hover:opacity-80"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-accent/10"
                />
                <span className="absolute bottom-4 left-4 right-4 text-sm font-heading font-semibold text-foreground translate-y-1 transition-transform duration-500 group-hover:translate-y-0">
                  {industry.name}
                </span>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll delay={0.2}>
          <div className="mt-16 mx-auto max-w-3xl rounded-lg border border-border bg-background p-8 md:p-10">
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
