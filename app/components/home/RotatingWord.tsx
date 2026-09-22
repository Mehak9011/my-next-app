/**
 * Decorative rotating word — pure CSS, no JS. Every item is a stacked span
 * with its own `animation-delay`, and an invisible sizer (the longest word)
 * keeps the line width stable.
 *
 * Tuned for 3–5 words; the duration is derived from the word count so the
 * slots always follow each other seamlessly.
 */
const STEP_SECONDS = 2.6;

export default function RotatingWord({
  words,
  className = "",
}: {
  words: string[];
  className?: string;
}) {
  if (words.length === 0) return null;

  const longest = words.reduce(
    (longestWord, word) => (word.length > longestWord.length ? word : longestWord),
    ""
  );
  const duration = `${(words.length * STEP_SECONDS).toFixed(1)}s`;

  return (
    <span className={`rotator ${className}`}>
      <span className="rotator-sizer" aria-hidden="true">
        {longest}
      </span>
      <span className="rotator-list">
        {words.map((word, index) => (
          <span
            key={word}
            className="rotator-item"
            style={{
              animationDelay: `${(index * STEP_SECONDS).toFixed(1)}s`,
              animationDuration: duration,
            }}
          >
            {word}
          </span>
        ))}
      </span>
    </span>
  );
}
