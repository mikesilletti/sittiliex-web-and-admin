import Link from "next/link";

const cards = [
  { href: "/admin/sections", title: "Sections", description: "Reorder, hide, edit, or add homepage sections." },
  { href: "/admin/theme", title: "Theme", description: "Colors and font pairing for the whole site." },
  { href: "/admin/settings", title: "Settings", description: "Navigation, footer, contact email, SEO defaults." },
  { href: "/admin/seo", title: "SEO Score", description: "See how the homepage scores and what to fix." },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-display-sm font-heading text-foreground">SillettiX Admin</h1>
      <p className="mt-2 text-body-md text-foreground-muted">Manage the homepage without touching code.</p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="focus-ring rounded-md border border-border bg-background-raised p-5 transition-colors hover:border-accent/40"
          >
            <p className="text-sm font-medium text-foreground">{card.title}</p>
            <p className="mt-1 text-xs text-foreground-muted">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
