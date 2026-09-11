import type { ReactNode } from "react";

/** Brand kicker label (uppercase, red, tracked). */
export default function Kicker({
  children,
  centered = false,
}: {
  children: ReactNode;
  centered?: boolean;
}) {
  return (
    <span
      className={`kicker ${centered ? "mx-auto block text-center" : ""}`}
    >
      {children}
    </span>
  );
}