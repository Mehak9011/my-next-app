import { defaultHomeContent } from "@/app/lib/content/defaults";
import type { HomeContent } from "@/app/lib/content/types";

/**
 * ============================================================
 * WordPress (headless) data layer — WPGraphQL + REST clients.
 *
 * Architecture (Headless WordPress + Next.js, no ACF, no Elementor):
 *   • 100% of the frontend lives in Next.js — components, design,
 *     Tailwind, animations AND the actual page content defaults.
 *   • WordPress is ONLY the CMS/backend that registers the pages
 *     and provides the URLs/routes through WPGraphQL.
 *   • This module is the thin HTTP client for that backend:
 *       - fetchWordPress()  → POST to the WPGraphQL endpoint
 *       - fetchRest()       → GET a REST (wp-json) route
 *   • The "WordPress manages the URLs" layer lives in
 *     app/lib/registry.ts on top of these clients.
 *
 *   WordPress pages are intentionally BLANK — they only exist so
 *   their slugs/URLs are defined in one place (the CMS). The design
 *   is never built in WordPress.
 * ============================================================
 */

export const WORDPRESS_ENABLED = process.env.WORDPRESS_ENABLED === "true";
export const GRAPHQL_URL = process.env.WORDPRESS_GRAPHQL_URL ?? "";
const REST_URL = process.env.WORDPRESS_REST_URL ?? "";
const TIMEOUT_MS = Number(process.env.WORDPRESS_TIMEOUT_MS ?? 8000);
export const REVALIDATE_SECONDS = 60;

/** fetch with timeout + ISR revalidation. */
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await Promise.race([
    fetch(url, { ...init, next: { revalidate: REVALIDATE_SECONDS } }),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("WordPress request timed out")),
        TIMEOUT_MS
      )
    ),
  ]);

  if (!response.ok) {
    throw new Error(
      `WordPress API error: ${response.status} ${response.statusText}`
    );
  }
  return (await response.json()) as T;
}

/** Generic WPGraphQL client (POST). */
export async function fetchWordPress<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  if (!GRAPHQL_URL) {
    throw new Error("WORDPRESS_GRAPHQL_URL is not configured");
  }
  const body = await request<{
    data?: T;
    errors?: { message: string }[];
  }>(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join(", "));
  }
  if (!body.data) {
    throw new Error("Empty GraphQL response");
  }
  return body.data;
}

/** Generic REST API client (wp-json). */
export async function fetchRest<T>(path: string): Promise<T> {
  if (!REST_URL) {
    throw new Error("WORDPRESS_REST_URL is not configured");
  }
  const url = `${REST_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  return request<T>(url);
}

/** Strip HTML tags and collapse whitespace. */
export function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Decode common HTML entities returned by WPGraphQL titles. */
export function decodeEntities(value: string): string {
  return value
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

/* ------------------------------------------------------------------
   Home page content.

   The design AND the copy live entirely in Next.js
   (app/lib/content/defaults.ts). WordPress neither provides content
   nor styling for the home page — it only registers the "/" route
   (Settings → Reading → static front page → the "Home" page).
   ------------------------------------------------------------------ */
export async function getHomeContent(): Promise<HomeContent> {
  return defaultHomeContent;
}