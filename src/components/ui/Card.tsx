import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "group relative rounded-md border border-border bg-background-raised p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card-hover",
        className
      )}
    >
      {children}
    </div>
  );
}
