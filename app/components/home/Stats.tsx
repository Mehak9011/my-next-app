import Container from "@/app/components/ui/Container";
import CountUp from "@/app/components/ui/CountUp";
import Reveal from "@/app/components/ui/Reveal";
import type { Stat } from "@/app/lib/content/types";

/**
 * Stats bar — full-width panel with the four key numbers.
 * Numbers count up on first view, and each value carries a crimson accent
 * sized to the number itself (see "HOME — STATS BAR" in globals.css).
 */
export default function Stats({ stats }: { stats: Stat[] }) {
  return (
    <div className="border-y border-line bg-panel">
      <Container className="py-10">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <Reveal
              key={stat.label}
              variant="up"
              delay={index * 110}
              className="stat-item"
            >
              <h3 className="stat-value">
                <span className="stat-number">
                  <CountUp value={stat.value} />
                </span>
              </h3>
              <p className="stat-label">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </div>
  );
}

