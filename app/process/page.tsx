import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Our Process",
  description: "A clear five-step process from discovery to launch.",
};

const steps: [string, string, string, string[]][] = [
  ["01", "Discovery", "We understand the business, users, technical constraints and what success needs to look like.", ["Goals & requirements", "Technical direction", "Scope & priorities"]],
  ["02", "Design", "We turn the requirements into an experience that is easy to understand, use and build.", ["User journeys", "Wireframes & UI", "Responsive states"]],
  ["03", "Development", "The approved experience becomes a working product with clean, maintainable implementation.", ["Frontend development", "Backend / API work", "Integrations"]],
  ["04", "QA", "We test the experience across devices, browsers and important user flows before release.", ["Functional testing", "Responsive checks", "Bug fixing"]],
  ["05", "Launch", "We prepare the production release, monitor the handoff and help the team move forward.", ["Deployment", "Launch checks", "Post-launch support"]],
];

export default function ProcessPage() {
  return (
    <>
      <section className="bg-panel pt-[120px] pb-[90px]">
        <Container>
          <Kicker>How we work</Kicker>
          <h1 className="hero-title max-w-[900px]">A practical process with no mystery between idea and launch.</h1>
          <p className="mt-7 max-w-[700px] text-[18px] leading-8 text-slate">We keep strategy, design, development and QA connected so decisions are made early and delivery stays focused.</p>
        </Container>
      </section>

      <section className="py-[90px]">
        <Container>
          <div className="space-y-5">
            {steps.map(([number, title, description, deliverables]) => (
              <Reveal key={number} className="grid gap-7 rounded-[22px] border border-black/10 p-7 md:grid-cols-[90px_1fr_1fr] md:p-9">
                <div className="text-sm font-semibold text-red">{number}</div>
                <div><h2 className="text-[30px] font-semibold tracking-tight text-ink">{title}</h2><p className="mt-3 max-w-[520px] leading-7 text-slate">{description}</p></div>
                <div className="rounded-[16px] bg-panel p-5"><p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-slate">Typical outputs</p><ul className="space-y-2 text-sm text-ink">{deliverables.map((x) => <li key={x}>— {x}</li>)}</ul></div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-ink py-[80px] text-white">
        <Container>
          <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
            <div><Kicker>Delivery rhythm</Kicker><h2 className="text-[34px] font-semibold md:text-[46px]">Typical projects move through focused 8–12 week delivery windows.</h2><p className="mt-4 max-w-[680px] leading-7 text-white/65">The exact timeline depends on scope, feedback cycles, integrations and approvals. We set the schedule around the actual project rather than forcing every build into the same template.</p></div>
            <div className="rounded-[20px] border border-white/15 px-8 py-7 text-center"><div className="text-5xl font-semibold">8–12</div><div className="mt-2 text-sm text-white/60">weeks, typical</div></div>
          </div>
        </Container>
      </section>

      <section className="px-5 py-[80px]">
        <Reveal className="mx-auto max-w-[1180px] rounded-[24px] bg-panel p-8 text-center md:p-14">
          <Kicker centered>Ready?</Kicker><h2 className="section-title mx-auto max-w-[720px]">Bring us the problem. We will help define the path.</h2>
          <Link href="/contact" className="btn-primary mt-8 inline-flex">Book a Free Consultation</Link>
        </Reveal>
      </section>
    </>
  );
}