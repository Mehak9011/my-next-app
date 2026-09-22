"use client";

import { useEffect, useRef } from "react";

/**
 * Hero backdrop: a drifting dot grid plus slowly floating crimson aurora
 * blobs. On fine-pointer devices the blobs also react to the pointer with a
 * gentle parallax, written to `--hero-px` / `--hero-py` which the
 * `blobFloat` keyframes consume as a CSS variable.
 */
export default function HeroBackground() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const render = () => {
      frame = 0;
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      node.style.setProperty("--hero-px", `${currentX.toFixed(1)}px`);
      node.style.setProperty("--hero-py", `${currentY.toFixed(1)}px`);

      if (
        Math.abs(targetX - currentX) > 0.2 ||
        Math.abs(targetY - currentY) > 0.2
      ) {
        frame = requestAnimationFrame(render);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 44;
      targetY = (event.clientY / window.innerHeight - 0.5) * 34;
      if (!frame) frame = requestAnimationFrame(render);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="hero-bg" aria-hidden="true">
      <span className="hero-bg-grid" />
      <span className="hero-blob hero-blob-1" />
      <span className="hero-blob hero-blob-2" />
      <span className="hero-blob hero-blob-3" />
    </div>
  );
}
