import type { Metadata } from "next";
import ComingSoonPage from "@/app/components/ComingSoonPage";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a free 15-minute consultation with CodeXmattriX — email, call or WhatsApp.",
};

/**
 * Contact page. Showing the shared "Coming Soon" view for now.
 *
 * The previous design (app/components/contact/*) is kept in the project and
 * will be rebuilt when the inner pages are designed.
 * WordPress registers the /contact/ URL via the page registry.
 */
export default function ContactPage() {
  return <ComingSoonPage title="Contact" />;
}