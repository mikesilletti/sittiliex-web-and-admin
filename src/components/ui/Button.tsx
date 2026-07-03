import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const base =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap";

const variants = {
  primary: "bg-accent text-background hover:bg-accent-hover hover:shadow-glow-md",
  secondary:
    "border border-border-strong text-foreground hover:border-accent/50 hover:bg-background-raised",
  ghost: "text-foreground-muted hover:text-foreground",
};

type Variant = keyof typeof variants;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };
type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; href: string };

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export function ButtonLink({ variant = "primary", className, ...props }: LinkProps) {
  return <a className={cn(base, variants[variant], className)} {...props} />;
}
