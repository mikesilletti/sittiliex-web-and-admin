import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const base =
  "group focus-ring relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md px-6 py-3 text-sm font-medium transition-all duration-300 whitespace-nowrap active:scale-[0.97] hover:scale-[1.02]";

const variants = {
  primary: "bg-accent text-background hover:shadow-glow-md",
  secondary:
    "border border-border-strong text-foreground hover:border-accent/50 hover:bg-background-raised",
  ghost: "text-foreground-muted hover:text-foreground",
};

type Variant = keyof typeof variants;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };
type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; href: string };

function Shine() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
    />
  );
}

export function Button({ variant = "primary", className, children, ...props }: ButtonProps & { children?: ReactNode }) {
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      <Shine />
      <span className="relative flex items-center gap-2">{children}</span>
    </button>
  );
}

export function ButtonLink({ variant = "primary", className, children, ...props }: LinkProps & { children?: ReactNode }) {
  return (
    <a className={cn(base, variants[variant], className)} {...props}>
      <Shine />
      <span className="relative flex items-center gap-2">{children}</span>
    </a>
  );
}
