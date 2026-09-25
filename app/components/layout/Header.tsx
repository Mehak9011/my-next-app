"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "@/app/components/ui/Container";
import { navLinks, site } from "@/app/lib/site";

/**
 * Sticky site header with brand logo, desktop nav (≥1024px) and a
 * mobile hamburger menu. Fully matches the original design.
 *
 * The nav entries come from `navLinks` — the same list the footer's
 * "Company" column renders (About, Services, Process, Case Studies,
 * Pricing, Contact).
 *
 * The nav links react to hover and to the current route: the desktop link
 * grows a crimson underline, the mobile row turns crimson with a left bar
 * (styles live in globals.css under "HEADER NAV").
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // First nav entry that matches the current route (trailing slash safe).
  // navLinks can point two labels at the same URL — only the first is marked.
  const activeIndex = navLinks.findIndex(
    (link) => pathname === link.href || pathname.startsWith(`${link.href}/`)
  );

  return (
    <header className="sticky top-0 z-[100] border-b border-line bg-white/90 backdrop-blur">
      <Container className="flex h-[76px] items-center justify-between">
        {/* Brand logo — dark/red variant so it reads on the white header. */}
        <Link
          href="/"
          className="flex flex-shrink-0 items-center"
          onClick={() => setOpen(false)}
        >
          <img
            src="/images/logo-1-2.svg"
            alt={site.name}
            width={840}
            height={136}
            className="h-[32px] w-auto sm:h-[38px]"
            decoding="async"
          />
        </Link>

        {/* Desktop nav (≥1024px) — 6 entries, so the row needs lg width */}
        <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
          {navLinks.map((link, index) => {
            const active = index === activeIndex;

            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`header-link text-[14.5px] font-medium ${
                  active ? "is-active" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link href={site.links.contact} className="btn-nav hidden sm:inline-flex">
            Book a Call
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink transition-colors hover:border-slate lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              {open ? (
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 5.5h14M3 10h14M3 14.5h14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line bg-white lg:hidden">
          <nav className="flex flex-col px-8 py-4">
            {navLinks.map((link, index) => {
              const active = index === activeIndex;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`header-link-mobile border-b border-line py-3 text-[15px] font-medium ${
                    active ? "is-active" : ""
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href={site.links.contact}
              onClick={() => setOpen(false)}
              className="btn-nav mt-4 w-full justify-center"
            >
              Book a Call
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}