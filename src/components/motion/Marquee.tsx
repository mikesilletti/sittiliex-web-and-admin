import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Marquee({
  children,
  className,
  reverse = false,
  durationClassName = "animate-marquee",
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  durationClassName?: string;
}) {
  return (
    <div className={cn("relative flex overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max shrink-0 items-center gap-6",
          durationClassName,
          reverse && "[animation-direction:reverse]"
        )}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "flex w-max shrink-0 items-center gap-6",
          durationClassName,
          reverse && "[animation-direction:reverse]"
        )}
      >
        {children}
      </div>
    </div>
  );
}
