import { getHomeContent } from "@/app/lib/wordpress";
import Hero from "@/app/components/home/Hero";
import Stats from "@/app/components/home/Stats";
import Services from "@/app/components/home/Services";
import Industries from "@/app/components/home/Industries";
import Testimonials from "@/app/components/home/Testimonials";
import FAQ from "@/app/components/home/FAQ";
import FinalCTA from "@/app/components/home/FinalCTA";
import Clients from "@/app/components/home/Clients";

/**
 * Home Page — every section is a small reusable component.
 * Content comes from WordPress when enabled (see lib/wordpress.ts),
 * otherwise the bundled defaults keep the page fully functional.
 */
export default async function HomePage() {
  const content = await getHomeContent();

  return (
    <>
      <Hero hero={content.hero} shots={content.shots} />
      <Stats stats={content.stats} />
      <Services heading={content.services.heading} groups={content.services.groups} />
      <Industries
        heading={content.industries.heading}
        items={content.industries.items}
      />
      <Testimonials
        heading={content.testimonials.heading}
        items={content.testimonials.items}
      />
      <FAQ heading={content.faqs.heading} items={content.faqs.items} />
      <FinalCTA cta={content.cta} />
      <Clients clients={content.clients} />
    </>
  );
}
