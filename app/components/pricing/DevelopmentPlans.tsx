import Link from "next/link";
import Reveal from "@/app/components/ui/Reveal";
import SectionHeader from "@/app/components/ui/SectionHeader";
import type { PricingPlan } from "@/app/lib/content/types";

interface DevelopmentPlansProps {
  kicker: string;
  heading: string;
  sub: string;
  plans: [PricingPlan, PricingPlan, PricingPlan];
  popularLabel: string;
}

/** SEO / Digital-marketing plan cards (tab 2) — home design system. */
export default function DevelopmentPlans({
  kicker,
  heading,
  sub,
  plans,
  popularLabel,
}: DevelopmentPlansProps) {
  return (
    <div>
      <div className="mb-[45px] text-center">
        <SectionHeader kicker={kicker} kickerCentered>
          {heading}
        </SectionHeader>
        <p className="mx-auto mt-3 max-w-[560px] text-[15px] text-slate">{sub}</p>
      </div>

      <div className="grid gap-[20px] lg:grid-cols-3">
        {plans.map((plan, index) => (
          <Reveal
            key={plan.name}
            variant="up"
            delay={index * 110}
            className={index === 1 ? "lg:-mt-[10px]" : ""}
          >
            <article
              className={`pricing-plan${plan.popular ? " is-popular" : ""}`}
            >
              {plan.popular ? (
                <span className="pricing-plan-badge">{popularLabel}</span>
              ) : null}

              <h3>{plan.name}</h3>
              <p className="pricing-plan-desc">{plan.description}</p>

              <div className="pricing-plan-price">
                <strong>${plan.price}</strong>
                <span>{plan.per}</span>
              </div>

              <ul className="pricing-plan-list">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <Link href="/contact" className="pricing-plan-btn">
                {plan.ctaLabel}
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}