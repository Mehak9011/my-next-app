import Link from "next/link";
import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";
import type { ServicesContent } from "@/app/lib/content/types";
import { site } from "@/app/lib/site";

/** Post-launch support block adapted to the studio's ongoing-care promise. */
export default function ServiceSupport({
  support,
}: {
  support: ServicesContent["support"];
}) {
  return (
    <section id="ongoing-support" className="services-support-section">
      <Container>
        <div className="services-support-grid">
          <Reveal variant="left">
            <Kicker>{support.kicker}</Kicker>
            <h2 className="section-title services-section-title">{support.heading}</h2>
            <p className="services-section-intro">{support.copy}</p>
            <Link href={site.links.contact} className="btn-primary services-support-cta">
              Talk to us about support <span aria-hidden="true">→</span>
            </Link>
          </Reveal>

          <Reveal variant="right" delay={120}>
            <div className="services-support-card">
              <div className="services-support-card-heading">
                <span className="service-detail-panel-label">After launch</span>
                <span className="service-support-card-mark" aria-hidden="true">
                  ↗
                </span>
              </div>
              <ul className="services-support-list">
                {support.points.map((point, index) => (
                  <li key={point}>
                    <span className="service-support-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <p className="services-support-note">
                A long-term partner for the work that comes after the first release.
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
