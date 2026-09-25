import type { ReactNode } from "react";
import Container from "./Container";
import Kicker from "./Kicker";
import Reveal from "./Reveal";

interface PageBannerProps {
  /** Small uppercase brand label above the title. */
  kicker: string;
  /** Display heading — pass a `<span className="text-crimson">` for the accent. */
  title: ReactNode;
  /** Supporting paragraph under the title. */
  subtitle?: ReactNode;
  /** Button row (primary + ghost) under the subtitle. */
  actions?: ReactNode;
  /** Pill row — quick contact details, hours, jump links, … */
  chips?: ReactNode;
  /** Small line under everything (trust badge, consultation promise, …). */
  note?: ReactNode;
}

/**
 * Shared inner-page banner (About · Contact · Pricing).
 *
 * One primitive for every page hero so the three pages cannot drift
 * apart: panel wash + masked grid + drifting crimson glow behind a
 * centred kicker/title/subtitle, then optional actions, chips and note.
 * All copy is passed in by the page (WordPress ACF or bundled content);
 * this component never hard-codes business data.
 */
export default function PageBanner({
  kicker,
  title,
  subtitle,
  actions,
  chips,
  note,
}: PageBannerProps) {
  return (
    <section className="page-banner">
      <div className="page-banner-layer" aria-hidden="true">
        <span className="page-banner-grid" />
        <span className="page-banner-glow" />
      </div>

      <Container className="page-banner-inner">
        <Reveal variant="mask">
          <Kicker centered>{kicker}</Kicker>
          <h1 className="hero-title page-banner-title">{title}</h1>
        </Reveal>

        {subtitle ? (
          <Reveal variant="up" delay={120}>
            <p className="page-banner-sub">{subtitle}</p>
          </Reveal>
        ) : null}

        {actions ? (
          <Reveal variant="up" delay={220}>
            <div className="banner-actions">{actions}</div>
          </Reveal>
        ) : null}

        {chips ? (
          <Reveal variant="up" delay={300}>
            <div className="page-banner-chips">{chips}</div>
          </Reveal>
        ) : null}

        {note ? (
          <Reveal variant="up" delay={360}>
            <p className="page-banner-note">{note}</p>
          </Reveal>
        ) : null}
      </Container>
    </section>
  );
}
