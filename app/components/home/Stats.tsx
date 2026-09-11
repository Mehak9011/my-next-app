import Container from "@/app/components/ui/Container";
import Reveal from "@/app/components/ui/Reveal";
import type { Stat } from "@/app/lib/content/types";

/** Stats bar — full-width panel with four key numbers. */
export default function Stats({ stats }: { stats: Stat[] }) {
  return (
    <Reveal className="border-y border-line bg-panel">
      <Container className="flex flex-wrap justify-around gap-[30px] py-10 text-center">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-[120px]">
            <h3 className="text-[34px] font-semibold leading-tight text-ink">
              {stat.value}
            </h3>
            <p className="mt-1 text-[13.5px] font-medium text-slate">
              {stat.label}
            </p>
          </div>
        ))}
      </Container>
    </Reveal>
  );
}