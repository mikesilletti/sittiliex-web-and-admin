import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalBody,
  LegalHeader,
  LegalList,
  LegalSection,
} from "@/components/legal/LegalArticle";
import { COMPANY, LEGAL_LAST_UPDATED } from "@/lib/company";

export const metadata: Metadata = {
  title: `Privacy Policy — ${COMPANY.brand}`,
  description: `How ${COMPANY.brand} collects, uses, and protects the information you share with us, including mobile numbers used for text messaging.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const entity = COMPANY.legalEntity ?? COMPANY.brand;

  return (
    <>
      <LegalHeader
        eyebrow="Legal"
        title="Privacy Policy"
        lastUpdated={LEGAL_LAST_UPDATED}
        intro={`This policy explains what ${COMPANY.brand} collects when you contact us, how we use it, and the choices you have — including for text messaging.`}
      />

      <LegalBody>
        <LegalSection heading="Who we are">
          <p>
            {COMPANY.brand}
            {COMPANY.legalEntity ? ` is operated by ${COMPANY.legalEntity} and` : ""} acquires
            profitable, founder-led businesses and operates them for the long term. This policy
            covers {COMPANY.site} and the messages we exchange with you by email, phone, and text.
          </p>
        </LegalSection>

        <LegalSection heading="Information we collect">
          <p>We only collect what you choose to give us, plus basic technical data:</p>
          <LegalList
            items={[
              <>
                <strong className="text-foreground">Contact details</strong> — your name, email
                address, mobile number, company name, and anything you write in a form or chat with
                us.
              </>,
              <>
                <strong className="text-foreground">Business details</strong> — information you
                share about a business you may want to sell.
              </>,
              <>
                <strong className="text-foreground">Technical data</strong> — IP address, browser
                type, pages visited, and similar information collected automatically when you visit
                the site.
              </>,
            ]}
          />
        </LegalSection>

        <LegalSection heading="How we use your information">
          <LegalList
            items={[
              "To reply to your inquiry and continue the conversation by email, phone, or text.",
              "To evaluate a potential acquisition and discuss next steps with you.",
              "To send information you asked for, including scheduling and follow-up messages.",
              "To operate, secure, and improve the site.",
              "To meet legal, tax, and regulatory obligations.",
            ]}
          />
        </LegalSection>

        <LegalSection heading="Text messaging and your mobile number">
          <p>
            If you opt in through the chat widget on our{" "}
            <Link href="/sms" className="focus-ring rounded-sm text-accent hover:text-accent-hover">
              text messaging page
            </Link>
            , we use your mobile number to text you about your inquiry and, where you have agreed to
            it, about our services.
          </p>
          <p className="text-foreground">
            No mobile information will be sold, rented, or shared with third parties or affiliates
            for their own marketing or promotional purposes. Text messaging originator opt-in data
            and consent are never shared with any third party, other than the service providers
            that help us deliver the messages.
          </p>
          <LegalList
            items={[
              "Message frequency varies. Message and data rates may apply.",
              "Reply STOP to any message to stop receiving texts. Reply HELP for help.",
              "Consent to receive text messages is not a condition of any purchase, sale, or service.",
            ]}
          />
        </LegalSection>

        <LegalSection heading="When we share information">
          <p>
            We do not sell your personal information. We share it only with service providers who
            work on our behalf — such as our website host, email and text messaging platforms, and
            professional advisors — and only so they can perform that work for us. We may also
            disclose information where the law requires it, or to protect our rights, safety, or
            property.
          </p>
        </LegalSection>

        <LegalSection heading="Cookies and analytics">
          <p>
            The site and the tools embedded in it may use cookies and similar technologies to keep
            the site working, remember your preferences, and understand how the site is used. Most
            browsers let you refuse or delete cookies; some parts of the site may not work as well
            if you do.
          </p>
        </LegalSection>

        <LegalSection heading="How long we keep it, and how we protect it">
          <p>
            We keep your information for as long as needed for the purpose it was given, and for as
            long as the law requires. We use reasonable administrative and technical safeguards to
            protect it. No method of transmission or storage is completely secure, so we cannot
            guarantee absolute security.
          </p>
        </LegalSection>

        <LegalSection heading="Your choices">
          <LegalList
            items={[
              "Stop text messages at any time by replying STOP.",
              "Unsubscribe from emails using the link in the message, or by writing to us.",
              <>
                Ask us to access, correct, or delete the information we hold about you by emailing{" "}
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="focus-ring rounded-sm text-accent hover:text-accent-hover"
                >
                  {COMPANY.email}
                </a>
                .
              </>,
            ]}
          />
        </LegalSection>

        <LegalSection heading="Children">
          <p>
            The site is intended for business owners and advisors. It is not directed to children
            under 13, and we do not knowingly collect information from them.
          </p>
        </LegalSection>

        <LegalSection heading="Changes to this policy">
          <p>
            We may update this policy from time to time. The date at the top of this page shows when
            it was last revised, and any change takes effect once posted here.
          </p>
        </LegalSection>

        <LegalSection heading="Contact us">
          <p>
            Questions about this policy or about the information we hold? Reach {entity} at{" "}
            <a
              href={`mailto:${COMPANY.email}`}
              className="focus-ring rounded-sm text-accent hover:text-accent-hover"
            >
              {COMPANY.email}
            </a>{" "}
            or{" "}
            <a
              href={COMPANY.phoneHref}
              className="focus-ring rounded-sm text-accent hover:text-accent-hover"
            >
              {COMPANY.phone}
            </a>
            .
          </p>
        </LegalSection>
      </LegalBody>
    </>
  );
}
