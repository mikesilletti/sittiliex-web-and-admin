import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import { nav, footer, contact } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <Container className="py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs transition-opacity duration-300 hover:opacity-80">
            <Logo variant="lockup" height={26} />
            <p className="mt-4 text-body-sm text-foreground-muted">{footer.tagline}</p>
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

          <div className="text-sm text-foreground-muted">
            <a
              href={`mailto:${contact.email}`}
              className="group focus-ring relative rounded-sm hover:text-foreground"
            >
              {contact.email}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-body-sm text-foreground-subtle">
          {footer.copyright}
        </div>
      </Container>
    </footer>
  );
}
