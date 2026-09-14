import Link from "next/link";
import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import type { AboutContent } from "@/app/lib/content/types";
import { site } from "@/app/lib/site";

/** About hero — kicker, display title, subtitle, CTAs and trust badge. */
export default function AboutHero({ hero }: { hero: AboutContent["hero"] }) {
  return (
    <section className="pt-[110px] pb-[80px] text-center">
      <Container>
        <div className="flex justify-center">
          <Kicker>{hero.kicker}</Kicker>
        </div>

        <h1 className="hero-title mx-auto mb-6 max-w-[920px]">{hero.title}</h1>

        <p className="mx-auto mb-9 max-w-[620px] text-[18px] leading-relaxed text-slate">
          {hero.subtitle}
        </p>

        <div className="mb-4 flex flex-wrap items-center justify-center gap-[14px]">
          <Link href={site.links.contact} className="btn-primary">
            {hero.ctaLabel}
          </Link>
          <Link href={site.links.caseStudies} className="btn-ghost">
            {hero.secondaryLabel}
          </Link>
        </div>

        <p className="text-[13px] font-medium tracking-wide text-slate-light">
          {hero.trustBadge}
        </p>
      </Container>
    </section>
  );
}