import type { Metadata } from "next";
import PricingHero from "@/app/components/pricing/PricingHero";
import PricingTabs from "@/app/components/pricing/PricingTabs";
import PricingCta from "@/app/components/pricing/PricingCta";
import { getPricingContent } from "@/app/lib/wordpress";
import { pricingContactHref } from "@/app/lib/content/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Build your package. Know your price.",
};

/**
 * Pricing page — design calculator + SEO plans.
 * Content comes from WordPress ACF with bundled defaults as fallback.
 */
export default async function PricingPage() {
  const content = await getPricingContent();

  return (
    <div className="pricing-page">
      <PricingHero
        kicker={content.hero.kicker}
        title={content.hero.title}
        titleAccent={content.hero.titleAccent}
        subtitle={content.hero.subtitle}
      />

      <PricingTabs
        design={content.design}
        webdev={content.webdev}
        development={content.development}
        contactHref={pricingContactHref}
      />

      <PricingCta
        title={content.cta.title}
        subtitle={content.cta.subtitle}
        buttonLabel={content.cta.buttonLabel}
      />
    </div>
  );
}