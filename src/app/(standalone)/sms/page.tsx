import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Ban, Clock, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { GlowGridBackground } from "@/components/motion/GlowGridBackground";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { SplitText } from "@/components/motion/SplitText";
import { ScrubReveal } from "@/components/motion/ScrubReveal";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ChatWidgetPrompt } from "@/components/sms/ChatWidgetPrompt";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: `Text ${COMPANY.brand} — SMS Opt-In`,
  description: `Start a confidential conversation with ${COMPANY.brand} by text. Opt in through the chat widget to receive messages from our team.`,
  alternates: { canonical: "/sms" },
};

const STEPS = [
  {
    n: "01",
    title: "Open the chat",
    body: "Tap the chat bubble in the bottom-right corner of this page.",
  },
  {
    n: "02",
    title: "Give us your number",
    body: "Enter your name, mobile number, and what you would like to discuss, then agree to receive text messages.",
  },
  {
    n: "03",
    title: "We text you back",
    body: "A member of our team replies directly — confidentially, and without obligation.",
  },
];

const TERMS = [
  {
    icon: Clock,
    title: "Message frequency",
    body: "Message frequency varies and depends on your conversation with our team.",
  },
  {
    icon: Phone,
    title: "Rates",
    body: "Message and data rates may apply, depending on your mobile carrier and plan.",
  },
  {
    icon: Ban,
    title: "Opting out",
    body: "Reply STOP at any time to unsubscribe. Reply HELP for help, or reach us with the details below.",
  },
  {
    icon: ShieldCheck,
    title: "Your information",
    body: "Mobile information is never sold, rented, or shared with third parties or affiliates for their own marketing or promotional purposes.",
  },
];

export default function SmsPage() {
  return (
    <>
      <section className="relative flex min-h-screen items-center overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32">
        <GlowGridBackground />
        <Container className="relative">
          <p className="mb-6 flex items-center gap-2 text-eyebrow uppercase text-accent">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Text Messaging
          </p>

          <h1 className="max-w-4xl text-display-lg font-heading text-foreground text-balance">
            <span className="block">
              <SplitText text="Talk to us" delay={0.1} />
            </span>
            <span className="block text-accent drop-shadow-[0_0_32px_rgba(26,180,255,0.35)]">
              <SplitText text="by text." delay={0.25} />
            </span>
          </h1>

          <RevealOnScroll delay={0.6}>
            <p className="mt-8 max-w-xl text-body-lg text-foreground-muted text-balance">
              Selling a business starts with a quiet conversation. Opt in through the chat on this
              page and a member of the {COMPANY.brand} team will text you directly — confidentially,
              and with no obligation.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.75}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <MagneticButton strength={0.25}>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="focus-ring flex items-center gap-3 rounded-md border border-border-strong bg-background-raised/70 px-5 py-3 text-sm text-foreground-muted transition-all duration-300 hover:border-accent/40 hover:text-foreground hover:shadow-glow-sm"
                >
                  <Mail size={16} className="text-accent" />
                  {COMPANY.email}
                </a>
              </MagneticButton>
              <MagneticButton strength={0.25}>
                <a
                  href={COMPANY.phoneHref}
                  className="focus-ring flex items-center gap-3 rounded-md border border-border-strong bg-background-raised/70 px-5 py-3 text-sm text-foreground-muted transition-all duration-300 hover:border-accent/40 hover:text-foreground hover:shadow-glow-sm"
                >
                  <Phone size={16} className="text-accent" />
                  {COMPANY.phone}
                </a>
              </MagneticButton>
            </div>
          </RevealOnScroll>
        </Container>
      </section>

      <section className="relative py-24 md:py-28">
        <Container>
          <RevealOnScroll>
            <p className="text-eyebrow uppercase text-accent mb-4">How it works</p>
          </RevealOnScroll>
          <ScrubReveal
            as="h2"
            text="Three steps, start to reply."
            className="text-display-sm md:text-display-md font-heading text-foreground"
          />

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <RevealOnScroll key={step.n} delay={0.1 + i * 0.1}>
                <Card className="h-full">
                  <span className="font-heading text-sm text-accent">{step.n}</span>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-body-sm text-foreground-muted">{step.body}</p>
                </Card>
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll delay={0.2}>
            <ChatWidgetPrompt className="mt-10" />
          </RevealOnScroll>
        </Container>
      </section>

      <section className="relative overflow-hidden py-24 md:py-28">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(26,180,255,0.10), transparent 70%)",
          }}
        />
        <Container className="relative">
          <RevealOnScroll>
            <p className="text-eyebrow uppercase text-accent mb-4">The fine print</p>
          </RevealOnScroll>
          <ScrubReveal
            as="h2"
            text="What you are agreeing to."
            className="text-display-sm md:text-display-md font-heading text-foreground"
          />
          <RevealOnScroll delay={0.1}>
            <p className="mt-4 max-w-2xl text-body-lg text-foreground-muted text-balance">
              Consent to receive text messages is never a condition of any purchase, sale, or
              service. You choose to opt in, and you can leave whenever you like.
            </p>
          </RevealOnScroll>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {TERMS.map((term, i) => {
              const Icon = term.icon;
              return (
                <RevealOnScroll key={term.title} delay={0.1 + i * 0.08}>
                  <Card className="h-full">
                    <Icon size={20} className="text-accent" />
                    <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                      {term.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-foreground-muted">{term.body}</p>
                  </Card>
                </RevealOnScroll>
              );
            })}
          </div>

          <RevealOnScroll delay={0.2}>
            <p className="mt-10 text-body-sm text-foreground-subtle">
              Full details are in our{" "}
              <Link
                href="/privacy"
                className="focus-ring rounded-sm text-accent hover:text-accent-hover"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/terms"
                className="focus-ring rounded-sm text-accent hover:text-accent-hover"
              >
                Terms &amp; Conditions
              </Link>
              . Questions about messaging? Email{" "}
              <a
                href={`mailto:${COMPANY.email}`}
                className="focus-ring rounded-sm text-accent hover:text-accent-hover"
              >
                {COMPANY.email}
              </a>{" "}
              or call{" "}
              <a
                href={COMPANY.phoneHref}
                className="focus-ring rounded-sm text-accent hover:text-accent-hover"
              >
                {COMPANY.phone}
              </a>
              .
            </p>
          </RevealOnScroll>
        </Container>
      </section>

      <section className="relative pb-28">
        <Container>
          <RevealOnScroll>
            <div className="relative overflow-hidden rounded-lg border border-accent/30 bg-background-raised p-10 text-center md:p-14">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 animate-pulse-glow"
                style={{
                  background:
                    "radial-gradient(circle at 50% 0%, rgba(26,180,255,0.16), transparent 65%)",
                }}
              />
              <div className="relative">
                <MessageCircle size={28} className="mx-auto text-accent" />
                <h2 className="mt-5 font-heading text-display-sm text-foreground text-balance">
                  Ready when you are.
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-body-md text-foreground-muted text-balance">
                  Open the chat, leave your number, and we pick it up from there.
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </Container>
      </section>

      {/*
        HighLevel-generated A2P 10DLC opt-in widget. The consent language,
        STOP/HELP wording, and required fields are locked by HighLevel so the
        live widget matches the carrier application — do not hand-roll a
        replacement, and never add another phone-number field to this page.
      */}
      <Script
        src="https://widgets.leadconnectorhq.com/loader.js"
        data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
        data-widget-id="6a4181e0cf2c64bbfaae4ef2"
        data-source="WEB_USER"
        strategy="afterInteractive"
      />
    </>
  );
}
