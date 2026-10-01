import Link from "next/link";
import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";
import type { ProcessContent } from "@/app/lib/content/types";
import { site } from "@/app/lib/site";

/**
 * Ongoing design support — the "what happens after launch" section.
 *
 * Split layout: promise and copy on the left, a dark numbered card on the
 * right, matching the services support block so the two pages feel like
 * one system.
 */
export default function ProcessSupport({
  support,
}: {
  support: ProcessContent["support"];
}) {
  return (
    <section id="ongoing-support" className="process-support-section">
      <Container>
        <div className="process-support-grid">
          <Reveal variant="left">
            <Kicker>{support.kicker}</Kicker>
            <h2 className="section-title process-section-title">{support.heading}</h2>
            <p className="process-section-tagline">{support.tagline}</p>
            <p className="process-section-intro">{support.copy}</p>
            <Link href={site.links.contact} className="btn-primary process-support-cta">
              Talk to us about support <span aria-hidden="true">→</span>
            </Link>
          </Reveal>

          <Reveal variant="right" delay={120}>
            <div className="process-support-card">
              <div className="process-support-card-heading">
                <span className="process-step-panel-label">After launch</span>
                <span className="process-support-card-mark" aria-hidden="true">
                  ↗
                </span>
              </div>
              <ul className="process-support-list">
                {support.points.map((point, index) => (
                  <li key={point}>
                    <span className="process-support-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <p className="process-support-note">
                A long-term partner for the work that comes after the first release.
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}