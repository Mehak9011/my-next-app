import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";
import type { AboutContent } from "@/app/lib/content/types";

/** Values — numbered cards grid. Design lives here in Next.js. */
export default function Values({ values }: { values: AboutContent["values"] }) {
  return (
    <Reveal className="border-y border-line">
      <Container className="py-20 text-center">
        <Kicker centered>{values.kicker}</Kicker>
        <h2 className="section-title mx-auto mb-12 text-center">{values.heading}</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.items.map((value, index) => (
            <article
              key={value.title}
              className="rounded-[20px] border border-line bg-panel p-7 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="mb-3 text-[26px] font-bold text-crimson">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="mb-2 text-[16px] font-bold text-ink">{value.title}</h3>
              <p className="text-[14px] leading-relaxed text-slate">
                {value.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </Reveal>
  );
}