import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MonogramAvatar } from "@/components/ui/MonogramAvatar";
import { TiltCard } from "@/components/motion/TiltCard";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { team } from "@/content/site";

export function MeetTheTeam() {
  return (
    <section id="team" className="py-24 md:py-32">
      <Container>
        <RevealOnScroll>
          <SectionHeading eyebrow={team.eyebrow} heading={team.heading} align="center" />
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <TiltCard className="group mt-14 mx-auto max-w-xl p-8 md:p-10 text-center">
            <div className="flex justify-center">
              <div className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                <MonogramAvatar letter={team.monogram} size={72} />
              </div>
            </div>
            <p className="mt-5 text-sm uppercase tracking-wide text-accent">{team.role}</p>
            <p className="mt-4 text-body-lg text-foreground-muted">{team.bio}</p>
          </TiltCard>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
