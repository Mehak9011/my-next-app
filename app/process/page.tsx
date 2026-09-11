import type { Metadata } from "next";
import ComingSoonPage from "@/app/components/ComingSoonPage";

export const metadata: Metadata = { title: "Process" };

export default function ProcessPage() {
  return (
    <ComingSoonPage
      title="Our Process"
      description="Discovery → Design → Development → QA → Launch. See exactly how we work — coming soon."
    />
  );
}