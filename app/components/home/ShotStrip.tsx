import type { Shot } from "@/app/lib/content/types";

/** Renders "line one\nline two" as two lines. */
function LabelLines({ label }: { label: string }) {
  const parts = label.split("\n");
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 ? <br /> : null}
        </span>
      ))}
    </>
  );
}

/**
 * Infinite marquee of project screenshots. The track is rendered
 * twice and animated with CSS (translateX -50%) for a seamless loop.
 */
export default function ShotStrip({ shots }: { shots: Shot[] }) {
  // Double the set so the -50% CSS animation loops seamlessly.
  const track = [...shots, ...shots];

  return (
    <div className="overflow-hidden pt-[30px]" aria-label="Project screenshots">
      <div className="marquee-track shot-track-anim gap-[18px]">
        {track.map((shot, i) =>
          shot.image ? (
            <div className="shot-card" key={`${shot.id}-${i}`}>
              <img
                src={shot.image}
                alt={shot.label.replace(/\n/g, " ")}
                width={380}
                height={250}
                loading="lazy"
                decoding="async"
              />
              <span className="shot-label">
                <LabelLines label={shot.label} />
              </span>
            </div>
          ) : (
            <div className="shot-placeholder" key={`${shot.id}-${i}`}>
              <span className="mb-[10px] text-[26px]" aria-hidden="true">
                ▢
              </span>
              <span className="font-semibold">
                <LabelLines label={shot.label} />
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}