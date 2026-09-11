import type { Metadata } from "next";
import ComingSoonPage from "@/app/components/ComingSoonPage";

export const metadata: Metadata = { title: "FAQ" };

export default function FaqPage() {
  return (
    <ComingSoonPage
      title="FAQ"
      description="Everything you need to know about timelines, industries, launch support and how we get started — coming soon."
    />
  );
}