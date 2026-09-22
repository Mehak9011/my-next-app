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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
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
