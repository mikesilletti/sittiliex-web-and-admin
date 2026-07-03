import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border-strong bg-background-raised px-4 py-2 text-sm text-foreground-muted",
        className
      )}
    >
      {children}
    </span>
  );
}
