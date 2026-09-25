import Link from "next/link";
import CtaBanner from "@/app/components/ui/CtaBanner";
import type { ServicesContent } from "@/app/lib/content/types";
import { site } from "@/app/lib/site";

/** Shared dark consultation CTA for the end of the services page. */
export default function ServicesCta({
  cta,
  points,
}: {
  cta: ServicesContent["cta"];
  points: string[];
}) {
  return (
    <div className="services-cta-wrap">
      <CtaBanner
        kicker={cta.kicker}
        title={cta.title}
        subtitle={cta.subtitle}
        points={points}
        actions={
          <>
            <Link href={site.links.contact} className="btn-primary">
              {cta.buttonLabel}
            </Link>
            <Link href={site.links.pricing} className="btn-ghost">
              Explore Pricing
            </Link>
          </>
        }
      />
    </div>
  );
}
