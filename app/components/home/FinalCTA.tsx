import Link from "next/link";
import Reveal from "@/app/components/ui/Reveal";
import type { HomeContent } from "@/app/lib/content/types";
import { site } from "@/app/lib/site";

/** Final dark CTA card with the primary consultation button. */
export default function FinalCTA({ cta }: { cta: HomeContent["cta"] }) {
  return (
    <div className="px-8">
      <Reveal className="mx-auto max-w-[1180px] rounded-[20px] bg-ink px-10 py-[70px] text-center text-white">
        <h2 className="mb-3 text-[32px] leading-snug">{cta.title}</h2>
        <p className="mb-7 text-[16px] text-[#A8AFB6]">{cta.subtitle}</p>
        <Link href={site.links.contact} className="btn-primary">
          {cta.buttonLabel}
        </Link>
      </Reveal>
    </div>
  );
}