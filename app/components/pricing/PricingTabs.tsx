"use client";

import { useState } from "react";
import Container from "@/app/components/ui/Container";
import SectionHeader from "@/app/components/ui/SectionHeader";
import type { PricingContent } from "@/app/lib/content/types";
import DesignCalculator from "./DesignCalculator";
import DevelopmentPlans from "./DevelopmentPlans";

interface PricingTabsProps {
  design: PricingContent["design"];
  development: PricingContent["development"];
  contactHref: string;
}

/** "Custom Premium" / "Digital Marketing & SEO" switch + tab panels. */
export default function PricingTabs({ design, development, contactHref }: PricingTabsProps) {
  const [active, setActive] = useState<"design" | "development">("design");

  return (
    <div className="pb-[100px]">
      <Container>
        <div className="mb-[50px] flex justify-center">
          <div className="pricing-switch" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={active === "design"}
              className={`pricing-switch-btn${active === "design" ? " is-active" : ""}`}
              onClick={() => setActive("design")}
            >
              {design.tabLabel}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={active === "development"}
              className={`pricing-switch-btn${active === "development" ? " is-active" : ""}`}
              onClick={() => setActive("development")}
            >
              {development.tabLabel}
            </button>
          </div>
        </div>

        {active === "design" ? (
          <section id="design">
            <div className="mb-[45px] text-center">
              <SectionHeader kicker={design.kicker} kickerCentered>
                {design.heading}
              </SectionHeader>
              <p className="mx-auto mt-3 max-w-[560px] text-[15px] text-slate">
                {design.sub}
              </p>
            </div>
            <DesignCalculator design={design} contactHref={contactHref} />
          </section>
        ) : (
          <section id="development">
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
    </div>
  );
}