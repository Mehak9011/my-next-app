import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about working with CodeXmattriX.",
};

const faqs = [
  ["How long does a typical project take?", "Many projects fit into an 8–12 week delivery window, but the actual schedule depends on scope, integrations, feedback and approvals."],
  ["What happens before development starts?", "We first clarify the business goals, users, requirements, technical constraints and priorities. That gives us a shared scope before implementation begins."],
  ["Do you work with existing websites and products?", "Yes. We can work with an existing website, Shopify or WordPress setup, or an existing application when the right path is to improve rather than rebuild everything."],
  ["Can you support the product after launch?", "Yes. Post-launch support can include fixes, improvements, maintenance, new features and ongoing product work depending on the engagement model."],
  ["How do we get started?", "Start with a conversation about what you are trying to achieve. We can then identify the scope, priorities and appropriate next step."],
  ["Who owns the finished work?", "Project ownership and handoff are defined as part of the engagement. We aim for a clear handover of the agreed deliverables rather than creating unnecessary lock-in."],
  ["Do you provide fixed pricing?", "Yes, when the scope is sufficiently defined. For evolving products, time-and-material or a monthly retainer can be a better fit."],
  ["Do you work with healthcare, CBD/cannabis and e-commerce businesses?", "We have experience building digital products and e-commerce experiences in these areas. The exact solution is shaped around the project's requirements and compliance considerations."],
];

export default function FaqPage() {
  return (
    <>
      <section className="bg-panel pt-[120px] pb-[90px]">
        <Container>
          <Kicker>Questions, answered</Kicker>
          <h1 className="hero-title max-w-[900px]">Everything you need to know before we start.</h1>
          <p className="mt-7 max-w-[700px] text-[18px] leading-8 text-slate">If your question is not here, send it over. A short conversation is often the fastest way to get a useful answer.</p>
        </Container>
      </section>
      <section className="py-[90px]">
        <Container>
          <div className="mx-auto max-w-[900px] space-y-4">
            {faqs.map(([question, answer], i) => (
              <Reveal key={question} className="rounded-[18px] border border-black/10 p-6 md:p-7">
                <div className="flex gap-5"><span className="pt-1 text-sm font-semibold text-red">{String(i + 1).padStart(2, "0")}</span><div><h2 className="text-[20px] font-semibold text-ink">{question}</h2><p className="mt-3 leading-7 text-slate">{answer}</p></div></div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      <section className="px-5 pb-[90px]">
        <Reveal className="mx-auto max-w-[1180px] rounded-[24px] bg-ink px-7 py-14 text-center text-white md:px-14">
          <Kicker centered>Still have a question?</Kicker><h2 className="text-[36px] font-semibold md:text-[48px]">Let&apos;s talk about your project.</h2><Link href="/contact" className="btn-primary mt-8 inline-flex">Contact Us</Link>
        </Reveal>
      </section>
    </>
  );
}