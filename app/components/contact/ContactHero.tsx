import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";

/** Contact hero — identical pattern to the home/about heroes. */
export default function ContactHero() {
  return (
    <section className="pt-[110px] pb-[70px] text-center">
      <Container>
        <Reveal variant="mask">
          <Kicker centered>Contact</Kicker>

          <h1 className="hero-title mx-auto mb-6 max-w-[920px]">
            Let&apos;s build something{" "}
            <span className="text-crimson">great together.</span>
          </h1>
        </Reveal>

        <Reveal variant="up" delay={120}>
          <p className="mx-auto mb-7 max-w-[620px] text-[18px] leading-relaxed text-slate">
            Tell us what you are building. We reply within one business day —
            with questions, ideas and a clear next step.
          </p>
        </Reveal>

        <Reveal variant="up" delay={220}>
          <p className="text-[13px] font-medium tracking-wide text-slate-light">
            Free 15-minute consultation · No sales pressure · Mon – Sat, 9 AM –
            7 PM IST
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
