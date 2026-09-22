"use client";

import { useEffect, useRef } from "react";

/**
 * Thin crimson gradient progress bar pinned to the top of the viewport.
 * The value is written straight to the DOM inside a rAF callback, so
 * scrolling never triggers a React re-render.
 */
export default function ScrollProgress() {
  const barRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? doc.scrollTop / max : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    };

    const request = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span ref={barRef} className="scroll-progress-bar" />
    </div>
  );
}
