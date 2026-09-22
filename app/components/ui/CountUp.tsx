"use client";

import { useEffect, useRef } from "react";

/**
 * Counts a stat value up from zero the first time it scrolls into view.
 *
 * Only values containing exactly one number animate ("15+" counts 0 → 15,
 * keeping the "+"); ranges such as "8–12 wks" are rendered untouched.
 * The final value is what gets server-rendered, so JS-off visitors and
 * crawlers always see the real number — the effect only takes over once the
 * element is actually visible. `prefers-reduced-motion` disables it entirely.
 */
export default function CountUp({
  value,
  duration = 1500,
  className = "",
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  // Single number only — "15+", "100%", "3". Ranges stay static.
  const numbers = value.match(/\d+(?:\.\d+)?/g) ?? [];
  const match =
    numbers.length === 1 ? value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/) : null;
  const animated = match !== null;
  const prefix = match ? match[1] : "";
  const suffix = match ? match[3] : "";
  const decimals =
    match && match[2].includes(".") ? match[2].split(".")[1].length : 0;
  const target = match ? Number(match[2]) : 0;

  useEffect(() => {
    const node = ref.current;
    if (!node || !animated) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let started = false;

    const format = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`;

    const run = () => {
      const start = performance.now();

      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = format(target * eased);
        if (progress < 1) frame = requestAnimationFrame(step);
        else node.textContent = format(target);
      };

      node.textContent = format(0);
      frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started) return;
          started = true;
          observer.disconnect();
          run();
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [animated, decimals, duration, prefix, suffix, target]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
