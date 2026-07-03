import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { trustBadges } from "@/content/site";

export function TrustStrip() {
  return (
    <section className="border-y border-border py-10">
      <Container>
        <RevealOnScroll>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {trustBadges.map((badge) => (
              <Badge key={badge.id}>{badge.label}</Badge>
            ))}
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
