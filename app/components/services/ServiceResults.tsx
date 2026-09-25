import Link from "next/link";
import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";
import type { ServicesContent, ServicesResult } from "@/app/lib/content/types";
import { site } from "@/app/lib/site";

/** Outcome cards connect service work to the industries CodeXmattriX knows. */
export default function ServiceResults({
  results,
}: {
  results: ServicesContent["results"];
}) {
  return (
    <section id="service-results" className="services-results-section">
      <Container>
        <Reveal variant="up" className="services-results-header">
          <Kicker>{results.kicker}</Kicker>
          <h2 className="section-title services-section-title">{results.heading}</h2>
          <p className="services-section-intro">{results.description}</p>
        </Reveal>

        <div className="services-results-grid">
          {results.items.map((item, index) => (
            <Reveal
              key={item.title}
              variant="scale"
              delay={index * 100}
              className="h-full"
            >
              <ResultCard item={item} index={index} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ResultCard({ item, index }: { item: ServicesResult; index: number }) {
  return (
    <article className="service-result-card">
      <div className="service-result-topline">
        <span className="service-result-index">0{index + 1}</span>
        <span className="service-result-tag">{item.tag}</span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <Link href={site.links.caseStudies} className="service-result-link">
        Explore related work <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}
