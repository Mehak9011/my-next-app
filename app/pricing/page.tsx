import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Flexible engagement models for custom digital product development.",
};

const models = [
  ["01", "Fixed-Scope", "Best when the requirements and deliverables are clear.", ["Defined scope and milestones", "Design + development plan", "QA and launch support", "Clear project ownership"]],
  ["02", "Time & Material", "Best when the product needs to evolve as we learn.", ["Flexible priorities", "Ongoing engineering capacity", "Iterative delivery", "Transparent progress"]],
  ["03", "Monthly Retainer", "Best for teams that need a long-term product partner.", ["Reserved team capacity", "Continuous improvements", "Maintenance and support", "Priority planning"]],
];

export default function PricingPage() {
  return (
    <>
      <section className="bg-panel pt-[120px] pb-[90px]">
        <Container>
          <Kicker>Pricing & engagement</Kicker>
          <h1 className="hero-title max-w-[900px]">The right commercial model depends on what you are building.</h1>
          <p className="mt-7 max-w-[720px] text-[18px] leading-8 text-slate">We price projects around scope, complexity, integrations and the team required. Instead of publishing artificial packages, we start with the work.</p>
        </Container>
      </section>

      <section className="py-[90px]">
        <Container>
          <div className="grid gap-5 lg:grid-cols-3">
            {models.map(([number, title, description, includes], index) => (
              <Reveal key={number} className={`rounded-[22px] border p-7 md:p-9 ${index === 1 ? "border-red/50 bg-panel" : "border-black/10"}`}>
                <div className="flex items-center justify-between"><span className="text-sm font-semibold text-red">{number}</span>{index === 1 && <span className="rounded-full bg-red px-3 py-1 text-xs font-semibold text-white">Flexible</span>}</div>
                <h2 className="mt-9 text-[30px] font-semibold tracking-tight text-ink">{title}</h2>
                <p className="mt-3 min-h-[72px] leading-7 text-slate">{description}</p>
                <div className="my-7 h-px bg-black/10" />
                <p className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-slate">Includes</p>
                <ul className="space-y-3 text-sm">{includes.map((x) => <li key={x}>✓ {x}</li>)}</ul>
                <Link href="/contact" className="btn-ghost mt-8 inline-flex w-full justify-center">Discuss this model</Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-ink py-[80px] text-white">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div><Kicker>Project investment</Kicker><h2 className="text-[38px] font-semibold leading-tight md:text-[50px]">No made-up starting price. A real scope deserves a real estimate.</h2></div>
            <div><p className="leading-8 text-white/65">After an initial conversation, we can understand the goals, scope, technical requirements and delivery approach. Then we can recommend the commercial model and estimate the project appropriately.</p><Link href="/contact" className="btn-primary mt-8 inline-flex">Get a Project Estimate</Link></div>
          </div>
        </Container>
      </section>
    </>
  );
}