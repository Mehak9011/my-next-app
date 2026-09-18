import type { Metadata } from "next";
import ComingSoonPage from "@/app/components/ComingSoonPage";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Custom design, web, mobile, software, SaaS and AI automation services by CodeXmattriX.",
};

/**
 * Services page. Showing the shared "Coming Soon" view for now.
 *
 * The previous design is kept in git history (commit 6b5a0ef) and will be
 * rebuilt when the inner pages are designed.
 * WordPress registers the /services/ URL via the page registry.
 */
export default function ServicesPage() {
  return <ComingSoonPage title="Services" />;
}