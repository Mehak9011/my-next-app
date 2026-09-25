"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Entrance styles — `.reveal-<variant>` classes live in globals.css. */
export type RevealVariant =
  | "up"
  | "down"
  | "left"
  | "right"
  | "scale"
  | "mask"
  | "fade";

/**
 * Scroll-reveal wrapper. Elements start hidden and animate into view once
 * they intersect the viewport — mirroring the original `.reveal` behaviour,
 * now with a choice of entrance variants and an optional stagger delay.
 */
export default function Reveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
  threshold = 0.12,
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  /** Entrance delay in milliseconds — used to stagger siblings. */
  delay?: number;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Never hide content when scripting, observers, or full-page capture are
    // unavailable. The animation is an enhancement, not a visibility gate.
    if (typeof IntersectionObserver === "undefined") {
      const fallback = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(fallback);
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      const settle = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(settle);
    }

    const revealImmediately = () => {
      const bounds = node.getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > 0) {
        setVisible(true);
        return true;
      }
      return false;
    };

    if (revealImmediately()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold, rootMargin: "160px 0px" }
    );

    observer.observe(node);
    const fallback = window.setTimeout(() => setVisible(true), 1800);
    const onLoad = () => {
      if (revealImmediately()) observer.disconnect();
    };

    window.addEventListener("load", onLoad, { once: true });
    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
      window.removeEventListener("load", onLoad);
    };
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`reveal reveal-${variant} ${visible ? "is-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
