import Link from "next/link";
import Reveal from "@/app/components/ui/Reveal";
import { site } from "@/app/lib/site";

/**
 * Quote break — the two full-width statements that sit between the steps
 * on the original page ("Design is intelligence made visible", "Great
 * design is great business").
 *
 * A dark band reusing the home page FinalCTA layers (cta-card / cta-grid /
 * cta-glow), so the quotes feel part of the same brand system rather than
 * a borrowed reference section. It renders as a bare card because the
 * parent step list owns the container and section rhythm — that is what
 * lets a quote appear *between* two steps.
 */
export default function ProcessQuote({
  quote,
  linkLabel,
}: {
  quote: string;
  linkLabel: string;
}) {
  return (
    <Reveal variant="scale" className="process-quote-card">
      <span className="cta-grid" aria-hidden="true" />
      <span className="cta-glow" aria-hidden="true" />

      <div className="relative">
        <span className="process-quote-mark" aria-hidden="true">
          &ldquo;
        </span>
        <p className="process-quote-text">{quote}</p>
        <Link href={site.links.contact} className="process-quote-link">
          {linkLabel} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </Reveal>
  );
}