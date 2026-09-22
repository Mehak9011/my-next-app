import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";

interface PricingHeroProps {
  kicker: string;
  title: string;
  titleAccent: string;
  subtitle: string;
}

/** Centered pricing hero — same pattern as the home/about/contact heroes. */
export default function PricingHero({
  kicker,
  title,
  titleAccent,
  subtitle,
}: PricingHeroProps) {
  return (
    <section className="pt-[110px] pb-[45px] text-center">
      <Container>
        <Reveal variant="mask">
          <div className="flex justify-center">
            <Kicker>{kicker}</Kicker>
          </div>

          <h1 className="hero-title mx-auto mb-6 max-w-[920px]">
            {title} <span className="text-crimson">{titleAccent}</span>
          </h1>
        </Reveal>

        <Reveal variant="up" delay={120}>
          <p className="mx-auto max-w-[650px] text-[17px] leading-relaxed text-slate">
            {subtitle}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}