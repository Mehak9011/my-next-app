import type { ReactNode } from "react";

/**
 * Brand kicker label (uppercase, red, tracked).
 * `className` lets the Hero add its pulsing dot / shimmer treatment.
 */
export default function Kicker({
  children,
  centered = false,
  className = "",
}: {
  children: ReactNode;
  centered?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`kicker ${centered ? "mx-auto block text-center" : ""} ${className}`}
    >
      {children}
    </span>
  );
}