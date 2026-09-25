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
  children: ReactNode;
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
      {/* .section-title has max-width:600px — without mx-auto its box sits
          left even when the section text-centers. kickerCentered marks a
          centered header block, so center the box too (matches home/about
          headers like "section-title mx-auto text-center"). */}
      <h2
        className={`section-title ${sizeClass}${
          kickerCentered ? " mx-auto text-center" : ""
        }`}
      >
        {children}
      </h2>
    </div>
  );
}