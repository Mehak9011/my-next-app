"use client";

import { useEffect, useRef } from "react";

/**
 * Custom "tech agency" cursor: a solid crimson dot that tracks the pointer
 * almost instantly, plus a ring that trails behind it.
 *
 * Performance — the follow loop writes transforms straight to the DOM (no
 * React state per frame, so nothing re-renders) and parks itself as soon as
 * both layers have settled.
 *
 * Safety — the cursor is enabled only on fine-pointer hover devices without
 * `prefers-reduced-motion`. The native cursor is hidden through the
 * `has-custom-cursor` class on <html>, which exists only while the cursor is
 * actually running, so touch/keyboard/reduced-motion/JS-off visitors always
 * keep their OS pointer. Text fields keep the native caret (see globals.css).
 *
 * Markup can request a state:
 *   <article data-cursor="view" data-cursor-label="View">…</article>
 */

type CursorState = "default" | "hover" | "view" | "text";

/** Follow factors — the dot is snappy, the ring lags for the trail effect. */
const DOT_LERP = 0.55;
const RING_LERP = 0.18;
const SCALE_LERP = 0.16;

const RING_SCALE: Record<CursorState, number> = {
  default: 1,
  hover: 1.75,
  view: 2.6,
  text: 1.12,
};

const DOT_SCALE: Record<CursorState, number> = {
  default: 1,
  hover: 0.45,
  view: 0.18,
  text: 0.55,
};

const INTERACTIVE = "a, button, [role='button'], summary, label";

/** Resolves the cursor state from the element under the pointer. */
function resolveState(target: EventTarget | null): {
  state: CursorState;
  label: string;
} {
  if (!(target instanceof Element)) return { state: "default", label: "" };

  const custom = target.closest("[data-cursor]");
  if (custom) {
    const value = custom.getAttribute("data-cursor");
    return {
      state: value === "view" || value === "text" ? value : "hover",
      label: custom.getAttribute("data-cursor-label") ?? "",
    };
  }

  if (target.closest(INTERACTIVE)) return { state: "hover", label: "" };
  if (target.closest("input, textarea, select")) {
    return { state: "text", label: "" };
  }
  return { state: "default", label: "" };
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;

    const originX = window.innerWidth / 2;
    const originY = window.innerHeight / 2;

    let pointerX = originX;
    let pointerY = originY;
    let dotX = originX;
    let dotY = originY;
    let ringX = originX;
    let ringY = originY;
    let ringScale = RING_SCALE.default;
    let dotScale = DOT_SCALE.default;
    let targetRingScale = RING_SCALE.default;
    let targetDotScale = DOT_SCALE.default;

    let state: CursorState = "default";
    let pressed = false;
    let running = false;
    let visible = false;
    let frame = 0;

    const render = () => {
      frame = 0;

      dotX += (pointerX - dotX) * DOT_LERP;
      dotY += (pointerY - dotY) * DOT_LERP;
      ringX += (pointerX - ringX) * RING_LERP;
      ringY += (pointerY - ringY) * RING_LERP;
      ringScale += (targetRingScale - ringScale) * SCALE_LERP;
      dotScale += (targetDotScale - dotScale) * SCALE_LERP;

      dot.style.transform = `translate3d(calc(${dotX}px - 50%), calc(${dotY}px - 50%), 0) scale(${dotScale.toFixed(3)})`;
      ring.style.transform = `translate3d(calc(${ringX}px - 50%), calc(${ringY}px - 50%), 0) scale(${ringScale.toFixed(3)})`;

      const settled =
        Math.abs(pointerX - ringX) < 0.15 &&
        Math.abs(pointerY - ringY) < 0.15 &&
        Math.abs(targetRingScale - ringScale) < 0.002 &&
        Math.abs(targetDotScale - dotScale) < 0.002;

      if (running && !settled) frame = requestAnimationFrame(render);
    };

    /** Restarts the follow loop (it stops itself once everything settles). */
    const wake = () => {
      if (!running || frame) return;
      frame = requestAnimationFrame(render);
    };

    /** Recomputes the target scales for the current state. */
    const applyScales = () => {
      targetRingScale = RING_SCALE[state] * (pressed ? 0.82 : 1);
      targetDotScale = pressed ? DOT_SCALE[state] * 1.4 : DOT_SCALE[state];
      // Counter-scale so the label stays crisp while the ring grows.
      label.style.setProperty(
        "--cursor-label-scale",
        String(1 / targetRingScale)
      );
    };

    const applyState = (next: { state: CursorState; label: string }) => {
      if (next.state !== state) {
        state = next.state;
        ring.dataset.state = state;
      }
      if (label.textContent !== next.label) label.textContent = next.label;
      applyScales();
    };

    const show = () => {
      visible = true;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    const hide = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!visible) show();
      pointerX = event.clientX;
      pointerY = event.clientY;
      applyState(resolveState(event.target));
      wake();
    };

    const onPointerDown = () => {
      pressed = true;
      applyScales();
      wake();
    };

    const onPointerUp = () => {
      pressed = false;
      applyScales();
      wake();
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType === "mouse") hide();
    };

    const onPointerEnter = () => {
      show();
      wake();
    };

    const start = () => {
      if (running) return;
      running = true;
      root.classList.add("has-custom-cursor");
      ring.dataset.state = state;
      applyScales();
      hide();

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerdown", onPointerDown, { passive: true });
      window.addEventListener("pointerup", onPointerUp, { passive: true });
      window.addEventListener("blur", hide);
      document.addEventListener("pointerleave", onPointerLeave);
      document.addEventListener("pointerenter", onPointerEnter);
      wake();
    };

    const stop = () => {
      if (!running) return;
      running = false;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      root.classList.remove("has-custom-cursor");

      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("blur", hide);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("pointerenter", onPointerEnter);
    };

    /** Reacts to runtime changes of pointer type / motion preference. */
    const sync = () => {
      if (finePointer.matches && !reducedMotion.matches) start();
      else stop();
    };

    sync();
    finePointer.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);

    return () => {
      finePointer.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        className="cursor-ring"
        data-state="default"
        aria-hidden="true"
      >
        <span className="cursor-ring-orbit" />
        <span ref={labelRef} className="cursor-ring-label" />
      </div>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}


  