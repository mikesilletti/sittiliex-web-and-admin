"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ScrubReveal } from "@/components/motion/ScrubReveal";
import { contactSchema } from "@/lib/contact-schema";
import { COMPANY } from "@/lib/company";
import type { ContactContent } from "@/types/content";

type Status = "idle" | "submitting" | "success" | "error";

export function Contact({ content: contact }: { content: ContactContent }) {
  const [values, setValues] = useState({ name: "", email: "", company: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");

  function handleChange(field: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = contactSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(result.error.flatten().fieldErrors)) {
        if (msgs?.[0]) fieldErrors[key] = msgs[0];
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <section id="contact" className="py-24 md:py-32">
        <Container>
          <RevealOnScroll>
            <div className="mx-auto max-w-lg rounded-lg border border-accent/30 bg-background-raised p-10 text-center">
              <CheckCircle2 size={32} className="mx-auto text-accent" />
              <h3 className="mt-4 text-lg font-heading font-semibold text-foreground">
                Message received.
              </h3>
              <p className="mt-2 text-body-md text-foreground-muted">
                Thank you for reaching out — we&apos;ll be in touch soon, in complete confidence.
              </p>
            </div>
          </RevealOnScroll>
        </Container>
      </section>
    );
  }

  return (
    <section id="contact" className="relative py-24 md:py-32 overflow-hidden">
      <ParallaxImage
        src={contact.backgroundImage}
        alt=""
        className="absolute inset-0"
        imgClassName="opacity-20"
        strength={40}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--color-background) 0%, rgba(7,9,12,0.7) 40%, var(--color-background) 100%)",
        }}
      />
      <Container className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="max-w-2xl">
            <RevealOnScroll>
              <p className="text-eyebrow uppercase text-accent mb-4">{contact.eyebrow}</p>
            </RevealOnScroll>
            <ScrubReveal
              as="h2"
              text={contact.heading}
              className="text-display-sm md:text-display-md font-heading text-foreground"
            />
            <RevealOnScroll delay={0.1}>
              <p className="mt-4 text-body-lg text-foreground-muted text-balance">{contact.body}</p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.15}>
              <div className="mt-8 flex flex-col gap-2 text-sm text-foreground-muted">
                <div>
                  Prefer email?{" "}
                  <MagneticButton strength={0.25} className="inline-block">
                    <a
                      href={`mailto:${contact.email}`}
                      className="focus-ring rounded-sm text-accent hover:text-accent-hover"
                    >
                      {contact.email}
                    </a>
                  </MagneticButton>
                </div>
                <div>
                  Rather talk?{" "}
                  <MagneticButton strength={0.25} className="inline-block">
                    <a
                      href={COMPANY.phoneHref}
                      className="focus-ring rounded-sm text-accent hover:text-accent-hover"
                    >
                      {COMPANY.phone}
                    </a>
                  </MagneticButton>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          <RevealOnScroll delay={0.1}>
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div>
                <Input
                  placeholder="Your name"
                  aria-label="Your name"
                  value={values.name}
                  onChange={handleChange("name")}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "error-name" : undefined}
                />
                {errors.name && (
                  <p id="error-name" className="mt-1.5 text-xs text-red-400">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  aria-label="Email address"
                  value={values.email}
                  onChange={handleChange("email")}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "error-email" : undefined}
                />
                {errors.email && (
                  <p id="error-email" className="mt-1.5 text-xs text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              <Input
                placeholder="Company (optional)"
                aria-label="Company"
                value={values.company}
                onChange={handleChange("company")}
              />

              <div>
                <Textarea
                  placeholder="Tell us about your business"
                  aria-label="Message"
                  value={values.message}
                  onChange={handleChange("message")}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "error-message" : undefined}
                />
                {errors.message && (
                  <p id="error-message" className="mt-1.5 text-xs text-red-400">
                    {errors.message}
                  </p>
                )}
              </div>

              <MagneticButton strength={0.2} className="mt-2 w-full">
                <Button type="submit" variant="primary" disabled={status === "submitting"} className="w-full">
                  {status === "submitting" ? "Sending…" : "Send Message"}
                </Button>
              </MagneticButton>

              {status === "error" && (
                <p className="text-xs text-red-400">
                  Something went wrong — please try again or email us directly.
                </p>
              )}
            </form>
          </RevealOnScroll>
        </div>
      </Container>
    </section>
  );
}
