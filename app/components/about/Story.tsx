import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";
import type { AboutContent } from "@/app/lib/content/types";

/** Our Story — narrative split with a practice checklist card. */
export default function Story({ story }: { story: AboutContent["story"] }) {
  return (
    <Reveal className="border-y border-line bg-panel">
      <Container className="grid grid-cols-1 gap-10 py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div>
          <Kicker>{story.kicker}</Kicker>
          <h2 className="section-title mb-5">{story.heading}</h2>
          {story.paragraphs.map((paragraph, index) => (
            <p
              key={`paragraph-${index}`}
              className="mb-4 text-[16px] leading-relaxed text-slate"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="rounded-[20px] border border-line bg-white p-8 shadow-[0_24px_48px_-22px_rgba(15,22,32,0.25)]">
          <h3 className="mb-5 text-[15px] font-bold uppercase tracking-[0.06em] text-ink">
            {story.pointsHeading}
          </h3>
          <ul className="space-y-4">
            {story.points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-[15px] leading-relaxed text-slate"
              >
                <span
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-crimson text-[12px] font-bold text-white"
                  aria-hidden="true"
                >
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Reveal>
  );
}