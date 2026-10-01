import Link from "next/link";
import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";
import ProcessQuote from "@/app/components/process/ProcessQuote";
import type { ProcessContent, ProcessStep } from "@/app/lib/content/types";
import { site } from "@/app/lib/site";

/**
 * The numbered delivery steps, with the quote breaks woven between them.
 *
 * Each step is an alternating two-column row: the copy (number badge,
 * phase, title, tagline, description) on one side and a dark deliverables
 * panel on the other. Odd rows reverse the order so the eye zig-zags down
 * the page — the same rhythm the services page uses for its detail cards.
 *
 * A quote is inserted after every second step (steps 2 and 4), matching
 * the original page where the two statements break up the list.
 */
export default function ProcessSteps({
  intro,
  steps,
  quotes,
}: {
  intro: ProcessContent["stepsIntro"];
  steps: ProcessStep[];
  quotes: ProcessContent["quotes"];
}) {
  // A quote `i` follows step index 2i+1 (i.e. steps 2 and 4). Rendering it
  // inside the list — rather than after the section — is what puts the
  // statement mid-journey instead of after every step.
  const quoteAfterStep = (index: number) =>
    index % 2 === 1 ? quotes[Math.floor((index - 1) / 2)] : undefined;

  return (
    <section id="process-steps" className="process-steps-section">
      <Container>
        <Reveal variant="up" className="process-steps-header">
          <Kicker>{intro.kicker}</Kicker>
          <h2 className="section-title process-section-title">{intro.heading}</h2>
          <p className="process-section-intro">{intro.intro}</p>
        </Reveal>

        <div className="process-step-list">
          {steps.map((step, index) => (
            <div key={step.id} className="process-step-item">
              <Reveal
                variant={index % 2 === 0 ? "left" : "right"}
                delay={(index % 2) * 70}
                className="h-full"
              >
                <article
                  id={step.id}
                  className={`process-step-row${index % 2 === 1 ? " is-reverse" : ""}`}
                >
                  <div className="process-step-copy">
                    <div className="process-step-meta">
                      <span className="process-step-number">{step.number}</span>
                      <span>{step.phase}</span>
                    </div>
                    <h3>{step.title}</h3>
                    <p className="process-step-tagline">{step.tagline}</p>
                    <p className="process-step-description">{step.description}</p>
                    <Link href={site.links.contact} className="process-step-link">
                      Discuss this stage <span aria-hidden="true">→</span>
                    </Link>
                  </div>

                  <div className="process-step-panel">
                    <div className="process-step-panel-label">What you get</div>
                    <ul className="process-deliverables">
                      {step.deliverables.map((item) => (
                        <li key={item}>
                          <span className="process-deliverable-mark" aria-hidden="true">
                            ✓
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="process-outcome">
                      <span>Outcome</span>
                      <p>{step.outcome}</p>
                    </div>
                  </div>
                </article>
              </Reveal>

              {/* Quote break after every second step (see quoteAfterStep). */}
              {(() => {
                const quote = quoteAfterStep(index);
                return quote ? <ProcessQuote {...quote} /> : null;
              })()}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}