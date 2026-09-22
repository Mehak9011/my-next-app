import Link from "next/link";
import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";
import TiltCard from "@/app/components/ui/TiltCard";
import type { Industry } from "@/app/lib/content/types";

/** Industries — image cards with hover zoom, light sweep and 3D tilt. */
export default function Industries({
  heading,
  items,
}: {
  heading: string;
  items: Industry[];
}) {
  return (
    <section id="industries" className="bg-panel py-[100px]">
      <Container>
        <Reveal variant="up">
          <Kicker>Industries</Kicker>
          <h2 className="section-title mb-10">{heading}</h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-[22px] md:grid-cols-2">
          {items.map((industry, index) => (
            <Reveal
              key={industry.title}
              variant="scale"
              delay={index * 120}
              className="h-full"
            >
              <TiltCard className="h-full">
                <article
                  className="industry-card h-full"
                  data-cursor="view"
                  data-cursor-label="View"
                >
                  <div className="industry-card-img bg-navy">
                    {industry.image ? (
                      <img
                        src={industry.image}
                        alt={industry.title}
                        width={1200}
                        height={640}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                  </div>
                  <div className="p-[28px_34px_34px]">
                    <h3 className="mb-[10px] text-[21px]">{industry.title}</h3>
                    <p className="mb-4 text-[15px] leading-relaxed text-slate">
                      {industry.description}
                    </p>
                    <Link
                      href={industry.link}
                      className="industry-link text-[14px] font-semibold text-crimson transition-opacity hover:opacity-75"
                    >
                      See the case study{" "}
                      <span className="industry-arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </div>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
