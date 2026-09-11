import type { ReactNode } from "react";
import Kicker from "./Kicker";

/**
 * Reusable section header: optional kicker + display heading.
 * Standard styles come from the global .section-title class.
 */
export default function SectionHeader({
  children,
  kicker,
  kickerCentered = false,
  size = "md",
  className = "",
}: {
  children: React.ReactNode;
  kicker?: string;
  kickerCentered?: boolean;
  size?: "md" | "lg";
  className?: string;
}) {
  const sizeClass =
    size === "lg" ? "text-[44px] leading-tight" : "text-[36px] lg:text-[40px]";

  return (
    <div className={className}>
      {kicker ? <Kicker centered={kickerCentered}>{kicker}</Kicker> : null}
      <h2 className={`section-title ${sizeClass}`}>{children}</h2>
    </div>
  );
}