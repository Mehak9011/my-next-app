"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/app/components/ui/Container";
import { navLinks, site } from "@/app/lib/site";

/**
 * Sticky site header with brand logo, desktop nav (≥860px) and a
 * mobile hamburger menu. Fully matches the original design.
 */
export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] border-b border-line bg-white/90 backdrop-blur">
      <Container className="flex h-[76px] items-center justify-between">
        {/* Brand logo */}
        <Link
          href="/"
          className="text-[21px] font-bold tracking-tight text-ink"
          onClick={() => setOpen(false)}
        >
          Code<span className="text-crimson">X</span>mattri
          <span className="text-crimson">x</span>
        </Link>

        {/* Desktop nav (≥860px) */}
        <nav className="hidden min-[860px]:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[14.5px] font-medium text-slate transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
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
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink transition-colors hover:border-slate min-[860px]:hidden"
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
        <div className="border-t border-line bg-white min-[860px]:hidden">
          <nav className="flex flex-col px-8 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-3 text-[15px] font-medium text-slate transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
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