import Link from "next/link";
import type { AboutContent } from "@/app/lib/content/types";
import { site } from "@/app/lib/site";
import PageBanner from "@/app/components/layout/PageBanner";
import BannerCard from "@/app/components/layout/BannerCard";

/** Trust chips shown under the copy. */
const BADGES = [
  { spark: "★", label: "15+ US projects delivered" },
  { spark: "⚡", label: "Design + build under one roof" },
  { spark: "🛡️", label: "Support after launch" },
];

/** Why teams hire us — the same promises as the rest of the site. */
const PROMISES = [
  "Design-first builds — every layout is decided before code, not after.",
  "Fixed scope and fixed price — confirmed before anyone starts building.",
  "Weekly demos in plain English — you always know where things stand.",
  "Post-launch support — included with the project, not an upsell.",
];

/** About banner — the shared split PageBanner with the promises card. */
export default function AboutHero({ hero }: { hero: AboutContent["hero"] }) {
  return (
    <PageBanner
      kicker={hero.kicker}
      title={
        <>
          {hero.title}{" "}
          <span className="text-crimson">{hero.titleAccent}</span>
        </>
      }
      subtitle={hero.subtitle}
      badges={BADGES}
      actions={
        <div className="page-banner-actions">
          <Link href={site.links.contact} className="btn-primary">
            {hero.ctaLabel}
          </Link>
          <Link href={site.links.caseStudies} className="btn-ghost">
            {hero.secondaryLabel}
          </Link>
        </div>
      }
      note={hero.trustBadge}
      aside={
        <BannerCard
          title="Why teams hire us"
          sub="The same promises on every project — design, build and beyond."
          rows={PROMISES}
          linkChips={[
            { label: "💬 WhatsApp", href: site.whatsappUrl, external: true },
            { label: "✉️ Email", href: `mailto:${site.email}` },
          ]}
          note="Based in Dharamshala, India — working across US time zones."
        />
      }
    />
  );
}
