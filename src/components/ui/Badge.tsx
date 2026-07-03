import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border-strong bg-background-raised px-4 py-2 text-sm text-foreground-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:text-foreground hover:shadow-glow-sm",
        className
      )}
    >
      {children}
    </span>
  );
}
