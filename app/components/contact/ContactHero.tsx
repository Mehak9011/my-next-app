import Link from "next/link";
import type { ReactNode } from "react";
import PageBanner, { type PageBannerBadge } from "@/app/components/layout/PageBanner";
import BannerCard from "@/app/components/layout/BannerCard";
import { site } from "@/app/lib/site";

/** Trust chips shown under the copy (icon + short promise). */
const BADGES: PageBannerBadge[] = [
  { spark: "⚡", label: "Reply within 1 business day" },
  { spark: "🎯", label: "Free 15-minute consultation" },
  { spark: "🌍", label: "India + US working hours" },
];

/** What to send us — keeps the first reply useful instead of generic. */
const BRIEF = [
  "Where you are — a new idea, a redesign, or scaling what already works.",
  "What success looks like — more leads, better conversion, a cleaner brand.",
  "Budget & timeline — so we can propose the right scope, not a guess.",
  "Anything to look at — your current site, references or competitors.",
];

function contactNote(): ReactNode {
  return (
    <>
      Prefer email?{" "}
      <Link href={`mailto:${site.email}`} className="font-semibold text-crimson hover:underline">
        {site.email}
      </Link>
    </>
  );
}

/**
 * Contact banner — the shared split `PageBanner` with a dark briefing
 * card on the right (same rhythm as the Pricing / About banners).
 */
export default function ContactHero() {
  return (
    <PageBanner
      kicker="Contact"
      title={
        <>
          Let&apos;s build something <span className="text-crimson">great together.</span>
        </>
      }
      subtitle="Tell us what you are building. We reply within one business day — with questions, ideas and a clear next step."
      badges={BADGES}
      actions={
        <>
          <Link href="#contact-form" className="btn-primary">
            Start your project →
          </Link>
          <Link
            href={site.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            WhatsApp us
          </Link>
        </>
      }
      note={contactNote()}
      aside={
        <BannerCard
          title="Send us these four things and we'll save you a call."
          sub="The more context you share, the more useful our first reply is."
          rows={BRIEF}
          linkChips={[
            { label: "💬 WhatsApp", href: site.whatsappUrl, external: true },
            { label: "✉️ Email", href: `mailto:${site.email}` },
            { label: `📞 ${site.phones[0].label}`, href: site.phones[0].href },
          ]}
          note="Mon – Sat · 9 AM – 7 PM IST. No sales scripts — you talk directly to the people who will build it."
        />
      }
    />
  );
}
