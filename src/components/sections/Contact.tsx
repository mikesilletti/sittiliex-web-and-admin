"use client";

import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ScrubReveal } from "@/components/motion/ScrubReveal";
import { InquiryForm } from "@/components/sections/InquiryForm";
import { COMPANY, toTelHref } from "@/lib/company";
import { CONTACT_COPY_DEFAULTS, contactCopy, type ContactCopyKey } from "@/lib/content-defaults";
import type { ContactContent } from "@/types/content";

export function Contact({ content: contact }: { content: ContactContent }) {
  const phone = contact.phone || COMPANY.phone;
  const copy = (key: ContactCopyKey) => contactCopy(contact, key);
  const formCopy = Object.fromEntries(
    Object.keys(CONTACT_COPY_DEFAULTS).map((key) => [key, copy(key as ContactCopyKey)])
  ) as Record<ContactCopyKey, string>;

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
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-16 items-start">
          <div className="max-w-2xl lg:sticky lg:top-28">
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
                  {copy("emailLabel")}{" "}
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
                  {copy("phoneLabel")}{" "}
                  <MagneticButton strength={0.25} className="inline-block">
                    <a
                      href={toTelHref(phone)}
                      className="focus-ring rounded-sm text-accent hover:text-accent-hover"
                    >
                      {phone}
                    </a>
                  </MagneticButton>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          <RevealOnScroll delay={0.1}>
            <InquiryForm copy={formCopy} />
          </RevealOnScroll>
        </div>
      </Container>
    </section>
  );
}
