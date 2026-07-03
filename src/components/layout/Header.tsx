"use client";

import { useEffect, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { nav, hero } from "@/content/site";

export function Header() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 24);
  });

  useEffect(() => {
    const sections = nav
      .map((item) => document.querySelector(item.href))
      .filter((el): el is Element => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHref(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-colors duration-300",
        isScrolled
          ? "border-b border-border/60 bg-background/70 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <Container className="flex h-20 items-center justify-between">
        <a href="#" className="focus-ring rounded-sm" aria-label={`${"SillettiX"} home`}>
          <Logo variant="lockup" height={28} priority />
        </a>

        <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={activeHref === item.href ? "true" : undefined}
              className={cn(
                "focus-ring rounded-sm text-sm transition-colors hover:text-foreground",
                activeHref === item.href ? "text-accent" : "text-foreground-muted"
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <ButtonLink href={hero.primaryCta.href} variant="primary" className="text-xs px-4 py-2.5">
            {hero.primaryCta.label}
          </ButtonLink>
        </div>

        <button
          type="button"
          className="focus-ring lg:hidden text-foreground"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </Container>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <Container className="flex flex-col gap-1 py-4">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="focus-ring rounded-sm py-3 text-sm text-foreground-muted transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
            <ButtonLink
              href={hero.primaryCta.href}
              variant="primary"
              className="mt-3 w-full"
              onClick={() => setMobileOpen(false)}
            >
              {hero.primaryCta.label}
            </ButtonLink>
          </Container>
        </div>
      )}
    </header>
  );
}
