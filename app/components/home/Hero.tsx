import Link from "next/link";
import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import ShotStrip from "@/app/components/home/ShotStrip";
import type { HomeContent, Shot } from "@/app/lib/content/types";
import { site } from "@/app/lib/site";

/** Hero: kicker, display title, subtitle, CTAs, trust badge, screenshot marquee. */
export default function Hero({
  hero,
  shots,
}: {
  hero: HomeContent["hero"];
  shots: Shot[];
}) {
  return (
    <section className="pt-[100px] pb-[70px] text-center">
      <Container>
        <div className="flex items-center justify-center gap-2">
          <Kicker>{hero.kicker}</Kicker>
        </div>

        <h1 className="hero-title mx-auto mb-6 max-w-[960px]">
          {hero.title}
        </h1>

        <p className="mx-auto mb-9 max-w-[600px] text-[18px] leading-relaxed text-slate">
          {hero.subtitle}
        </p>

        <div className="mb-4 flex flex-wrap items-center justify-center gap-[14px]">
          <Link href={site.links.contact} className="btn-primary">
            Book a Free Consultation
          </Link>
          <Link href={site.links.caseStudies} className="btn-ghost">
            See Our Work
          </Link>
        </div>

        <p className="text-[13px] font-medium tracking-wide text-slate-light">
          {hero.trustBadge}
        </p>
      </Container>

      <ShotStrip shots={shots} />
    </section>
  );
}