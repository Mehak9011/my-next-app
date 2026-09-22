import { Fragment } from "react";
import Link from "next/link";
import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import ShotStrip from "@/app/components/home/ShotStrip";
import HeroBackground from "@/app/components/home/HeroBackground";
import RotatingWord from "@/app/components/home/RotatingWord";
import ScrollCue from "@/app/components/home/ScrollCue";
import type { HomeContent, Shot } from "@/app/lib/content/types";
import { site } from "@/app/lib/site";

/**
 * Decorative capability line that rotates through the studio's services.
 * Purely cosmetic — edit or remove this list and the Hero keeps working.
 */
const CAPABILITIES = [
  "Web Development",
  "Mobile Apps",
  "SaaS & Dashboards",
  "AI Automation",
];

/**
 * Hero: kicker, display title, subtitle, CTAs, trust badge, screenshot
 * marquee — plus the entrance sequence, aurora backdrop and scroll cue.
 * Every animation here is CSS-only (delays via inline styles), so this stays
 * a Server Component with no client JS cost.
 */
export default function Hero({
  hero,
  shots,
}: {
  hero: HomeContent["hero"];
  shots: Shot[];
}) {
  const words = hero.title.split(/\s+/).filter(Boolean);

  return (
    <section className="hero-shell pt-[100px] pb-[70px] text-center">
      <HeroBackground />

      <Container className="relative z-[1]">
        <div className="anim-rise flex items-center justify-center gap-2">
          <Kicker className="hero-kicker">
            <span className="hero-kicker-text">{hero.kicker}</span>
          </Kicker>
        </div>

        <h1 className="hero-title mx-auto mb-6 max-w-[960px]">
          {words.map((word, index) => (
            <Fragment key={`${word}-${index}`}>
              <span className="hero-word-mask">
                <span
                  className="hero-word"
                  style={{ animationDelay: `${120 + index * 70}ms` }}
                >
                  {word}
                </span>
              </span>
              {index < words.length - 1 ? " " : null}
            </Fragment>
          ))}
        </h1>

        <p
          className="anim-rise mx-auto mb-9 max-w-[600px] text-[18px] leading-relaxed text-slate"
          style={{ animationDelay: "620ms" }}
        >
          {hero.subtitle}
        </p>

        <div
          className="anim-rise mb-5 flex flex-wrap items-center justify-center gap-[14px]"
          style={{ animationDelay: "740ms" }}
        >
          <Link href={site.links.contact} className="btn-primary">
            Book a Free Consultation
          </Link>
          <Link href={site.links.caseStudies} className="btn-ghost">
            See Our Work
          </Link>
        </div>

        <div className="anim-rise" style={{ animationDelay: "860ms" }}>
          <p className="text-[12.5px] font-medium uppercase tracking-[0.14em] text-slate-light">
            We build <RotatingWord words={CAPABILITIES} />
          </p>
          <p className="mt-3 text-[13px] font-medium tracking-wide text-slate-light">
            {hero.trustBadge}
          </p>
        </div>

        <div className="anim-rise" style={{ animationDelay: "980ms" }}>
          <ScrollCue />
        </div>
      </Container>

      <div className="relative z-[1]">
        <ShotStrip shots={shots} />
      </div>
    </section>
  );
}
