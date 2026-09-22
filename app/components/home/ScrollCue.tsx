/** Animated mouse-shaped "scroll" cue (purely decorative). */
export default function ScrollCue() {
  return (
    <span className="scroll-cue" aria-hidden="true">
      <span className="scroll-cue-dot" />
    </span>
  );
}
