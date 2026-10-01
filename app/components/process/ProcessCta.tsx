import Link from "next/link";
import CtaBanner from "@/app/components/ui/CtaBanner";
import type { ProcessContent } from "@/app/lib/content/types";
import { site } from "@/app/lib/site";

/**
 * Shared dark consultation CTA for the end of the process page.
 *
 * Uses the same CtaBanner as the services page, including the four
 * site-wide "what happens next" promises, so the close of every inner
 * page is identical.
 */
export default function ProcessCta({
  cta,
}: {
  cta: ProcessContent["cta"];
}) {
  return (
    <div className="process-cta-wrap">
      <CtaBanner
        kicker={cta.kicker}
        title={cta.title}
        subtitle={cta.subtitle}
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