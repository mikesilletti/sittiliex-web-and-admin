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

export const metadata: Metadata = {
  title: "About Michael Silletti | SillettiX",
  description:
    "Meet Michael Silletti, the operator who built and scaled Clensy with his own systems and sales playbook. Now he buys good businesses, makes them great and takes them to the next level.",
  alternates: { canonical: "/about" },
  openGraph: { images: ["/images/michael-silletti-hero-4k.webp"] },
};

export const revalidate = 300;

// Portraits are large on screen; 75 (the default) visibly softens them.
const PHOTO_QUALITY = 90;

const STORY = [
  {
    tag: "The builder",
    title: "He built Clensy. Then he scaled it fast.",
    body: "Michael didn't inherit a playbook. He wrote one. At Clensy he built the systems and procedures from scratch: hiring, training, scheduling, quality control and pricing. Then he used them to scale the company quickly without losing the standard customers counted on.",
  },
  {
    tag: "The operating system",
    title: "Every number tracked. Every process automated.",
    body: "Michael runs businesses on data. Clear KPIs for every role and every job, dashboards that show exactly what's working, and technology that automates the busywork: follow-ups, scheduling, invoicing and reporting. Paired with his sales and marketing background, it turns a good reputation into predictable growth.",
  },
  {
    tag: "The acquirer",
    title: "Now he does it for businesses like yours.",
    body: "SillettiX buys good, owner-built businesses and makes them great. It brings the same systems, technology and growth playbook that built Clensy and takes each company to the next level.",
  },
];

const PLAYBOOK = [
  {
    title: "Systems & procedures",
    body: "Documented playbooks for hiring, training, operations and quality, so the business runs on systems, not on one person.",
  },
  {
    title: "KPIs on everything",
    body: "Clear numbers for every role, every job and every customer. Decisions come from data, not guesswork.",
  },
  {
    title: "Tech & automation",
    body: "Modern software automates follow-ups, scheduling, invoicing and reporting, which frees the team to do great work.",
  },
  {
    title: "Built to scale",
    body: "Predictable lead flow, more capacity, new services. Growth that compounds because the foundation is built to hold it.",
  },
];

