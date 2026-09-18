import type { Metadata } from "next";
import ComingSoonPage from "@/app/components/ComingSoonPage";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about working with CodeXmattriX.",
};

/**
 * FAQ page. Showing the shared "Coming Soon" view for now.
 *
 * The previous design is kept in git history (commit 6b5a0ef) and will be
 * rebuilt when the inner pages are designed.
 * WordPress registers the /faq/ URL via the page registry.
 */
export default function FaqPage() {
  return <ComingSoonPage title="FAQ" />;
}