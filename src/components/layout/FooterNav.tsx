"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navHref } from "@/lib/nav-href";
import type { NavItem } from "@/types/content";

export function FooterNav({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Footer">
      {nav.map((item) => (
        <Link
          key={item.href}
          href={navHref(item.href, pathname)}
          className="group focus-ring relative rounded-sm text-sm text-foreground-muted transition-colors hover:text-foreground"
        >
          {item.label}
          <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100" />
        </Link>
      ))}
    </nav>
  );
}
