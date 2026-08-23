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
  title: `Terms & Conditions — ${COMPANY.brand}`,
  description: `The terms that apply when you use the ${COMPANY.brand} website or exchange text messages with our team.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const entity = COMPANY.legalEntity ?? COMPANY.brand;

  return (
    <>
      <LegalHeader
        eyebrow="Legal"
        title="Terms & Conditions"
        lastUpdated={LEGAL_LAST_UPDATED}
        intro={`These terms apply when you use ${COMPANY.site}, contact us through it, or exchange text messages with the ${COMPANY.brand} team.`}
      />

      <LegalBody>
        <LegalSection heading="Agreement to these terms">
          <p>
            By using this site or messaging us, you agree to these terms and to our{" "}
            <Link
              href="/privacy"
              className="focus-ring rounded-sm text-accent hover:text-accent-hover"
            >
              Privacy Policy
            </Link>
            . If you do not agree, please do not use the site.
          </p>
        </LegalSection>

        <LegalSection heading="What this site is">
          <p>
            This site describes {COMPANY.brand}
            {COMPANY.legalEntity ? `, operated by ${COMPANY.legalEntity},` : ""} and the kinds of
            businesses we acquire. Nothing on it is an offer to buy or sell any business or
            security, investment advice, legal advice, tax advice, or a commitment of any kind. Any
            transaction would follow separate written agreements signed by both sides.
          </p>
        </LegalSection>

        <LegalSection heading="Text messaging program">
          <p>
            If you opt in through the chat widget on our{" "}
            <Link href="/sms" className="focus-ring rounded-sm text-accent hover:text-accent-hover">
              text messaging page
            </Link>
            , you agree to receive text messages from {COMPANY.brand} at the mobile number you
            provide.
          </p>
          <LegalList
            items={[
              "Message frequency varies and depends on your conversation with our team.",
              "Message and data rates may apply. Contact your carrier for details of your plan.",
              "Reply STOP at any time to unsubscribe; reply HELP for help.",
              "Consent is not a condition of any purchase, sale, or service.",
              "Carriers are not liable for delayed or undelivered messages.",
              "Message delivery depends on your carrier and device, and cannot be guaranteed.",
            ]}
          />
          <p>
            You confirm that you are the subscriber of, or the customary user with authority over,
            the mobile number you give us, and that you will tell us if that number changes.
          </p>
        </LegalSection>

        <LegalSection heading="Confidentiality of your inquiry">
          <p>
            We treat inquiries about your business as confidential and share them only within our
            team and with advisors who need them to evaluate a possible transaction. Please do not
            send sensitive financial records or personal identifiers through the website or by text
            — we will arrange a secure channel when the conversation gets there.
          </p>
        </LegalSection>

        <LegalSection heading="Acceptable use">
          <LegalList
            items={[
              "Do not submit false, misleading, or unlawful information.",
              "Do not attempt to disrupt, probe, or gain unauthorized access to the site or its systems.",
              "Do not use the site or our messaging channels to send spam or unlawful content.",
              "Do not scrape, copy, or reuse site content for commercial purposes without our permission.",
            ]}
          />
        </LegalSection>

        <LegalSection heading="Intellectual property">
          <p>
            The {COMPANY.brand} name, logo, site design, and content are owned by {entity} or its
            licensors and are protected by intellectual property laws. You may view and print pages
            for your own use in evaluating a possible transaction with us.
          </p>
        </LegalSection>

        <LegalSection heading="Third-party services and links">
          <p>
            The site uses third-party services — including the chat and messaging widget on our text
            messaging page — and may link to other sites. We do not control those services or sites
            and are not responsible for their content or their privacy practices.
          </p>
        </LegalSection>

        <LegalSection heading="Disclaimers and limitation of liability">
          <p>
            The site is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis,
            without warranties of any kind, whether express or implied, to the fullest extent
            permitted by law. We do not warrant that the site will be uninterrupted, error-free, or
            free of harmful components.
          </p>
          <p>
            To the fullest extent permitted by law, {entity} will not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising out of your use of the
            site or of any message exchanged through it.
          </p>
        </LegalSection>

        <LegalSection heading="Changes to these terms">
          <p>
            We may revise these terms from time to time. The date at the top of this page shows when
            they were last revised, and the revised version applies once posted here.
          </p>
        </LegalSection>

        <LegalSection heading="Contact us">
          <p>
            Questions about these terms? Reach us at{" "}
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
