import type { ReactNode } from "react";
import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";

/** Trust chip inside the banner (icon + short promise). */
export interface PageBannerBadge {
  spark: string;
  label: string;
}

interface PageBannerProps {
  kicker: string;
  /** Headline. Pass the crimson accent span in yourself. */
  title: ReactNode;
  subtitle: string;
  badges?: PageBannerBadge[];
  actions?: ReactNode;
  note?: ReactNode;
  /** Optional page-specific hook for scoped layout styling. */
  className?: string;
  /**
   * Dark summary card (see `BannerCard`). When present the banner switches to
   * the split layout — copy on the left, card on the right, stacked below
   * 1024px so the headline always leads.
   */
  aside?: ReactNode;
}

/**
 * Shared page banner for Contact / Pricing / About — the `.page-banner`
 * band (hairline grid + crimson glow + rule) so every inner page opens
 * with the same rhythm as the home hero. Only existing brand tokens and
 * classes are used (see "PAGE BANNER" in globals.css).
 */
export default function PageBanner({
  kicker,
  title,
  subtitle,
  badges = [],
  actions,
  note,
  aside,
  className = "",
}: PageBannerProps) {
  const copy = (
    <>
      <Reveal variant="mask">
        {/* An inline kicker follows the section's text-align, so it lines up
            with the rule and headline in both centred and split layouts. */}
        <Kicker>{kicker}</Kicker>
        <span className="page-banner-rule" aria-hidden="true" />

        <h1 className="page-banner-title hero-title">{title}</h1>
      </Reveal>

      <Reveal variant="up" delay={110}>
        <p className="page-banner-sub text-[18px] leading-relaxed text-slate">
          {subtitle}
        </p>
      </Reveal>

      {badges.length > 0 ? (
        <Reveal variant="up" delay={170}>
          <div className="page-badges">
            {badges.map((badge) => (
              <span key={badge.label} className="page-badge">
                <span className="page-badge-spark" aria-hidden="true">
                  {badge.spark}
                </span>
                {badge.label}
              </span>
            ))}
          </div>
        </Reveal>
      ) : null}

      {actions || note ? (
        <Reveal variant="up" delay={230}>
          {actions ? <div className="page-banner-actions">{actions}</div> : null}
          {note ? <div className="page-banner-note">{note}</div> : null}
        </Reveal>
      ) : null}
    </>
  );

  return (
    <section
      className={`page-banner${aside ? " page-banner--split" : ""}${
        className ? ` ${className}` : ""
      }`}
    >
      <span className="page-banner-grid" aria-hidden="true" />
      <span className="page-banner-glow" aria-hidden="true" />

      <Container className="page-banner-inner">
        {aside ? (
          <div className="page-banner-layout">
            <div>{copy}</div>

            <Reveal variant="up" delay={200} className="page-banner-aside">
              {aside}
            </Reveal>
          </div>
        ) : (
          copy
        )}
      </Container>
    </section>
  );
}
