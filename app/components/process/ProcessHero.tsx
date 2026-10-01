import Link from "next/link";
import BannerCard from "@/app/components/layout/BannerCard";
import PageBanner, { type PageBannerBadge } from "@/app/components/layout/PageBanner";
import type { ProcessContent } from "@/app/lib/content/types";
import { site } from "@/app/lib/site";

const BADGES: PageBannerBadge[] = [
  { spark: "✦", label: "Design-first thinking" },
  { spark: "↗", label: "Web · Mobile · Software" },
  { spark: "✓", label: "Support after launch" },
];

/** The four stage names, repeated in the banner card as a quick map. */
const STAGE_ROWS = [
  "Discovery — goals, scope and timeline",
  "Design — wireframes and UI you can see",
  "Build — clean code, tested everywhere",
  "Launch — go live, then keep improving",
];

/**
 * Branded split hero for the process page.
 *
 * Reuses the shared PageBanner (panel wash, hairline grid, crimson glow)
 * and the dark BannerCard, so the page opens with exactly the same rhythm
 * as /about and /services instead of importing the old reference layout.
 */
export default function ProcessHero({
  hero,
}: {
  hero: ProcessContent["hero"];
}) {
  return (
    <div className="process-hero">
      <PageBanner
        className="process-page-banner"
        kicker={hero.kicker}
        title={
          <>
            {hero.title} <span className="text-crimson">{hero.titleAccent}</span>
          </>
        }
        subtitle={hero.subtitle}
        badges={BADGES}
        actions={
          <>
            <Link href={site.links.contact} className="btn-primary">
              {hero.ctaLabel}
            </Link>
            <a href="#process-steps" className="btn-ghost">
              {hero.secondaryLabel}
            </a>
          </>
        }
        note={hero.trustBadge}
        aside={
          <BannerCard
            title="The four stages"
            sub="The same sequence on every project — so you always know what comes next."
            rows={STAGE_ROWS}
            link={{ label: "Read the full process →", href: "#process-steps" }}
          />
        }
      />
    </div>
  );
}