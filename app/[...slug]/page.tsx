import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RegisteredPage from "@/app/components/pages/RegisteredPage";
import { lookupPageUri } from "@/app/lib/registry";

type Props = { params: Promise<{ slug?: string[] }> };

function humanize(path: string): string {
  if (!path) return "Page";
  const segment = path.split("/").filter(Boolean).pop() ?? "page";
  return segment
    .split(/[-_]+/)
    .map((word) => (word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = slug?.join("/") ?? "";
  const lookup = await lookupPageUri(path);
  const title = lookup.ok && lookup.page ? lookup.page.title : humanize(path);
  return { title };
}

/**
 * Catch-all route — serves ANY URL that WordPress registers but which
 * does not have a dedicated Next.js design yet.
 *
 * Behaviour:
 *   • WordPress is up and the slug IS published      → render the
 *     registered title in the shared template.
 *   • WordPress is up but the slug is NOT a page     → real 404.
 *   • WordPress is down/disabled                     → render anyway
 *     from the slug so no URL ever breaks.
 */
export default async function WordPressPageRoute({ params }: Props) {
  const { slug } = await params;
  const path = slug?.join("/") ?? "";

  const lookup = await lookupPageUri(path);

  if (lookup.ok && !lookup.page) {
    notFound();
  }

  const title = lookup.ok && lookup.page ? lookup.page.title : humanize(path);
  return <RegisteredPage slug={path} title={title} />;
}