import type { Metadata } from "next";
import ComingSoonPage from "@/app/components/ComingSoonPage";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "Selected digital product and e-commerce work across healthcare, CBD and growing brands.",
};

/**
 * Case Studies page. Showing the shared "Coming Soon" view for now.
 *
 * The previous design is kept in git history (commit 6b5a0ef) and will be
 * rebuilt when the inner pages are designed.
 * WordPress registers the /case-studies/ URL via the page registry.
 */
export default function CaseStudiesPage() {
  return <ComingSoonPage title="Case Studies" />;
}