import Link from "next/link";
import type { ReactNode } from "react";
import CountUp from "@/app/components/ui/CountUp";

export interface BannerCardStat {
  value: string;
  label: string;
}

interface BannerCardLinkChip {
  label: string;
  href: string;
  /** External links (WhatsApp) open in a new tab. */
  external?: boolean;
}

interface BannerCardProps {
  title: string;
  sub?: string;
  /** Checklist rows — one promise / step per line. */
  rows?: string[];
  /** Numbers shown as a 2-column grid (counted up when numeric). */
  stats?: BannerCardStat[];
  chips?: string[];
  /** Contact chips rendered as links (WhatsApp / Email / Phone). */
  linkChips?: BannerCardLinkChip[];
  note?: ReactNode;
  link?: { label: string; href: string };
}

/**
 * Dark summary card used inside the split page banner (Contact / Pricing /
 * About). Pure presentation — every string comes from the caller, so no copy
 * is duplicated across pages. Styles: ".banner-card" in globals.css.
 */
export default function BannerCard({
  title,
  sub,
  rows = [],
  stats = [],
  chips = [],
  linkChips = [],
  note,
  link,
}: BannerCardProps) {
  return (
    <div className="banner-card">
      <h2 className="banner-card-title">{title}</h2>
      {sub ? <p className="banner-card-sub">{sub}</p> : null}

      {rows.length > 0 ? (
        <ul className="banner-card-list">
          {rows.map((row) => (
            <li key={row} className="banner-card-row">
              <span className="banner-card-mark" aria-hidden="true">
                ✓
              </span>
              <span>{row}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {stats.length > 0 ? (
        <>
          {rows.length > 0 ? (
            <span className="banner-card-divider" aria-hidden="true" />
          ) : null}

          <div className="banner-card-stats">
            {stats.map((stat) => (
              <div key={stat.label}>
                <span className="banner-card-stat-value">
                  <CountUp value={stat.value} />
                </span>
                <span className="banner-card-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {chips.length > 0 || linkChips.length > 0 ? (
        <div className="banner-card-foot">
          {chips.map((chip) => (
            <span key={chip} className="banner-card-chip">
              {chip}
            </span>
          ))}
          {linkChips.map((chip) =>
            chip.external ? (
              <a
                key={chip.label}
                href={chip.href}
                target="_blank"
                rel="noopener noreferrer"
                className="banner-card-chip"
              >
                {chip.label}
              </a>
            ) : (
              <Link key={chip.label} href={chip.href} className="banner-card-chip">
                {chip.label}
              </Link>
            )
          )}
        </div>
      ) : null}

      {note ? <p className="banner-card-note">{note}</p> : null}

      {link ? (
        <p className="mt-[18px]">
          <Link href={link.href} className="banner-card-link">
            {link.label}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
