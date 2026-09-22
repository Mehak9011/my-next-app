import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";
import type { HomeContent } from "@/app/lib/content/types";

/** Client logo strip — staggered fade-in with a lift on hover. */
export default function Clients({
  clients,
}: {
  clients: HomeContent["clients"];
}) {
  return (
    <div className="border-t border-line py-[70px] text-center">
      <Container>
        <Reveal variant="up">
          <Kicker centered>{clients.kicker}</Kicker>
          <h3 className="mb-10 text-[24px]">{clients.heading}</h3>
        </Reveal>

        <div className="flex flex-wrap items-center justify-center gap-[60px]">
          {clients.names.map((name, index) => (
            <Reveal key={name} variant="fade" delay={index * 80}>
              <span className="client-logo text-[19px] font-bold text-slate-light opacity-70 hover:text-ink hover:opacity-100">
                {name}
              </span>
            </Reveal>
          ))}
        </div>
      </Container>
    </div>
  );
}
