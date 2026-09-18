import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";
import type { Testimonial } from "@/app/lib/content/types";

/** Testimonials — three-column quote cards. */
export default function Testimonials({
  heading,
  items,
}: {
  heading: string;
  items: Testimonial[];
}) {
  return (
    <section id="work" className="py-[100px]">
      <Container>
        <Kicker>Testimonials</Kicker>
        <h2 className="section-title mb-10">{heading}</h2>

        {/* 3-up from 860px, matching the reference design's breakpoint. */}
        <Reveal className="grid grid-cols-1 gap-5 min-[860px]:grid-cols-3">
          {items.map((testimonial) => (
            <figure
              key={testimonial.author}
              className="rounded-[14px] border border-line bg-panel p-[26px]"
            >
              <p className="mb-[18px] text-[14.5px] leading-[1.55] text-ink">
                {testimonial.quote}
              </p>
              <figcaption className="flex items-center gap-[10px]">
                <span className="avatar">{testimonial.initial}</span>
                <b className="text-[14px]">{testimonial.author}</b>
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}