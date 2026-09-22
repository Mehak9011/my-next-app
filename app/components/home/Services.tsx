import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";
import type { ServiceGroup } from "@/app/lib/content/types";

/** Services — split two-column list (Design vs Development). */
export default function Services({
  heading,
  groups,
}: {
  heading: string;
  groups: ServiceGroup[];
}) {
  return (
    <section id="services" className="py-[100px]">
      <Container>
        <Reveal variant="up">
          <Kicker>Services</Kicker>
          <h2 className="section-title">{heading}</h2>
        </Reveal>

        {/* Split at 760px, matching the reference design's breakpoint. */}
        <div className="mt-5 grid grid-cols-1 gap-10 min-[760px]:grid-cols-2">
          {groups.map((group, groupIndex) => (
            <div key={group.title}>
              <Reveal variant="up" delay={groupIndex * 90}>
                <h3 className="mb-[18px] text-[15px] uppercase tracking-[0.06em] text-slate">
                  {group.title}
                </h3>
              </Reveal>

              <div className="border-y border-line">
                {group.items.map((item, index) => (
                  <Reveal
                    key={item}
                    variant="left"
                    delay={index * 90}
                    className={`service-row flex items-center justify-between border-line py-[18px] text-[17px] font-medium ${
                      index === 0 ? "" : "border-t"
                    }`}
                  >
                    <span className="service-label">{item}</span>
                    <span
                      className="service-arrow font-bold text-crimson"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
