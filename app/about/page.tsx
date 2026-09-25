import type { Metadata } from "next";
import AboutHero from "@/app/components/about/AboutHero";
import Stats from "@/app/components/home/Stats";
import Story from "@/app/components/about/Story";
import Mission from "@/app/components/about/Mission";
import Values from "@/app/components/about/Values";
import Team from "@/app/components/about/Team";
import AboutCta from "@/app/components/about/AboutCta";
import { defaultAboutContent } from "@/app/lib/content/about";

export const metadata: Metadata = {
  title: "About",
  description:
    "CodeXmattriX — a design and development studio in Dharamshala, India building high-performing websites, apps and software for growing US brands.",
};

/**
 * About — fully designed and populated in Next.js (see
 * app/lib/content/about.ts for the copy and app/components/about/* for
 * the design). WordPress only registers the /about/ URL.
 */
export default function AboutPage() {
  const content = defaultAboutContent;

  return (
    <>
      <AboutHero hero={content.hero} />
      <Stats stats={content.stats} />
      <Story story={content.story} />
      <Mission mission={content.mission} />
      <Values values={content.values} />
      <Team team={content.team} />
      <AboutCta cta={content.cta} />
    </>
  );
}