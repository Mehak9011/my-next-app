import type { Metadata } from "next";
import ComingSoonPage from "@/app/components/ComingSoonPage";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <ComingSoonPage
      title="Services"
      description="Our full service lineup — design, development, mobile apps, SaaS and AI automation — is coming soon."
    />
  );
}