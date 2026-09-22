import Link from "next/link";
import Container from "@/app/components/ui/Container";
import { site } from "@/app/lib/site";

/** Outlined wordmark words for the footer marquee. */
const MARQUEE_WORDS: Array<{ plain: string; strong: string }> = [
  { plain: "CODE", strong: "XMATTRIX" },
  { plain: "CODE", strong: "XMATTRIX" },
];

const SERVICE_LINKS = [
  { label: "Website Creation & Redesign", href: "/services#web-dev" },
  { label: "Mobile App UX/UI Development", href: "/services#mobile-design" },
  { label: "Dashboard / CRM Design", href: "/services#saas-design" },
  { label: "Banner & Advertising Graphics", href: "/services#brand" },
];

const COMPANY_LINKS = [
  { label: "About", href: site.links.about },
  { label: "Services", href: site.links.services },
  { label: "Process", href: site.links.process },
  { label: "Case Studies", href: site.links.caseStudies },
  { label: "Pricing", href: site.links.pricing },
  { label: "Contact", href: site.links.contact },
];

/** Dark site footer: marquee wordmark, columns, presence, fine print. */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="overflow-hidden bg-night pb-[30px] pt-[60px] text-mist">
      {/* Marquee wordmark */}
      <div className="mb-[70px] overflow-hidden whitespace-nowrap">
        <div className="footer-track-anim marquee-track gap-x-[60px] whitespace-nowrap">
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS].map(
            (word, i) => (
              <span key={i} className="display-stroke">
                {word.plain}
                <b>{word.strong}</b>
              </span>
            )
          )}
        </div>
      </div>

      <Container>
        {/* Top grid */}
        <div className="mb-[60px] grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link
              href="/"
              aria-label={`${site.name} — home`}
              className="ffoot-logo inline-block transition-opacity hover:opacity-85"
            >
              {/* White brand logo (mark + wordmark) — reads on the dark
                  footer background. Sourced from public/images. */}
              <img
                src="/images/logo-2.svg"
                alt={site.name}
                width={840}
                height={136}
                className="h-[34px] w-auto sm:h-[38px]"
                loading="lazy"
                decoding="async"
              />
            </Link>
            {/* <p className="mt-3 text-[10.5px] font-medium tracking-[0.18em] text-slate-light uppercase">
              {site.taglineUppercase}
            </p> */}
          </div>

          {/* The Agency */}
          <div>
            <h4 className="mb-[18px] text-[13px] font-bold uppercase tracking-[0.06em] text-white">
              The Agency
            </h4>
            <p className="mb-3 text-[14.5px] text-slate-light">{site.addressIndia}</p>
            {site.phones.map((phone) => (
              <a
                key={phone.href}
                href={phone.href}
                className="mb-3 block text-[14.5px] text-slate-light transition-colors hover:text-white"
              >
                {phone.label}
              </a>
            ))}
            <a
              href={`mailto:${site.email}`}
              className="mb-3 block text-[14.5px] text-slate-light transition-colors hover:text-white"
            >
              {site.email}
            </a>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-[18px] text-[13px] font-bold uppercase tracking-[0.06em] text-white">
              Services
            </h4>
            {SERVICE_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="mb-3 block text-[14.5px] text-slate-light transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-[18px] text-[13px] font-bold uppercase tracking-[0.06em] text-white">
              Company
            </h4>
            {COMPANY_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="mb-3 block text-[14.5px] text-slate-light transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Presence */}
        <div className="border-t border-[#2a3542] pt-11 text-center">
          <h3 className="mb-[34px] text-[26px] font-bold text-white">
            Our Presence
          </h3>
          <div className="mx-auto grid max-w-[700px] grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-[14px] bg-navy p-[30px_24px]">
              <div className="mb-[14px] text-[34px] leading-none" aria-hidden="true">
                🇮🇳
              </div>
              <p className="text-[14px] leading-relaxed text-mist">
                {site.addressIndia}
              </p>
            </div>
            <div className="rounded-[14px] bg-navy p-[30px_24px]">
              <div className="mb-[14px] text-[34px] leading-none" aria-hidden="true">
                🇺🇸
              </div>
              <p className="text-[14px] leading-relaxed text-mist">
                {site.addressUS}
              </p>
            </div>
          </div>
        </div>

        {/* Fine print */}
        <div className="mt-10 border-t border-[#2a3542] pt-5 text-center text-[13px] text-dusk">
          © {year} CodeXmattriX Digital. All Rights Reserved.
        </div>
      </Container>
    </footer>
  );
}