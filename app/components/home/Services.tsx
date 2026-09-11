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
        <Kicker>Services</Kicker>
        <h2 className="section-title">{heading}</h2>

        <Reveal className="mt-5 grid grid-cols-1 gap-10 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-[18px] text-[15px] uppercase tracking-[0.06em] text-slate">
                {group.title}
              </h3>
              <div className="border-y border-line">
                {group.items.map((item, index) => (
                  <div
                    key={item}
                    className={`flex items-center justify-between border-line py-[18px] text-[17px] font-medium ${
                      index === 0 ? "" : "border-t"
                    }`}
                  >
                    <span>{item}</span>
                    <span className="font-bold text-crimson" aria-hidden="true">
                      →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}