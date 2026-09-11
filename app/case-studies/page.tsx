import type { Metadata } from "next";
import ComingSoonPage from "@/app/components/ComingSoonPage";

export const metadata: Metadata = { title: "Case Studies" };

export default function CaseStudiesPage() {
  return (
    <ComingSoonPage
      title="Case Studies & Industries"
      description="Detailed case studies across Healthcare, CBD & Cannabis and growing US brands are on their way."
    />
  );
}