import { Badge } from "@/components/ui/Badge";
import { Marquee } from "@/components/motion/Marquee";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import type { TrustStripContent } from "@/types/content";

export function TrustStrip({ content }: { content: TrustStripContent }) {
  return (
    <section className="relative overflow-hidden border-y border-border py-8">
      <RevealOnScroll>
        <div
          className="flex flex-col gap-5"
          style={{
            maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <Marquee durationClassName="animate-marquee [animation-duration:36s]">
            {content.badges.map((badge) => (
              <Badge key={badge.id}>{badge.label}</Badge>
            ))}
          </Marquee>
          <Marquee reverse durationClassName="animate-marquee [animation-duration:30s]">
            {content.marqueeItems.map((item) => (
              <span
                key={item}
                className="flex items-center gap-6 whitespace-nowrap text-xs uppercase tracking-wide text-foreground-subtle"
              >
                {item}
                <span className="h-1 w-1 rounded-full bg-accent/40" />
              </span>
            ))}
          </Marquee>
        </div>
      </RevealOnScroll>
    </section>
  );
}
