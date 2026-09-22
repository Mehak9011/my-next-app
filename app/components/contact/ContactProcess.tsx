import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";

interface Step {
  number: string;
  title: string;
  description: string;
}

interface ContactProcessProps {
  kicker?: string;
  heading: string;
  steps: Step[];
}

/**
 * "What to expect" timeline — mirrors the home page Services/Industries
 * pattern (Container + Kicker + section-title, Reveal with stagger).
 * Renders a numbered vertical timeline that collapses to a 2-column
 * grid on wider viewports.
 */
export default function ContactProcess({
  kicker = "Our Process",
  heading,
  steps,
}: ContactProcessProps) {
  return (
    <section className="contact-process bg-panel py-[100px]">
      <Container>
        <Reveal variant="up">
            <div className="text-center">
              <Kicker centered>{kicker}</Kicker>
            </div>  
            <h2 className="mx-auto mb-4 max-w-[720px] text-center text-[28px] font-bold leading-snug sm:text-[36px]">
            {heading}
          </h2>
        </Reveal>

        <Reveal variant="up" delay={80}>
          <p className="mx-auto mb-14 max-w-[560px] text-center text-[15px] leading-relaxed text-slate">
            Simple, transparent steps — from first message to project kick-off.
          </p>
        </Reveal>

        <div className="relative mx-auto max-w-[820px]">
          {/* vertical line */}
          <span
            className="absolute left-[15px] top-0 h-[calc(100%-28px)] w-0.5 bg-line"
            aria-hidden="true"
          />

          <div className="flex flex-col gap-8">
            {steps.map((step, index) => (
              <Reveal key={step.number} variant="left" delay={index * 90}>
                <div className="contact-process-step relative flex items-start gap-5">
                  <span
                    className={
                      "contact-process-step-number mt-0.5 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-crimson text-[15px] font-bold text-white"
                    }
                  >
                    {step.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 text-[17px] font-semibold text-ink">
                      {step.title}
                    </h3>
                    <p className="text-[14px] leading-relaxed text-slate">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
