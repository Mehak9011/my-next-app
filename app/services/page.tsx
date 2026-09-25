import type { Metadata } from "next";
import ServiceDetails from "@/app/components/services/ServiceDetails";
import ServiceOverview from "@/app/components/services/ServiceOverview";
import ServiceResults from "@/app/components/services/ServiceResults";
import ServiceSupport from "@/app/components/services/ServiceSupport";
import ServicesCta from "@/app/components/services/ServicesCta";
import ServicesHero from "@/app/components/services/ServicesHero";
import { defaultServicesContent } from "@/app/lib/content/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Custom design, web, mobile, software, SaaS and AI automation services by CodeXmattriX.",
};

/** Services — a project-owned, fully designed Next.js page. */
export default function ServicesPage() {
  const content = defaultServicesContent;

  return (
    <div className="services-page">
      <ServicesHero hero={content.hero} />
      <ServiceOverview overview={content.overview} />
      <ServiceDetails intro={content.detailsIntro} details={content.details} />
      <ServiceResults results={content.results} />
      <ServiceSupport support={content.support} />
      <ServicesCta cta={content.cta} points={content.support.points} />
    </div>
  );
}
