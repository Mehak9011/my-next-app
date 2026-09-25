"use client";

import Link from "next/link";
import { useState } from "react";
import Container from "@/app/components/ui/Container";
import SectionHeader from "@/app/components/ui/SectionHeader";
import type { PricingContent } from "@/app/lib/content/types";
import DesignCalculator from "./DesignCalculator";
import DevelopmentPlans from "./DevelopmentPlans";

interface PricingTabsProps {
  design: PricingContent["design"];
  webdev: PricingContent["webdev"];
  development: PricingContent["development"];
  contactHref: string;
}

type TabKey = "design" | "webdev" | "development";

/**
 * Designing / Development / Digital Marketing & SEO switch + tab panels.
 * The middle "Development" tab is always visible: with WordPress ACF
 * data (webdev.cmsReady) it shows the Yes/No calculator, otherwise a
 * heading + quote-CTA empty state — never placeholder prices.
 */
export default function PricingTabs({
  design,
  webdev,
  development,
  contactHref,
}: PricingTabsProps) {
  const [active, setActive] = useState<TabKey>("design");

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: design.id, label: design.tabLabel },
    { key: webdev.id, label: webdev.tabLabel },
    { key: development.id, label: development.tabLabel },
  ];

  return (
    <section
      id="pricing-tabs"
      className="pricing-calculator-section"
      aria-label="Pricing calculator"
    >
      <Container>
        <div className="pricing-switch-wrap">
          <div className="pricing-switch" role="tablist" aria-label="Pricing services">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active === tab.key}
                className={`pricing-switch-btn${active === tab.key ? " is-active" : ""}`}
                onClick={() => setActive(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {active === "design" ? (
          <section id="design" className="pricing-tab-panel">
            <div className="pricing-panel-heading">
              <SectionHeader kicker={design.kicker} kickerCentered>
                {design.heading}
              </SectionHeader>
              <p className="mx-auto mt-3 max-w-[560px] text-[15px] text-slate">
                {design.sub}
              </p>
            </div>
            <DesignCalculator design={design} contactHref={contactHref} />
          </section>
        ) : active === "webdev" ? (
          <section id="webdev" className="pricing-tab-panel">
            {webdev.cmsReady ? (
              <DesignCalculator design={webdev} contactHref={contactHref} />
            ) : (
              <div>
                <div className="pricing-panel-heading">
                  <SectionHeader kicker={webdev.kicker} kickerCentered>
                    {webdev.heading}
                  </SectionHeader>
                  <p className="mx-auto mt-3 max-w-[560px] text-[15px] text-slate">
                    {webdev.sub}
                  </p>
                </div>
                {/* No CMS plan data yet — heading + quote CTA only,
                    never placeholder prices (per content requirement). */}
                <div className="pricing-empty">
                  <Link href={contactHref} className="btn-primary">
                    Request a Custom Quote →
                  </Link>
                </div>
              </div>
            )}
          </section>
        ) : (
          <section id="development" className="pricing-tab-panel">
            <DevelopmentPlans
              kicker={development.kicker}
              heading={development.heading}
              sub={development.sub}
              plans={development.plans}
              popularLabel={development.popularLabel}
            />
          </section>
        )}
      </Container>
    </section>
  );
}