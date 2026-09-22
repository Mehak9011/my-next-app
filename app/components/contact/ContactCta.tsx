import Link from "next/link";
import Reveal from "@/app/components/ui/Reveal";
import { site } from "@/app/lib/site";

interface ContactCtaProps {
  kicker?: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
}

/**
 * Dark consultation CTA — same visual style as the home page FinalCTA
 * (cta-card / cta-grid / cta-glow), but with the contact form anchor
 * so it scrolls down to the form below.
 */
export default function ContactCta({
  kicker = "Free Consultation",
  title,
  subtitle,
  buttonLabel,
}: ContactCtaProps) {
  return (
    <section className="py-[100px]">
      <Reveal
        variant="scale"
        className="cta-card mx-auto max-w-[1180px] rounded-[20px] bg-ink px-10 py-[70px] text-center text-white"
      >
        <span className="cta-grid" aria-hidden="true" />
        <span className="cta-glow" aria-hidden="true" />
        <div className="relative">
          <p className="kicker mb-3">{kicker}</p>
          <h2 className="mb-4 text-[32px] leading-snug sm:text-[40px]">
            {title}
          </h2>
          <p className="mx-auto mb-8 max-w-[560px] text-[16px] text-[#A8AFB6]">
            {subtitle}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="#contact-form" scroll={true} className="btn-primary">
              {buttonLabel}
            </Link>
            <Link
              href={`mailto:${site.email}`}
              className="text-[15px] font-medium text-slate-light hover:text-crimson"
            >
              or email us directly →
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
