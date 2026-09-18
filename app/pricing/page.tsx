import type { Metadata } from "next";
import ComingSoonPage from "@/app/components/ComingSoonPage";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Flexible engagement models for custom digital product development.",
};

/**
 * Pricing page. Showing the shared "Coming Soon" view for now.
 *
 * The previous design is kept in git history (commit 6b5a0ef) and will be
 * rebuilt when the inner pages are designed.
 * WordPress registers the /pricing/ URL via the page registry.
 */
export default function PricingPage() {
  return <ComingSoonPage title="Pricing" />;
}