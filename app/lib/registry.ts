/**
 * ============================================================
 * WordPress "page registry" — WordPress manages the URLs, Next.js
 * renders the pages.
 *
 * In this architecture WordPress's ONLY job is to publish pages:
 *   • page slug  → the URL fragment (about → "/about/")
 *   • page title → SEO/metadata hint
 *   • page body  → intentionally left BLANK (no ACF, no Elementor,
 *                  no design in WordPress)
 *
 * This module reads that registry over WPGraphQL and maps slugs to
 * the matching Next.js routes. Everything here is defensive: if the
 * CMS is down or disabled, it degrades gracefully and the Next.js
 * pages keep working from their bundled defaults.
 * ============================================================
 */
import {
  REVALIDATE_SECONDS,
  WORDPRESS_ENABLED,
  decodeEntities,
  fetchWordPress,
  stripHtml,
} from "@/app/lib/wordpress";

export interface WordPressPage {
  id: string;
  /** Page slug, e.g. "about". */
  slug: string;
  /** Normalized path WITHOUT leading/trailing slash, e.g. "about". */
  uri: string;
  title: string;
}

/**
 * Result of resolving a URL against WordPress.
 *  - { ok: true,  page }  → WP answered; page is null when the slug
 *                           is NOT a published page (real 404).
 *  - { ok: false }        → WP unreachable/disabled; Next.js should
 *                           fall back to its own content, never break.
 */
export type PageLookup =
  | { ok: true; page: WordPressPage | null }
  | { ok: false };

interface GqlPageNode {
  id?: string | null;
  slug?: string | null;
  uri?: string | null;
  title?: string | null;
}

/* Registry query: every published page → the canonical URL list. */
const REGISTRY_QUERY = /* GraphQL */ `
  query PageRegistry($first: Int!) {
    pages(first: $first) {
      nodes {
        id
        slug
        uri
        title
      }
    }
  }
`;

/* Single page query: resolve one URL (used by the catch-all route).
   NOTE: pageBy's `uri` argument is typed String in WPGraphQL (not ID). */
const PAGE_QUERY = /* GraphQL */ `
  query PageByUri($uri: String!) {
    pageBy(uri: $uri) {
      id
      slug
      uri
      title
    }
  }
`;

function toPage(node: GqlPageNode): WordPressPage {
  const slug = node.slug ?? "";
  const uri = (node.uri ?? slug).replace(/^\/+|\/+$/g, "");
  return {
    id: node.id ?? "",
    slug,
    uri,
    title: decodeEntities(stripHtml(node.title ?? "")),
  };
}

let registryPromise: Promise<WordPressPage[]> | null = null;
let registryExpiresAt = 0;

/** All published WordPress pages (cached for the ISR window). Never throws. */
export function getPageRegistry(): Promise<WordPressPage[]> {
  if (registryPromise && registryExpiresAt > Date.now()) {
    return registryPromise;
  }
  registryPromise = fetchRegistry();
  registryExpiresAt = Date.now() + REVALIDATE_SECONDS * 1000;
  return registryPromise;
}

async function fetchRegistry(): Promise<WordPressPage[]> {
  if (!WORDPRESS_ENABLED) return [];
  try {
    const data = await fetchWordPress<{
      pages?: { nodes?: GqlPageNode[] | null } | null;
    }>(REGISTRY_QUERY, { first: 100 });
    return (data.pages?.nodes ?? []).filter((node) => node?.slug).map(toPage);
  } catch (error) {
    console.warn(
      "[registry] page list unavailable — falling back to Next.js routes:",
      error
    );
    return [];
  }
}

const lookupCache = new Map<string, { expiresAt: number; promise: Promise<PageLookup> }>();

/** Resolve a path (e.g. "about") against the WordPress registry. */
export function lookupPageUri(path: string): Promise<PageLookup> {
  const cached = lookupCache.get(path);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise;
  }
  const promise = fetchPageByUri(path);
  lookupCache.set(path, { expiresAt: Date.now() + REVALIDATE_SECONDS * 1000, promise });
  return promise;
}

async function fetchPageByUri(path: string): Promise<PageLookup> {
  if (!WORDPRESS_ENABLED) return { ok: false };
  const trimmed = path.replace(/^\/+|\/+$/g, "");

  // The CMS uses plain permalinks ("/index.php/<slug>/") — try both the
  // pretty form and the index.php form, with and without the trailing slash.
  const candidates = trimmed
    ? [
        `/${trimmed}/`,
        `/${trimmed}`,
        `/index.php/${trimmed}/`,
        `/index.php/${trimmed}`,
      ]
    : ["/", "/index.php/home/"];
  let reached = false;
  let lastError: unknown = null;

  for (const uri of candidates) {
    try {
      const data = await fetchWordPress<{ pageBy?: GqlPageNode | null }>(
        PAGE_QUERY,
        { uri }
      );
      reached = true;
      if (data.pageBy?.slug) {
        return { ok: true, page: toPage(data.pageBy) };
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (reached) {
    // WP answered but the slug is not a published page.
    return { ok: true, page: null };
  }
  console.warn(
    "[registry] WordPress unreachable for page lookup — rendering from Next.js:",
    lastError
  );
  return { ok: false };
}

/** True when the slug exists in the WordPress registry (cached). */
export async function isRegisteredSlug(slug: string): Promise<boolean> {
  const pages = await getPageRegistry();
  return pages.some((page) => page.slug === slug || page.uri === slug);
}