import type { Metadata } from "next";
import ProcessCta from "@/app/components/process/ProcessCta";
import ProcessHero from "@/app/components/process/ProcessHero";
import ProcessSteps from "@/app/components/process/ProcessSteps";
import ProcessSupport from "@/app/components/process/ProcessSupport";
import { defaultProcessContent } from "@/app/lib/content/process";

export const metadata: Metadata = {
  title: "Our Process",
  description:
    "How CodeXmattriX works — a clear four-step path from discovery and design to build, launch and ongoing support.",
};

/**
 * Process — a project-owned, fully designed Next.js page.
 *
 * Follows the same journey as the original /our-process/ page: a branded
 * hero, the numbered delivery steps, the ongoing support promise and the
 * closing consultation CTA. All copy lives in
 * app/lib/content/process.ts, all design in app/components/process/* and
 * the "PROCESS PAGE" block in globals.css. WordPress only registers the
 * /process URL.
 *
 * The two quote breaks from the original page are woven through the step
 * list — one after every second step — so the quotes read as punctuation
 * in the middle of the journey rather than a separate block at the end.
 */
export default function ProcessPage() {
  const content = defaultProcessContent;

  return (
    <div className="process-page">
      <ProcessHero hero={content.hero} />
      <ProcessSteps
        intro={content.stepsIntro}
        steps={content.steps}
        quotes={content.quotes}
      />
      <ProcessSupport support={content.support} />
      <ProcessCta cta={content.cta} />
    </div>
  );
}