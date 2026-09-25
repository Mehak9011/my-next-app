import Link from "next/link";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";
import type { AboutContent } from "@/app/lib/content/types";
import { site } from "@/app/lib/site";

/** About closing CTA — the dark card treatment shared with the home FinalCTA. */
export default function AboutCta({ cta }: { cta: AboutContent["cta"] }) {
  return (
    <div className="px-8 pb-[100px]">
      <Reveal
        variant="scale"
        className="cta-card mx-auto max-w-[1180px] rounded-[20px] bg-ink px-10 py-[70px] text-center text-white"
      >
        <span className="cta-grid" aria-hidden="true" />
        <span className="cta-glow" aria-hidden="true" />
        <div className="relative">
          <div className="flex justify-center">
            <Kicker>{cta.kicker}</Kicker>
          </div>
          <h2 className="mb-3 text-[32px] leading-snug">{cta.title}</h2>
          <p className="mx-auto mb-7 max-w-[560px] text-[16px] text-[#A8AFB6]">
            {cta.subtitle}
          </p>
          <Link href={site.links.contact} className="btn-primary">
            {cta.buttonLabel}
          </Link>
        </div>
      </Reveal>
    </div>
  );
}