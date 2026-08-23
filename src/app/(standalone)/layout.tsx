import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";
import { CursorGlow } from "@/components/motion/CursorGlow";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { COMPANY } from "@/lib/company";

/**
 * Chrome for the standalone compliance pages. Deliberately does NOT reuse the
 * marketing Header/Footer: those are built around same-page anchor nav
 * (#contact, #faq, …) which dead-ends off the homepage, and the header CTA
 * points at the homepage contact form — which must not be advertised from
 * /sms, where the chat widget has to be the only opt-in path.
 */
export default function StandaloneLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NoiseOverlay />
      <CursorGlow />
      <SmoothScrollProvider>
        <header className="fixed top-0 z-50 w-full border-b border-border/60 bg-background/70 backdrop-blur-md">
          <Container className="flex h-20 items-center justify-between">
            <Link
              href="/"
              className="focus-ring rounded-sm transition-transform duration-300 hover:scale-105"
              aria-label={`${COMPANY.brand} home`}
            >
              <Logo variant="lockup" height={28} priority />
            </Link>
            <Link
              href="/"
              className="group focus-ring relative rounded-sm text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <ArrowLeft
                  size={14}
                  className="transition-transform duration-300 group-hover:-translate-x-0.5"
                />
                Back to site
              </span>
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </Link>
          </Container>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-border">
          <Container className="py-12">
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
              <div className="max-w-xs transition-opacity duration-300 hover:opacity-80">
                <Logo variant="lockup" height={24} />
                <p className="mt-4 text-body-sm text-foreground-muted">
                  Acquire. Build. Operate. Grow.
                </p>
              </div>

              <nav className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Legal">
                {[
                  { href: "/privacy", label: "Privacy Policy" },
                  { href: "/terms", label: "Terms & Conditions" },
                  { href: "/sms", label: "Text Messaging" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group focus-ring relative rounded-sm text-sm text-foreground-muted transition-colors hover:text-foreground"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100" />
                  </Link>
                ))}
              </nav>

              <div className="flex flex-col gap-2 text-sm text-foreground-muted">
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="group focus-ring relative rounded-sm hover:text-foreground"
                >
                  {COMPANY.email}
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100" />
                </a>
                <a
                  href={COMPANY.phoneHref}
                  className="group focus-ring relative rounded-sm hover:text-foreground"
                >
                  {COMPANY.phone}
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100" />
                </a>
              </div>
            </div>

            <div className="mt-10 border-t border-border pt-8 text-body-sm text-foreground-subtle">
              <p>
                © {new Date().getFullYear()} {COMPANY.brand}. All rights reserved.
              </p>
              {COMPANY.legalEntity && (
                <p className="mt-1">
                  {COMPANY.brand} is operated by {COMPANY.legalEntity}.
                </p>
              )}
            </div>
          </Container>
        </footer>
      </SmoothScrollProvider>
    </>
  );
}
