import type { Metadata } from "next";
import AboutCta from "@/app/components/about/AboutCta";
import AboutHero from "@/app/components/about/AboutHero";
import Mission from "@/app/components/about/Mission";
import Story from "@/app/components/about/Story";
import Team from "@/app/components/about/Team";
import Values from "@/app/components/about/Values";
import Stats from "@/app/components/home/Stats";
import { defaultAboutContent } from "@/app/lib/content/about";

export const metadata: Metadata = {
  title: "About",
  description:
    "The team behind the work — our story, mission, values and what drives CodeXmattriX.",
};

/**
 * About Us.
 *
 * Designed and built 100% in Next.js (components + Tailwind + Reveal
 * animations live under app/components/about/*). Content is bundled
 * in Next.js too (app/lib/content/about.ts).
 *
 * WordPress contributes exactly one thing: the published "about" page
 * that registers the /about/ URL — see HEADLESS-WORDPRESS-GUIDE.md.
 */
export default function AboutPage() {
  const content = defaultAboutContent;

  return (
    <>
      <AboutHero hero={content.hero} />
      <Story story={content.story} />
      <Mission mission={content.mission} />
      <Stats stats={content.stats} />
      <Values values={content.values} />
      <Team team={content.team} />
      <AboutCta cta={content.cta} />
    </>
  );
}