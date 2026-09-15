import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Services",
  description: "Custom design, web, mobile, software, SaaS and AI automation services by CodeXmattriX.",
};

const designServices = [
  ["UI/UX Design", "Clear, conversion-focused interfaces for websites, products and dashboards.", ["User flows", "Wireframes", "Responsive UI", "Design systems"]],
  ["Product Design", "Turn an early idea into a practical digital product experience.", ["Product thinking", "Prototypes", "UX validation", "Developer handoff"]],
  ["Branding", "A consistent visual identity that makes the product feel credible and memorable.", ["Visual direction", "Logo systems", "Brand assets", "Web-ready guidelines"]],
];

const developmentServices = [
  ["Web Development", "Fast, responsive websites and custom web applications built around your goals.", ["Next.js / React", "WordPress", "Shopify", "Custom integrations"]],
  ["Mobile Apps", "Mobile experiences designed for real users, business workflows and long-term maintenance.", ["App architecture", "UI implementation", "API integration", "Release support"]],
  ["SaaS & Software", "Purpose-built software for workflows that off-the-shelf tools cannot handle.", ["Dashboards", "Authentication", "APIs", "Scalable architecture"]],
  ["AI Automation", "Practical automation that removes repetitive work and connects the tools you already use.", ["Workflow automation", "AI-assisted processes", "API connections", "Operational tooling"]],
];

function ServiceCard({ item, index }: { item: (typeof designServices)[number]; index: number }) {
  return (
    <Reveal className="rounded-[20px] border border-black/10 bg-white p-7 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <span className="text-sm font-semibold text-red">{String(index + 1).padStart(2, "0")}</span>
        <span className="h-2 w-2 rounded-full bg-red" />
      </div>
      <h3 className="mb-3 text-[25px] font-semibold tracking-tight text-ink">{item[0]}</h3>
      <p className="mb-7 leading-7 text-slate">{item[1]}</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {item[2].map((feature) => <li key={feature} className="flex gap-2 text-sm text-ink"><span className="text-red">+</span>{feature}</li>)}
      </ul>
    </Reveal>
  );
}

export default function ServicesPage() {
  return (
    <>
      <section className="border-b border-black/10 bg-panel pt-[120px] pb-[90px]">
        <Container>
          <Kicker>What we do</Kicker>
          <h1 className="hero-title max-w-[920px]">Digital products built to solve real business problems.</h1>
          <p className="mt-7 max-w-[700px] text-[18px] leading-8 text-slate">
            From product strategy and interface design to development and automation, we bring the pieces together under one team.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <span className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm">Design + Development</span>
            <span className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm">Web + Mobile</span>
            <span className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm">Product + Software</span>
          </div>
        </Container>
      </section>

      <section className="py-[90px]">
        <Container>
          <Reveal><Kicker>Design services</Kicker><h2 className="section-title max-w-[720px]">Make the experience simple before making it beautiful.</h2></Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {designServices.map((item, i) => <ServiceCard key={item[0]} item={item} index={i} />)}
          </div>
        </Container>
      </section>

      <section className="bg-panel py-[90px]">
        <Container>
          <Reveal><Kicker>Development services</Kicker><h2 className="section-title max-w-[760px]">From a marketing site to the software behind the workflow.</h2></Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {developmentServices.map((item, i) => <ServiceCard key={item[0]} item={item} index={i + 3} />)}
          </div>
        </Container>
      </section>

      <section className="px-5 py-[90px]">
        <Reveal className="mx-auto max-w-[1180px] rounded-[24px] bg-ink px-7 py-14 text-white md:px-14">
          <Kicker>Start a conversation</Kicker>
          <h2 className="max-w-[760px] text-[38px] font-semibold leading-tight md:text-[54px]">Have a product, website or workflow in mind?</h2>
          <p className="mt-5 max-w-[620px] leading-7 text-white/65">Tell us what you are trying to build. We will help shape the right scope and next step.</p>
          <Link href="/contact" className="btn-primary mt-8 inline-flex">Book a Free Consultation</Link>
        </Reveal>
      </section>
    </>
  );
}