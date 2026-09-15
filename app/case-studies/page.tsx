import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "Selected digital product and e-commerce work across healthcare, CBD and growing brands.",
};

const cases = [
  { type: "Healthcare", title: "MMJ Docs / EHR", summary: "A healthcare-focused digital product experience designed around structured workflows and a clear user journey.", challenge: "Healthcare products need clarity, reliable workflows and interfaces that reduce friction.", solution: "A focused product experience with the interface and development work organized around the underlying workflow.", result: "Selected project experience; detailed outcome metrics are intentionally not published without verified client data." },
  { type: "E-commerce", title: "CBD & Cannabis", summary: "E-commerce experiences for businesses operating in a category where product presentation and purchasing flows need careful attention.", challenge: "Create a trustworthy shopping experience while working within the requirements of the category and platform.", solution: "Custom storefront work, product-focused UI and practical commerce improvements.", result: "Selected project experience; no unverified conversion or revenue claims are published." },
  { type: "Jewelry", title: "Jewelry E-commerce", summary: "Premium storefront experiences where visual presentation, product discovery and mobile usability are central.", challenge: "Make a product-led catalog feel premium while keeping browsing and purchasing simple.", solution: "Custom storefront sections, theme work and product-focused interface improvements.", result: "Selected project experience; specific business results are available only where verified." },
  { type: "E-commerce", title: "Growing Brands", summary: "Flexible web and commerce builds for brands that need a stronger digital foundation.", challenge: "Move from an off-the-shelf experience to a site that better reflects the brand and workflow.", solution: "A combination of design, frontend implementation and platform customization.", result: "Project outcomes vary by engagement; detailed figures are not claimed without source data." },
];

export default function CaseStudiesPage() {
  return (
    <>
      <section className="bg-panel pt-[120px] pb-[90px]">
        <Container>
          <Kicker>Selected work</Kicker>
          <h1 className="hero-title max-w-[940px]">Work shaped around the industry, the user and the problem.</h1>
          <p className="mt-7 max-w-[720px] text-[18px] leading-8 text-slate">A snapshot of the kinds of digital products and commerce experiences we build. We keep the claims factual rather than filling case studies with invented numbers.</p>
        </Container>
      </section>
      <section className="py-[90px]">
        <Container>
          <div className="grid gap-5 md:grid-cols-2">
            {cases.map((item, i) => (
              <Reveal key={item.title} className="group rounded-[22px] border border-black/10 p-7 md:p-9">
                <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[.16em] text-red">{item.type}</span><span className="text-sm text-slate">{String(i + 1).padStart(2, "0")}</span></div>
                <h2 className="mt-8 text-[30px] font-semibold tracking-tight text-ink">{item.title}</h2>
                <p className="mt-3 leading-7 text-slate">{item.summary}</p>
                <div className="mt-8 grid gap-5 border-t border-black/10 pt-7">
                  <div><h3 className="text-xs font-bold uppercase tracking-[.16em] text-slate">Challenge</h3><p className="mt-2 text-sm leading-6 text-ink">{item.challenge}</p></div>
                  <div><h3 className="text-xs font-bold uppercase tracking-[.16em] text-slate">Solution</h3><p className="mt-2 text-sm leading-6 text-ink">{item.solution}</p></div>
                  <div><h3 className="text-xs font-bold uppercase tracking-[.16em] text-slate">Result</h3><p className="mt-2 text-sm leading-6 text-ink">{item.result}</p></div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      <section className="px-5 pb-[90px]">
        <Reveal className="mx-auto max-w-[1180px] rounded-[24px] bg-ink px-7 py-14 text-white md:px-14">
          <div className="grid gap-8 md:grid-cols-2 md:items-end"><div><Kicker>Have a similar challenge?</Kicker><h2 className="text-[38px] font-semibold leading-tight md:text-[50px]">Let&apos;s turn your requirements into the next case study.</h2></div><div><p className="leading-7 text-white/65">Tell us what you are building and where the current experience is getting in the way.</p><Link href="/contact" className="btn-primary mt-7 inline-flex">Start a Project</Link></div></div>
        </Reveal>
      </section>
    </>
  );
}