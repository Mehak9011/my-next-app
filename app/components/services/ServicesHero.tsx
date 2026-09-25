import Link from "next/link";
import BannerCard from "@/app/components/layout/BannerCard";
import PageBanner, { type PageBannerBadge } from "@/app/components/layout/PageBanner";
import type { ServicesContent } from "@/app/lib/content/types";
import { site } from "@/app/lib/site";

const BADGES: PageBannerBadge[] = [
  { spark: "✦", label: "Design-first thinking" },
  { spark: "↗", label: "Web · Mobile · Software" },
  { spark: "✓", label: "Support after launch" },
];

const PROMISES = [
  "Clear scope before we start building",
  "Design decisions tied to business goals",
  "Weekly progress in plain English",
  "A practical partner after launch",
];

/** Branded split hero for the services page. */
export default function ServicesHero({
  hero,
}: {
  hero: ServicesContent["hero"];
}) {
  return (
    <div className="services-hero">
      <PageBanner
        className="services-page-banner"
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
            <a href="#services-overview" className="btn-ghost">
              {hero.secondaryLabel}
            </a>
          </>
        }
        note={hero.trustBadge}
        aside={
          <BannerCard
            title="One team, end to end"
            sub="From the first conversation to the product your team uses every day."
            rows={PROMISES}
            stats={[
              { value: "15+", label: "Projects delivered" },
              { value: "8–12 wks", label: "Typical timeline" },
            ]}
            link={{ label: "See what we build →", href: "#service-details" }}
          />
        }
      />
    </div>
  );
}
