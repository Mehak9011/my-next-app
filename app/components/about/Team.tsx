import Container from "@/app/components/ui/Container";
import Kicker from "@/app/components/ui/Kicker";
import Reveal from "@/app/components/ui/Reveal";
import type { AboutContent } from "@/app/lib/content/types";

/** Team — member cards with avatar initial, role and location. */
export default function Team({ team }: { team: AboutContent["team"] }) {
  const initial = (name: string) =>
    (name.trim().charAt(0) || "?").toUpperCase();

  return (
    <Reveal>
      <Container className="py-20 text-center">
        <Kicker centered>{team.kicker}</Kicker>
        <h2 className="section-title mx-auto mb-12 text-center">{team.heading}</h2>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.items.map((member) => (
            <article
              key={member.name}
              className="rounded-[20px] border border-line bg-panel p-7 text-left"
            >
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-ink text-[20px] font-bold text-white">
                {initial(member.name)}
              </div>
              <h3 className="mb-0.5 text-[16px] font-bold text-ink">{member.name}</h3>
              <p className="mb-3 text-[12.5px] font-semibold uppercase tracking-[0.05em] text-crimson">
                {member.role}
              </p>
              <p className="mb-3 text-[12.5px] font-medium text-slate-light">
                📍 {member.location}
              </p>
              <p className="text-[13.5px] leading-relaxed text-slate">
                {member.bio}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </Reveal>
  );
}