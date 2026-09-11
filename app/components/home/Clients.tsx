import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import type { HomeContent } from "@/app/lib/content/types";

/** Client logo strip. */
export default function Clients({
  clients,
}: {
  clients: HomeContent["clients"];
}) {
  return (
    <div className="border-t border-line py-[70px] text-center">
      <Container>
        <Kicker centered>{clients.kicker}</Kicker>
        <h3 className="mb-10 text-[24px]">{clients.heading}</h3>
        <div className="flex flex-wrap items-center justify-center gap-[60px]">
          {clients.names.map((name) => (
            <span
              key={name}
              className="text-[19px] font-bold text-slate-light opacity-70 transition-opacity duration-200 hover:text-ink hover:opacity-100"
            >
              {name}
            </span>
          ))}
        </div>
      </Container>
    </div>
  );
}