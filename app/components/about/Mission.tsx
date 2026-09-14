import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";
import type { AboutContent } from "@/app/lib/content/types";

/** Mission & Vision — two soft cards on the panel background. */
export default function Mission({ mission }: { mission: AboutContent["mission"] }) {
  return (
    <Reveal>
      <Container className="py-20 text-center">
        <Kicker centered>{mission.kicker}</Kicker>
        <h2 className="section-title mx-auto mb-10 text-center">{mission.heading}</h2>

        <div className="mx-auto grid max-w-[980px] grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-[20px] bg-panel p-10 text-left">
            <div className="mb-4 text-[30px]" aria-hidden="true">
              🎯
            </div>
            <h3 className="mb-2 text-[19px] font-bold text-ink">Our Mission</h3>
            <p className="text-[15.5px] leading-relaxed text-slate">
              {mission.mission}
            </p>
          </div>

          <div className="rounded-[20px] bg-panel p-10 text-left">
            <div className="mb-4 text-[30px]" aria-hidden="true">
              🌄
            </div>
            <h3 className="mb-2 text-[19px] font-bold text-ink">Our Vision</h3>
            <p className="text-[15.5px] leading-relaxed text-slate">
              {mission.vision}
            </p>
          </div>
        </div>
      </Container>
    </Reveal>
  );
}