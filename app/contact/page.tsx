import type { Metadata } from "next";
import ComingSoonPage from "@/app/components/ComingSoonPage";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <ComingSoonPage
      title="Contact"
      description="Book a free 15-minute consultation — case, WhatsApp or email. The form is coming soon."
    />
  );
}