import type { Metadata } from "next";
import ContactDetails from "@/app/components/contact/ContactDetails";
import ContactForm from "@/app/components/contact/ContactForm";
import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a free 15-minute consultation with CodeXmattriX — email, call or WhatsApp.",
};

/**
 * Contact.
 *
 * Built 100% in Next.js. Contact details come from app/lib/site.ts and
 * the form is a Next.js client component — WordPress only registers the
 * /contact/ URL.
 */
export default function ContactPage() {
  return (
    <>
      <section className="pt-[110px] pb-[70px] text-center">
        <Container>
          <Kicker centered>Contact Us</Kicker>
          <h1 className="hero-title mx-auto mb-6 max-w-[900px]">
            Let&apos;s design and build your next big thing.
          </h1>
          <p className="mx-auto max-w-[600px] text-[18px] leading-relaxed text-slate">
            Book a free 15-minute consultation and walk away with honest answers —
            timelines, budget and whether we&apos;re the right fit.
          </p>
        </Container>
      </section>

      <Reveal className="border-y border-line bg-panel">
        <Container className="grid grid-cols-1 gap-10 py-20 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <ContactDetails />
          <ContactForm />
        </Container>
      </Reveal>
    </>
  );
}