const QA = [
  {
    q: "What happens to my team?",
    a: "They stay, and they get better tools, clearer systems and more support. Your people are the business.",
  },
  {
    q: "What will you actually change?",
    a: "I keep what works and build on it: systems that take pressure off, clear goals for every role, and technology that automates the busywork so your team can focus on customers.",
  },
  {
    q: "Who will I actually be talking to?",
    a: "Me. No layers, no games. You'll get straight answers and know where you stand quickly.",
  },
  {
    q: "Is this private equity in disguise?",
    a: "No. There's no fund behind me pushing to cut costs and resell fast. I'm an operator. I buy good companies to build them up, not to strip them down.",
  },
];

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const phone = settings?.contact_phone || COMPANY.phone;

  return (
    <main className="overflow-clip">
      {/* ── Hero: full-bleed portrait ─────────────────────────── */}
      <section className="relative lg:min-h-[100svh]">
        <div className="relative h-[70svh] w-full lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-[56%] lg:[mask-image:linear-gradient(to_right,black_55%,transparent_99%)]">
          <Image
            src="/images/michael-silletti-hero-4k.webp"
            quality={PHOTO_QUALITY}
            alt="Michael Silletti, founder of SillettiX"
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
                Founder, SillettiX
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.05}>
              <h1 className="mt-6 font-heading text-6xl font-extrabold leading-[0.95] tracking-tight text-foreground md:text-7xl xl:text-8xl">
                Meet <span className="text-accent">Michael.</span>
              </h1>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <p className="mt-6 max-w-lg text-xl leading-relaxed text-foreground-muted md:text-2xl">
                The operator who built and rapidly scaled Clensy with his own systems and a sales-and-marketing
                engine. Now he takes good businesses and makes them great.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.15}>
              <dl className="mt-10 grid max-w-lg grid-cols-3 divide-x divide-border border-y border-border">
                {[
                  ["Built & scaled", "Clensy"],
                  ["Runs on", "Systems"],
                  ["The goal", "Next level"],
                ].map(([k, v]) => (
                  <div key={k} className="px-4 py-4 first:pl-0">
                    <dt className="text-[11px] uppercase tracking-widest text-foreground-subtle">{k}</dt>
                    <dd className="mt-1 font-heading text-lg font-bold text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </RevealOnScroll>
            <RevealOnScroll delay={0.2}>
              <div className="mt-10 flex flex-wrap gap-3">
                <MagneticButton>
                  <ButtonLink href="/contact" variant="primary">
                    Talk to me directly <ArrowRight size={16} />
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
          <ScrubStatement text="Good businesses become *great* ones when they run on *systems,* *data* and *technology,* not on one person working around the clock." />
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
                    src="/images/michael-silletti-office-4k.webp"
                    quality={PHOTO_QUALITY}
                    alt="Michael Silletti at his desk"
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover object-[50%_20%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  <p className="absolute bottom-6 left-6 right-6 font-heading text-2xl font-bold text-foreground">
                    The builder behind SillettiX.
                  </p>
                </div>
              </RevealOnScroll>
            </div>

            <ol className="relative flex flex-col gap-16 border-l border-border pl-8 lg:gap-24 lg:py-10">
              {STORY.map((chapter, i) => (
                <RevealOnScroll key={chapter.tag}>
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
              <p className="text-eyebrow uppercase text-accent">What he brings</p>
              <h2 className="mt-4 text-display-sm md:text-display-md font-heading text-foreground text-balance">
                The Michael Silletti playbook.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-body-lg text-foreground-muted text-balance">
                The same four things that scaled Clensy, applied to every business SillettiX acquires.
              </p>
            </div>
          </RevealOnScroll>
          <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {PLAYBOOK.map((item, i) => (
              <RevealOnScroll key={item.title} delay={i * 0.08}>
                <div className="group relative border-t-2 border-border pt-6 transition-colors duration-500 hover:border-accent">
                  <span className="font-heading text-5xl font-extrabold text-accent/30 transition-colors duration-500 group-hover:text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-xl font-heading font-bold text-foreground">{item.title}</h3>
                  <p className="mt-3 text-body-md leading-relaxed text-foreground-muted">{item.body}</p>
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
              <p className="text-eyebrow uppercase text-accent">Owner to owner</p>
              <h2 className="mt-4 text-display-sm md:text-display-md font-heading text-foreground">
                The questions every owner asks Michael.
              </h2>
            </div>
          </RevealOnScroll>
          <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
            {QA.map((item, i) => (
              <RevealOnScroll key={item.q} delay={i * 0.06}>
                <div className="h-full bg-background p-8 md:p-10">
                  <p className="font-heading text-xl font-bold text-foreground">&ldquo;{item.q}&rdquo;</p>
                  <p className="mt-4 flex gap-3 text-body-md leading-relaxed text-foreground-muted">
                    <span className="mt-0.5 shrink-0 font-heading text-sm font-bold text-accent">MS</span>
                    {item.a}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Closing CTA over photo ────────────────────────────── */}
      <section className="relative overflow-hidden">
        <Image
          src="/images/acquisition-handshake.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <Container className="relative py-28 md:py-40">
          <RevealOnScroll>
            <div className="max-w-2xl">
              <p className="text-eyebrow uppercase text-accent">Your next chapter</p>
              <h2 className="mt-4 font-heading text-5xl font-extrabold leading-[1.02] tracking-tight text-foreground md:text-7xl">
                Ready to take your business to the next level?
              </h2>
              <p className="mt-6 max-w-xl text-body-lg text-foreground-muted">
                Let&apos;s talk about what Michael&apos;s playbook could do for what you&apos;ve built. It&apos;s confidential, with
                no pressure and no obligation.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <MagneticButton>
                  <ButtonLink href="/contact" variant="primary">
                    What&apos;s My Business Worth? <ArrowRight size={16} />
                  </ButtonLink>
                </MagneticButton>
                <ButtonLink href={toTelHref(phone)} variant="secondary">
                  <Phone size={16} /> Call {phone}
                </ButtonLink>
              </div>
            </div>
          </RevealOnScroll>
        </Container>
      </section>
    </main>
  );
}
