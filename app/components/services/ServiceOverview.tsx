import Link from "next/link";
import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";
import type { ServicesContent } from "@/app/lib/content/types";

/** The quick service menu that anchors into the detailed sections below. */
export default function ServiceOverview({
  overview,
}: {
  overview: ServicesContent["overview"];
}) {
  return (
    <section id="services-overview" className="services-overview-section">
      <Container>
        <Reveal variant="up">
          <Kicker>Services</Kicker>
          <h2 className="section-title">{overview.heading}</h2>
        </Reveal>

        <div className="services-overview-grid">
          {overview.groups.map((group, groupIndex) => (
            <Reveal
              key={group.title}
              variant="up"
              delay={groupIndex * 90}
              className="services-overview-group"
            >
              <h3>{group.title}</h3>
              <div className="services-overview-list">
                {group.items.map((item, index) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`service-row services-overview-link${
                      index === 0 ? "" : " has-top-border"
                    }`}
                  >
                    <span className="service-label">{item.label}</span>
                    <span className="service-arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
