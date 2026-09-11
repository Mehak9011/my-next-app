import type { Metadata } from "next";
import ComingSoonPage from "@/app/components/ComingSoonPage";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <ComingSoonPage
      title="Pricing"
      description="Transparent project pricing and engagement models — coming soon."
    />
  );
}