import Link from "next/link";
import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";
import { site } from "@/app/lib/site";

/**
 * Generic template for pages that WordPress registers but Next.js does
 * not have a dedicated design for yet. The URL never breaks — Next.js
 * renders the registered title inside the site's shared shell.
 *
 * Build a dedicated page (app/<slug>/page.tsx) to replace this with a
 * custom design whenever you're ready.
 */
export default function RegisteredPage({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  return (
    <>
      <section className="pt-[110px] pb-[70px] text-center">
        <Container>
          <Kicker centered>{slug || "Page"}</Kicker>
          <h1 className="hero-title mx-auto mb-6 max-w-[860px]">{title}</h1>
          <p className="mx-auto mb-9 max-w-[620px] text-[17px] leading-relaxed text-slate">
            This URL is registered in WordPress. A dedicated Next.js page is being
            designed — until then it renders from the shared template so the route
            never breaks.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-[14px]">
            <Link href={site.links.contact} className="btn-primary">
              Book a Free Consultation
            </Link>
            <Link href="/" className="btn-ghost">
              ← Back to Home
            </Link>
          </div>
        </Container>
      </section>

      <div className="px-8">
        <Reveal className="mx-auto max-w-[1180px] rounded-[20px] bg-ink px-10 py-[70px] text-center text-white">
          <Kicker centered>Next Step</Kicker>
          <h2 className="mb-3 text-[32px] leading-snug">
            Not sure this is the right page?
          </h2>
          <p className="mb-7 text-[16px] text-[#A8AFB6]">
            Tell us what you were looking for and we&apos;ll point you in the right
            direction — free.
          </p>
          <Link href={site.links.contact} className="btn-primary">
            Talk to Us
          </Link>
        </Reveal>
      </div>
    </>
  );
}