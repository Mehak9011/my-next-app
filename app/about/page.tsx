import type { Metadata } from "next";
import ComingSoonPage from "@/app/components/ComingSoonPage";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <ComingSoonPage
      title="About CodeXmattriX"
      description="The team behind the work — our story, values and what drives us. Coming soon."
    />
  );
}