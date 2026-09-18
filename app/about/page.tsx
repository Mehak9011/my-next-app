import type { Metadata } from "next";
import ComingSoonPage from "@/app/components/ComingSoonPage";

export const metadata: Metadata = {
  title: "About",
  description:
    "The team behind the work — our story, mission, values and what drives CodeXmattriX.",
};

/**
 * About — "Coming Soon" for now.
 *
 * The full About design (app/components/about/*) and its content
 * (app/lib/content/about.ts) are kept in the project untouched and will
 * be re-enabled when the inner pages are designed.
 *
 * WordPress still registers the /about/ URL — see HEADLESS-WORDPRESS-GUIDE.md.
 */
export default function AboutPage() {
  return <ComingSoonPage title="About" />;
}