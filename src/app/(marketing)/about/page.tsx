import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ScrubStatement } from "@/components/about/ScrubStatement";
import { getSiteSettings } from "@/lib/site-settings";
import { COMPANY, toTelHref } from "@/lib/company";
import { getSectionContent } from "@/lib/sections";
import { ABOUT_PAGE_DEFAULTS } from "@/lib/page-content-defaults";
import type { AboutPageContent } from "@/types/content";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getAboutContent();
  return {
    title: c.seoTitle || ABOUT_PAGE_DEFAULTS.seoTitle,
    description: c.seoDescription || ABOUT_PAGE_DEFAULTS.seoDescription,
    alternates: { canonical: "/about" },
    openGraph: c.heroImage ? { images: [c.heroImage] } : undefined,
  };
}

export const revalidate = 300;

// Portraits are large on screen; 75 (the default) visibly softens them.
const PHOTO_QUALITY = 90;

/** The About page's content row, or the built-in copy if it hasn't been created yet. */
async function getAboutContent(): Promise<AboutPageContent> {
  return (await getSectionContent("about-page")) ?? ABOUT_PAGE_DEFAULTS;
}

export default async function AboutPage() {
  const [settings, c] = await Promise.all([getSiteSettings(), getAboutContent()]);
  const phone = settings?.contact_phone || COMPANY.phone;

  return (
    <main className="overflow-clip">
      {/* ── Hero: full-bleed portrait ─────────────────────────── */}
      <section className="relative lg:min-h-[100svh]">
        <div className="relative h-[70svh] w-full lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-[56%] lg:[mask-image:linear-gradient(to_right,black_55%,transparent_99%)]">
          <Image
            src={c.heroImage || ABOUT_PAGE_DEFAULTS.heroImage}
            quality={PHOTO_QUALITY}
            alt={c.heroImageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover object-[50%_25%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent lg:bg-[linear-gradient(to_right,transparent_30%,rgb(7_9_12/0.6)_70%,var(--color-background)_96%)]" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background/80 to-transparent" />
        </div>

        <Container className="relative lg:flex lg:min-h-[100svh] lg:items-center">
          <div className="-mt-28 pb-20 lg:ml-auto lg:mt-0 lg:w-[48%] lg:py-32">
            <RevealOnScroll>
              <p className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-background/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                {c.heroBadge}
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.05}>
              <h1 className="mt-6 font-heading text-6xl font-extrabold leading-[0.95] tracking-tight text-foreground md:text-7xl xl:text-8xl">
                {c.headingLead} <span className="text-accent">{c.headingAccent}</span>
              </h1>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <p className="mt-6 max-w-lg text-xl leading-relaxed text-foreground-muted md:text-2xl">
                {c.heroIntro}
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.15}>
              <dl
                className="mt-10 grid max-w-lg divide-x divide-border border-y border-border"
                style={{ gridTemplateColumns: `repeat(${Math.max(c.heroFacts.length, 1)}, minmax(0, 1fr))` }}
              >
                {c.heroFacts.map((fact) => (
                  <div key={fact.id} className="px-4 py-4 first:pl-0">
                    <dt className="text-[11px] uppercase tracking-widest text-foreground-subtle">{fact.label}</dt>
                    <dd className="mt-1 font-heading text-lg font-bold text-foreground">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </RevealOnScroll>
            <RevealOnScroll delay={0.2}>
              <div className="mt-10 flex flex-wrap gap-3">
                <MagneticButton>
                  <ButtonLink href={c.heroCta.href || "/contact"} variant="primary">
                    {c.heroCta.label} <ArrowRight size={16} />
                  </ButtonLink>
                </MagneticButton>
                <ButtonLink href={toTelHref(phone)} variant="secondary">
                  <Phone size={16} /> {phone}
                </ButtonLink>
              </div>
            </RevealOnScroll>
          </div>
        </Container>
      </section>

      {/* ── Statement ─────────────────────────────────────────── */}
      <section className="border-t border-border py-28 md:py-40">
        <Container>
          <ScrubStatement text={c.statement} />
        </Container>
      </section>

      {/* ── Story: pinned photo + timeline ────────────────────── */}
      <section className="border-t border-border py-24 md:py-32">
        <Container>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <RevealOnScroll>
                <div className="relative h-[60svh] overflow-hidden rounded-2xl lg:h-[calc(100svh-9rem)]">
                  <Image
                    src={c.storyImage || ABOUT_PAGE_DEFAULTS.storyImage}
                    quality={PHOTO_QUALITY}
                    alt={c.storyImageAlt}
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover object-[50%_20%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  <p className="absolute bottom-6 left-6 right-6 font-heading text-2xl font-bold text-foreground">
                    {c.storyCaption}
                  </p>
                </div>
              </RevealOnScroll>
            </div>

            <ol className="relative flex flex-col gap-16 border-l border-border pl-8 lg:gap-24 lg:py-10">
              {c.chapters.map((chapter, i) => (
                <RevealOnScroll key={chapter.id}>
                  <li className="relative">
                    <span className="absolute -left-[45px] top-1 flex h-7 w-7 items-center justify-center rounded-full border border-accent bg-background font-heading text-xs font-bold text-accent">
                      {i + 1}
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">{chapter.tag}</p>
                    <h2 className="mt-3 font-heading text-3xl font-bold leading-tight text-foreground md:text-4xl">
                      {chapter.title}
                    </h2>
                    <p className="mt-4 text-body-lg leading-relaxed text-foreground-muted">{chapter.body}</p>
                  </li>
                </RevealOnScroll>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* ── Playbook ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-border py-24 md:py-32">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(26,180,255,0.10), transparent 70%)" }}
        />
        <Container className="relative">
          <RevealOnScroll>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-eyebrow uppercase text-accent">{c.playbookEyebrow}</p>
              <h2 className="mt-4 text-display-sm md:text-display-md font-heading text-foreground text-balance">
                {c.playbookHeading}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-body-lg text-foreground-muted text-balance">
                {c.playbookIntro}
              </p>
            </div>
          </RevealOnScroll>
          <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {c.playbook.map((item, i) => (
              <RevealOnScroll key={item.id} delay={i * 0.08}>
                <div className="group relative border-t-2 border-border pt-6 transition-colors duration-500 hover:border-accent">
                  <span className="font-heading text-5xl font-extrabold text-accent/30 transition-colors duration-500 group-hover:text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-xl font-heading font-bold text-foreground">{item.title}</h3>
                  <p className="mt-3 text-body-md leading-relaxed text-foreground-muted">{item.description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Owner to owner Q&A ────────────────────────────────── */}
      <section className="border-t border-border bg-background-raised/40 py-24 md:py-32">
        <Container>
          <RevealOnScroll>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-eyebrow uppercase text-accent">{c.qaEyebrow}</p>
              <h2 className="mt-4 text-display-sm md:text-display-md font-heading text-foreground">
                {c.qaHeading}
              </h2>
            </div>
          </RevealOnScroll>
          <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
            {c.qa.map((item, i) => (
              <RevealOnScroll key={item.id} delay={i * 0.06}>
                <div className="h-full bg-background p-8 md:p-10">
                  <p className="font-heading text-xl font-bold text-foreground">&ldquo;{item.question}&rdquo;</p>
                  <p className="mt-4 flex gap-3 text-body-md leading-relaxed text-foreground-muted">
                    {c.qaInitials && (
                      <span className="mt-0.5 shrink-0 font-heading text-sm font-bold text-accent">{c.qaInitials}</span>
                    )}
                    {item.answer}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Closing CTA over photo ────────────────────────────── */}
      <section className="relative overflow-hidden">
        {c.ctaImage && <Image src={c.ctaImage} alt="" fill sizes="100vw" className="object-cover opacity-35" />}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <Container className="relative py-28 md:py-40">
          <RevealOnScroll>
            <div className="max-w-2xl">
              <p className="text-eyebrow uppercase text-accent">{c.ctaEyebrow}</p>
              <h2 className="mt-4 font-heading text-5xl font-extrabold leading-[1.02] tracking-tight text-foreground md:text-7xl">
                {c.ctaHeading}
              </h2>
              <p className="mt-6 max-w-xl text-body-lg text-foreground-muted">{c.ctaBody}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <MagneticButton>
                  <ButtonLink href={c.ctaButton.href || "/contact"} variant="primary">
                    {c.ctaButton.label} <ArrowRight size={16} />
                  </ButtonLink>
                </MagneticButton>
                <ButtonLink href={toTelHref(phone)} variant="secondary">
                  <Phone size={16} /> {c.ctaPhoneLabel ? `${c.ctaPhoneLabel} ${phone}` : phone}
                </ButtonLink>
              </div>
            </div>
          </RevealOnScroll>
        </Container>
      </section>
    </main>
  );
}
