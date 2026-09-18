import ComingSoonPage from "@/app/components/ComingSoonPage";

/**
 * Generic template for URLs that WordPress registers but which do not have
 * a dedicated Next.js design yet. Keeps the route alive with the same
 * "Coming Soon" view used by the other inner pages.
 *
 * Build a dedicated page (app/<slug>/page.tsx) to replace this with a
 * custom design whenever you're ready.
 */
export default function RegisteredPage({ title }: { title: string }) {
  return <ComingSoonPage title={title} />;
}