import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import type { NavItem } from "@/types/content";

// /sms is intentionally absent: it lives in the CMS nav ("Text Us"), which this
// footer already renders above.
const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

export function Footer({
  nav,
  tagline,
  copyright,
  contactEmail,
  contactPhone,
  contactPhoneHref,
}: {
  nav: NavItem[];
  tagline: string;
  copyright: string;
  contactEmail: string;
  contactPhone: string;
  contactPhoneHref: string;
}) {
  return (
    <footer className="border-t border-border">
      <Container className="py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs transition-opacity duration-300 hover:opacity-80">
            <Logo variant="lockup" height={26} />
            <p className="mt-4 text-body-sm text-foreground-muted">{tagline}</p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Footer">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group focus-ring relative rounded-sm text-sm text-foreground-muted transition-colors hover:text-foreground"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-2 text-sm text-foreground-muted">
            <a
              href={`mailto:${contactEmail}`}
              className="group focus-ring relative rounded-sm hover:text-foreground"
            >
              {contactEmail}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </a>
            <a
              href={contactPhoneHref}
              className="group focus-ring relative rounded-sm hover:text-foreground"
            >
              {contactPhone}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 text-body-sm text-foreground-subtle md:flex-row md:items-center md:justify-between">
          <span>{copyright}</span>
          {/* Static, non-CMS links: carriers reviewing the A2P registration
              expect the privacy policy and messaging terms to be reachable
              from anywhere on the site. */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Legal">
            {LEGAL_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring rounded-sm transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
