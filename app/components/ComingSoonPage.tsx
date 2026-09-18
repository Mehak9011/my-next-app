import Link from "next/link";
import Kicker from "@/app/components/ui/Kicker";

const DEFAULT_MESSAGE =
  "We're working on something great. This page will be available soon.";

/**
 * Shared "Coming Soon" template for inner pages (About, Services,
 * Contact, ...). The header, footer and WhatsApp button come from the
 * root layout, so the site structure stays consistent.
 *
 * Only existing theme tokens are used (crimson / slate / ink), so the
 * global colors and fonts are untouched. The content is centred both
 * vertically and horizontally and stays responsive through fluid type
 * sizes and max-widths.
 */
export default function ComingSoonPage({
  title,
  description = DEFAULT_MESSAGE,
}: {
  /** Page name shown above the heading, e.g. "About". */
  title: string;
  /** Optional override for the supporting message. */
  description?: string;
}) {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-8 py-24">
      <div className="mx-auto w-full max-w-[640px] text-center">
        <Kicker centered>{title}</Kicker>

        <h1 className="mb-5 text-[32px] font-bold leading-tight sm:text-[42px]">
          Coming Soon
        </h1>

        <p className="mx-auto mb-10 max-w-[520px] text-[17px] leading-relaxed text-slate">
          {description}
        </p>

        {/* Minimal brand accent */}
        <span
          className="mx-auto mb-10 block h-[3px] w-12 rounded-full bg-crimson"
          aria-hidden="true"
        />

        <Link href="/" className="btn-ghost">
          ← Back to Home
        </Link>
      </div>
    </section>
  );
}