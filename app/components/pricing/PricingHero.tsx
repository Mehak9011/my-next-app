import Link from "next/link";
import PageBanner, { type PageBannerBadge } from "@/app/components/layout/PageBanner";
import BannerCard from "@/app/components/layout/BannerCard";
import { site } from "@/app/lib/site";

interface PricingHeroProps {
  kicker: string;
  title: string;
  /** Crimson second half of the headline (ACF `title_acc` / bundled default). */
  titleAccent: string;
  subtitle: string;
}

/** Assurance chips under the copy — marketing copy only (no prices). */
const ASSURANCES: PageBannerBadge[] = [
  { spark: "✓", label: "Fixed-price scope before we start" },
  { spark: "✓", label: "No hidden fees" },
  { spark: "✓", label: "Post-launch support included" },
];

/** The three steps that turn the calculator into a fixed quote. */
const STEPS = [
  "Shape your scope — pick the services you actually need below.",
  "Get a fixed quote — we confirm the number after a short scoping call.",
  "Pay in milestones — nothing extra appears on the invoice later.",
];

/** Snapshot shown in the dark card (no prices, just how we work). */
const SNAPSHOT = [
  { value: "Fixed", label: "Price agreed upfront" },
  { value: "Milestone", label: "Friendly payment plan" },
  { value: "15 min", label: "Free consultation" },
  { value: "1 day", label: "Quote turnaround" },
];

/**
 * Pricing banner — the shared split `PageBanner` with a dark "how pricing
 * works" card. The primary action scrolls into the calculator (`#pricing-tabs`).
 */
export default function PricingHero({
  kicker,
  title,
  titleAccent,
  subtitle,
}: PricingHeroProps) {
  return (
    <PageBanner
      kicker={kicker}
      title={
        <>
          {title}
          {titleAccent ? (
            <>
              {" "}
              <span className="text-crimson">{titleAccent}</span>
            </>
          ) : null}
        </>
      }
      subtitle={subtitle}
      badges={ASSURANCES}
      actions={
        <>
          <Link href="#pricing-tabs" className="btn-primary">
            Build your package ↓
          </Link>
          <Link href={site.links.contact} className="btn-ghost">
            Talk to an expert
          </Link>
        </>
      }
      note="Every number below is an estimate — your final quote is confirmed after a short scoping call."
      aside={
        <BannerCard
          title="How pricing works"
          sub="Transparent by design — you always know what you're paying for, before anyone starts building."
          rows={STEPS}
          stats={SNAPSHOT}
          link={{ label: "Not sure which fits? Ask us →", href: site.links.contact }}
        />
      }
    />
  );
}
