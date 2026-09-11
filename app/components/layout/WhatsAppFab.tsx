import { site } from "@/app/lib/site";

/** Floating WhatsApp button (bottom-right), always available. */
export default function WhatsAppFab() {
  return (
    <a
      href={site.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-[26px] right-[26px] z-[200] flex size-14 items-center justify-center rounded-full bg-wa text-[24px] leading-none shadow-[0_10px_24px_-6px_rgba(37,211,102,0.6)] transition-transform duration-200 hover:scale-110"
    >
      💬
    </a>
  );
}