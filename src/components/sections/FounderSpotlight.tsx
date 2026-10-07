import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import type { FounderSpotlightContent } from "@/types/content";

/** Homepage teaser for the founder, linking through to /about. */
export function FounderSpotlight({ content }: { content: FounderSpotlightContent }) {
  return (
    <section aria-labelledby="founder-spotlight-heading" className="py-20 md:py-28">
      <Container>
        <RevealOnScroll>
          <div className={`relative mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 overflow-clip rounded-2xl border border-border-strong bg-background-raised p-6 sm:p-8 ${content.image ? "md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" : ""} md:gap-12 md:p-10`}>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
            />

            {content.image && (
              <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-xl md:max-w-none">
                <Image
                  src={content.image}
                  alt={content.imageAlt}
                  fill
                  quality={90}
                  sizes="(min-width: 768px) 340px, 320px"
                  className="object-cover object-[50%_20%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>
            )}

            <div className="relative">
              {content.eyebrow && <p className="text-eyebrow uppercase text-accent">{content.eyebrow}</p>}
              <h2
                id="founder-spotlight-heading"
                className="mt-3 font-heading text-3xl font-extrabold leading-tight text-foreground md:text-5xl"
              >
                {content.heading}
              </h2>
              <p className="mt-4 text-body-lg leading-relaxed text-foreground-muted">{content.body}</p>

              {content.facts.length > 0 && (
                <dl
                  className="mt-6 grid divide-x divide-border border-y border-border"
                  style={{ gridTemplateColumns: `repeat(${content.facts.length}, minmax(0, 1fr))` }}
                >
                  {content.facts.map((fact) => (
                    <div key={fact.id} className="px-3 py-3 first:pl-0">
                      <dt className="text-[10px] uppercase tracking-widest text-foreground-subtle sm:text-[11px]">
                        {fact.label}
                      </dt>
                      <dd className="mt-1 font-heading text-sm font-bold text-foreground sm:text-base">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {content.linkLabel && (
                <Link
                  href={content.linkHref || "/about"}
                  className="group focus-ring mt-7 inline-flex items-center gap-2 rounded-sm font-semibold text-accent hover:text-accent-hover"
                >
                  {content.linkLabel}
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
