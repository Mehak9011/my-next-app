import Link from "next/link";
import Reveal from "@/app/components/ui/Reveal";
import { site } from "@/app/lib/site";

interface PricingCtaProps {
  title: string;
  subtitle: string;
  buttonLabel: string;
}

/** Dark closing CTA — mirrors the home page FinalCTA card exactly. */
export default function PricingCta({ title, subtitle, buttonLabel }: PricingCtaProps) {
  return (
    <div className="px-8 pb-[80px]">
      <Reveal
        variant="scale"
        className="cta-card mx-auto max-w-[1180px] rounded-[20px] bg-ink px-10 py-[70px] text-center text-white"
      >
        <span className="cta-grid" aria-hidden="true" />
        <span className="cta-glow" aria-hidden="true" />
        <div className="relative">
          <h2 className="mb-3 text-[32px] leading-snug">{title}</h2>
          <p className="mb-7 text-[16px] text-[#A8AFB6]">{subtitle}</p>
          <Link href={site.links.contact} className="btn-primary">
            {buttonLabel}
          </Link>
        </div>
      </Reveal>
    </div>
  );
}