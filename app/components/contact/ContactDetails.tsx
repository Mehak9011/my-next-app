import { site } from "@/app/lib/site";
import Reveal from "@/app/components/ui/Reveal";

const HOURS = "Mon – Sat · 9:00 AM – 7:00 PM (IST)";

/** Small inline brand icons (no emoji, matches the home page look). */
function Icon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[20px] w-[20px] text-crimson"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  phone:
    "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  chat: "M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5M8 10h8M8 13h5",
  office: "M4 21V5l8-3 8 3v16M9 21v-4h6v4M9 8h.01M12 8h.01M15 8h.01M9 12h.01M12 12h.01M15 12h.01",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7v5l3 3",
};

function Label({ children }: { children: string }) {
  return (
    <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-slate-light">
      {children}
    </span>
  );
}

const rowClasses =
  "group flex items-start gap-4 rounded-[14px] border border-line bg-white p-[18px] transition-all duration-200 hover:-translate-y-[2px] hover:border-crimson/60 hover:shadow-[0_14px_30px_-18px_rgba(20,24,29,0.35)]";

function IconChip({ path }: { path: string }) {
  return (
    <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px] bg-panel transition-colors group-hover:bg-crimson/10">
      <Icon path={path} />
    </span>
  );
}

/** Contact details column — everything comes from app/lib/site.ts. */
export default function ContactDetails() {
  return (
    <div className="flex h-full flex-col">
      <Reveal variant="left">
        <h2 className="section-title mb-6 text-[30px]">Contact details</h2>
      </Reveal>

      <div className="flex flex-col gap-[14px]">
        <Reveal variant="left" delay={60}>
          <a href={`mailto:${site.email}`} className={rowClasses}>
            <IconChip path={ICONS.mail} />
            <span className="min-w-0 flex-1">
              <Label>Email us</Label>
              <span className="block truncate text-[15px] font-semibold text-ink">
                {site.email}
              </span>
            </span>
          </a>
        </Reveal>

        {site.phones.map((phone, index) => (
          <Reveal key={phone.href} variant="left" delay={120 + index * 60}>
            <a href={phone.href} className={rowClasses}>
              <IconChip path={ICONS.phone} />
              <span className="min-w-0 flex-1">
                <Label>Call / WhatsApp</Label>
                <span className="block text-[15px] font-semibold text-ink">
                  {phone.label}
                </span>
              </span>
            </a>
          </Reveal>
        ))}

        <Reveal variant="left" delay={240}>
          <a
            href={site.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className={rowClasses}
          >
            <IconChip path={ICONS.chat} />
            <span className="min-w-0 flex-1">
              <Label>WhatsApp</Label>
              <span className="block text-[15px] font-semibold text-wa">
                Chat right now →
              </span>
            </span>
          </a>
        </Reveal>

        <Reveal variant="left" delay={300}>
          <div className={rowClasses}>
            <IconChip path={ICONS.office} />
            <span className="min-w-0 flex-1">
              <Label>Offices</Label>
              <span className="block text-[13.5px] leading-relaxed text-slate">
                {site.addressIndia}
              </span>
              <span className="block text-[13.5px] leading-relaxed text-slate">
                {site.addressUS}
              </span>
            </span>
          </div>
        </Reveal>

        <Reveal variant="left" delay={360}>
          <div className={rowClasses}>
            <IconChip path={ICONS.clock} />
            <span className="min-w-0 flex-1">
              <Label>Working hours</Label>
              <span className="block text-[15px] font-semibold text-ink">
                {HOURS}
              </span>
            </span>
          </div>
        </Reveal>
      </div>
    </div>
  );
}