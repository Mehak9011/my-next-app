import type { Metadata } from "next";
import ContactHero from "@/app/components/contact/ContactHero";
import ContactProcess from "@/app/components/contact/ContactProcess";
import ContactDetails from "@/app/components/contact/ContactDetails";
import ContactForm from "@/app/components/contact/ContactForm";
import ContactCta from "@/app/components/contact/ContactCta";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a free 15-minute consultation with CodeXmattriX — email, call or WhatsApp.",
};

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Reach out",
    description:
      "Send us a message or book a call. We'll reply within one business day.",
  },
  {
    number: "02",
    title: "Discovery call",
    description:
      "A free 15-minute conversation to learn about your goals and outline next steps.",
  },
  {
    number: "03",
    title: "Proposal & timeline",
    description:
      "We send a clear scope, price and timeline — no surprises, no pressure.",
  },
  {
    number: "04",
    title: "Build kick-off",
    description:
      "Once we're aligned, we start designing and building — keeping you in the loop.",
  },
];

/**
 * Contact page — same design system as the home page: shared Container,
 * Kicker / hero-title typography, brand colour tokens, brand buttons and
 * the same scroll-reveal animations. Form logic is 100% Next.js
 * (pre-filled WhatsApp / email handoff, no backend required).
 */
export default function ContactPage() {
  return (
    <>
      <ContactHero />

      <ContactProcess
        heading="Here's what happens when you reach out"
        steps={PROCESS_STEPS}
      />

            <section id="contact-form" className="pt-[100px] pb-[100px]">
        <div className="mx-auto grid w-full max-w-[1180px] gap-[28px] px-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <ContactDetails />
          </div>
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>

      <ContactCta
        title="Ready to build something that actually grows your business?"
        subtitle="Free 15-minute consultation. No pressure, no obligation."
        buttonLabel="Book Your Free Consultation →"
      />
    </>
  );
}
