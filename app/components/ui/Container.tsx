import type { ReactNode } from "react";

/**
 * The site-wide layout container ("wrap").
 * Recreates the original `.wrap` rule: max-width 1180px, centered,
 * 32px horizontal padding.
 */
export default function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1180px] px-8 ${className}`}>
      {children}
    </div>
  );
}