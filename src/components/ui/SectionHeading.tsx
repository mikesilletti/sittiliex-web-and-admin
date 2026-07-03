import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  heading,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  heading: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="text-eyebrow uppercase text-accent mb-4">{eyebrow}</p>
      )}
      <h2 className="text-display-sm md:text-display-md font-heading text-foreground text-balance">
        {heading}
      </h2>
      {description && (
        <p className="mt-4 text-body-lg text-foreground-muted text-balance">
          {description}
        </p>
      )}
    </div>
  );
}
