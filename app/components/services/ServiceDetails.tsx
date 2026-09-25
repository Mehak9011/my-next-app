import Link from "next/link";
import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";
import type { ServiceDetail, ServicesContent } from "@/app/lib/content/types";
import { site } from "@/app/lib/site";

/** Alternating service detail blocks, each addressable from the overview links. */
export default function ServiceDetails({
  intro,
  details,
}: {
  intro: ServicesContent["detailsIntro"];
  details: ServiceDetail[];
}) {
  return (
    <section id="service-details" className="services-details-section">
      <Container>
        <Reveal variant="up" className="services-details-header">
          <Kicker>{intro.kicker}</Kicker>
          <h2 className="section-title services-section-title">{intro.heading}</h2>
          <p className="services-section-intro">{intro.intro}</p>
        </Reveal>

        <div className="services-detail-list">
          {details.map((detail, index) => (
            <Reveal
              key={detail.id}
              variant={index % 2 === 0 ? "left" : "right"}
              delay={index * 70}
              className="h-full"
            >
              <article
                id={detail.id}
                className={`service-detail-row${index % 2 === 1 ? " is-reverse" : ""}`}
              >
                <div className="service-detail-copy">
                  <div className="service-detail-meta">
                    <span className="service-detail-number">{detail.number}</span>
                    <span>{detail.category}</span>
                  </div>
                  <h3>{detail.title}</h3>
                  <p className="service-detail-summary">{detail.summary}</p>
                  <p className="service-detail-description">{detail.description}</p>
                  <Link href={site.links.contact} className="service-detail-link">
                    Discuss this service <span aria-hidden="true">→</span>
                  </Link>
                </div>

                <div className="service-detail-panel">
                  <div className="service-detail-panel-label">What you get</div>
                  <ul className="service-feature-list">
                    {detail.features.map((feature) => (
                      <li key={feature}>
                        <span className="service-feature-mark" aria-hidden="true">
                          ✓
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="service-outcome">
                    <span>Outcome</span>
                    <p>{detail.outcome}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
