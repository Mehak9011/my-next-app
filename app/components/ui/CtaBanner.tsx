import type { ReactNode } from "react";
import Reveal from "./Reveal";

/** Same promise the site makes on the contact page — reused, never invented per page. */
export const DEFAULT_CTA_POINTS = [
  "Reply within one business day",
  "Free 15-minute discovery call",
  "Clear scope, price and timeline",
  "No pressure, no obligation",
];

interface CtaBannerProps {
  /** Optional small uppercase label above the title. */
  kicker?: string;
  title: string;
  subtitle: string;
  /** Button row (primary + secondary link). */
  actions: ReactNode;
  /** Heading for the right-hand checklist card. */
  pointsHeading?: string;
  /** Checklist items — defaults to the site-wide consultation promise. */
  points?: string[];
}

/**
 * Dark closing CTA banner used by About, Contact and Pricing.
 *
 * Left column = message + actions, right column = a translucent
 * checklist card. Visuals reuse the home page FinalCTA layers
 * (cta-card / cta-grid / cta-glow), so the dark band looks identical
 * everywhere. Content comes from the page (ACF or bundled content).
 */
export default function CtaBanner({
  kicker,
  title,
  subtitle,
  actions,
  pointsHeading = "What happens next",
  points = DEFAULT_CTA_POINTS,
}: CtaBannerProps) {
  const items = points.filter((point) => point.trim().length > 0);

  return (
    <div className="px-8 pb-[80px]">
      <Reveal
        variant="scale"
        className="cta-card cta-banner mx-auto max-w-[1180px]"
      >
        <span className="cta-grid" aria-hidden="true" />
        <span className="cta-glow" aria-hidden="true" />

        <div className="relative">
          {kicker ? <p className="kicker mb-3 lg:mb-4">{kicker}</p> : null}
          <h2 className="cta-banner-title">{title}</h2>
          <p className="cta-banner-sub">{subtitle}</p>
          <div className="banner-actions">{actions}</div>
        </div>

        {items.length > 0 ? (
          <div className="cta-points relative">
            <h3>{pointsHeading}</h3>
            <ul>
              {items.map((point) => (
                <li key={point}>
                  <span className="cta-point-mark" aria-hidden="true">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Reveal>
    </div>
  );
}
