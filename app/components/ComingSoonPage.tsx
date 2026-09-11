import Link from "next/link";
import Kicker from "@/app/components/ui/Kicker";

/**
 * Shared template for upcoming/placeholder pages (Services, About,
 * Contact, etc.). Reuses the global Header/Footer via the root layout.
 */
export default function ComingSoonPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="py-[120px] text-center">
      <div className="mx-auto w-full max-w-[680px] px-8">
        <Kicker centered>Coming Soon</Kicker>
        <h1 className="mb-4 text-[40px] font-bold">{title}</h1>
        <p className="mb-10 text-[17px] leading-relaxed text-slate">
          {description}
        </p>
        <Link href="/" className="btn-ghost">
          ← Back to Home
        </Link>
      </div>
    </section>
  );
}