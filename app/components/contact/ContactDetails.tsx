import { site } from "@/app/lib/site";

const HOURS = "Mon – Sat · 9:00 AM – 7:00 PM (IST)";

/** Contact details column — everything comes from app/lib/site.ts. */
export default function ContactDetails() {
  return (
    <div className="rounded-[20px] border border-line bg-white p-8">
      <h2 className="mb-6 text-[22px] font-bold">Contact details</h2>

      <div className="space-y-4">
        <a
          href={`mailto:${site.email}`}
          className="flex items-center gap-3 rounded-[12px] bg-panel p-4 transition-colors hover:text-ink"
        >
          <span className="text-[22px]" aria-hidden="true">✉️</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-semibold uppercase tracking-[0.06em] text-slate-light">
              Email us
            </span>
            <span className="block text-[15px] font-medium text-ink">{site.email}</span>
          </span>
        </a>

        {site.phones.map((phone) => (
          <a
            key={phone.href}
            href={phone.href}
            className="flex items-center gap-3 rounded-[12px] bg-panel p-4 transition-colors"
          >
            <span className="text-[22px]" aria-hidden="true">📞</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-semibold uppercase tracking-[0.06em] text-slate-light">
                Call / WhatsApp
              </span>
              <span className="block text-[15px] font-medium text-ink">{phone.label}</span>
            </span>
          </a>
        ))}

        <a
          href={site.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-[12px] bg-panel p-4 transition-colors"
        >
          <span className="text-[22px]" aria-hidden="true">💬</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-semibold uppercase tracking-[0.06em] text-slate-light">
              WhatsApp
            </span>
            <span className="block text-[15px] font-medium text-wa">Chat right now →</span>
          </span>
        </a>

        <div className="flex items-center gap-3 rounded-[12px] bg-panel p-4">
          <span className="text-[22px]" aria-hidden="true">🏢</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-semibold uppercase tracking-[0.06em] text-slate-light">
              Offices
            </span>
            <span className="block text-[13.5px] leading-relaxed text-slate">{site.addressIndia}</span>
            <span className="block text-[13.5px] leading-relaxed text-slate">{site.addressUS}</span>
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-[12px] bg-panel p-4">
          <span className="text-[22px]" aria-hidden="true">🕘</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-semibold uppercase tracking-[0.06em] text-slate-light">
              Working hours
            </span>
            <span className="block text-[15px] font-medium text-ink">{HOURS}</span>
          </span>
        </div>
      </div>
    </div>
  );
}