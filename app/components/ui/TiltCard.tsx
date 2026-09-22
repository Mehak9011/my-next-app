"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Pointer-follow 3D tilt wrapper for cards.
 *
 * The rotation is written to the element's own transform inside a rAF loop
 * (no React state), so children keep their normal hover effects. The listener
 * is attached only on fine-pointer hover devices without reduced-motion —
 * touch and reduced-motion users get a completely static card.
 */
export default function TiltCard({
  children,
  className = "",
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees at the card edges. */
  max?: number;
}) {
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
    let enabled = false;

    const render = () => {
      frame = 0;
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;

      node.style.transform = `perspective(1000px) rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;

      const settled =
        Math.abs(targetX - currentX) < 0.05 && Math.abs(targetY - currentY) < 0.05;
      if (enabled && !settled) frame = requestAnimationFrame(render);
    };

    const wake = () => {
      if (!enabled || frame) return;
      frame = requestAnimationFrame(render);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = -py * max * 2;
      targetY = px * max * 2;
      wake();
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      wake();
    };

    node.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    enabled = true;
    node.addEventListener("pointermove", onPointerMove);
    node.addEventListener("pointerleave", onPointerLeave);

    return () => {
      enabled = false;
      if (frame) cancelAnimationFrame(frame);
      node.removeEventListener("pointermove", onPointerMove);
      node.removeEventListener("pointerleave", onPointerLeave);
      node.style.removeProperty("transform");
    };
  }, [max]);

  return (
    <div ref={ref} className={`tilt-wrap ${className}`}>
      {children}
    </div>
  );
}
