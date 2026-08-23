"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/admin/actions";
import { useContactNotifications } from "@/components/admin/notifications/ContactNotifications";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/sections", label: "Sections" },
  { href: "/admin/contacts", label: "Contacts" },
  { href: "/admin/theme", label: "Theme" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/seo", label: "SEO" },
];

export function AdminNav() {
  const pathname = usePathname();
  const { unreadCount } = useContactNotifications();

  return (
    <div className="border-b border-border">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const active = link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href);
            const showBadge = link.href === "/admin/contacts" && unreadCount > 0;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "focus-ring relative rounded-sm px-3 py-1.5 text-sm transition-colors",
                  active ? "text-accent" : "text-foreground-muted hover:text-foreground"
                )}
              >
                {link.label}
                {showBadge && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <form action={logoutAction}>
          <button
            type="submit"
            className="focus-ring rounded-sm text-sm text-foreground-muted hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
