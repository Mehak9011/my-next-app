import type { Metadata } from "next";
import ComingSoonPage from "@/app/components/ComingSoonPage";

export const metadata: Metadata = {
  title: "Our Process",
  description: "A clear five-step process from discovery to launch.",
};

/**
 * Process page. Showing the shared "Coming Soon" view for now.
 *
 * The previous design is kept in git history (commit 6b5a0ef) and will be
 * rebuilt when the inner pages are designed.
 * WordPress registers the /process/ URL via the page registry.
 */
export default function ProcessPage() {
  return <ComingSoonPage title="Our Process" />;
}