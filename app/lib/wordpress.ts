import { defaultHomeContent } from "@/app/lib/content/defaults";
import type {
  Faq,
  HomeContent,
  Industry,
  ServiceGroup,
  Shot,
  Stat,
  Testimonial,
} from "@/app/lib/content/types";

/**
 * ============================================================
 * WordPress (headless CMS) data layer.
 *
 * Strategy:
 *   1. WPGraphQL  — primary source (requires the WPGraphQL plugin,
 *                   optionally WPGraphQL for ACF for structured fields).
 *   2. REST API   — automatic fallback (wp-json), reads the same ACF
 *                   fields plus a `testimonial` custom post type.
 *   3. Defaults   — if the CMS is disabled or unreachable, the bundled
 *                   default content is used so the site always renders.
 *
 * Every mapper is defensive: whatever the CMS returns is merged over
 * the defaults, so a partially-configured WordPress never breaks the
 * page — it simply fills in the pieces it has.
 * ============================================================
 */

const GRAPHQL_URL = process.env.WORDPRESS_GRAPHQL_URL ?? "";
const REST_URL = process.env.WORDPRESS_REST_URL ?? "";
const ENABLED = process.env.WORDPRESS_ENABLED === "true";
const TIMEOUT_MS = Number(process.env.WORDPRESS_TIMEOUT_MS ?? 8000);
const REVALIDATE_SECONDS = 60;

/**
 * Candidate URIs for the Home page. WPGraphQL resolves pages by URI, and the
 * URI depends on the WordPress permalink settings plus whether "Home" is the
 * assigned static front page (which the shipped ACF field group targets):
 *
 *   - Home assigned as static front page  →  "/"
 *   - Pretty permalinks ("Post name")     →  "/home/"
 *   - Current cms.codexmattrix.com setup  →  "/index.php/home/"
 *
 * The first candidate that returns a page wins the match.
 */
const HOME_URI_CANDIDATES = ["/index.php/home/", "/home/", "/"];

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
    throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

/** Generic WPGraphQL client. */
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

/* ------------------------------------------------------------------
   GraphQL query for the Home Page.
   Expects a page with slug "home" and the ACF field group shipped in
   /wordpress/acf-field-group.json (see README for the full setup).
   ------------------------------------------------------------------ */
export const homeQuery = /* GraphQL */ `
  query HomeContent($uri: ID!) {
    pageBy(uri: $uri) {
      title
      acf {
        heroKicker
        heroTitle
        heroSubtitle
        heroTrustBadge
        stats {
          value
          label
        }
        servicesHeading
        services {
          title
          items
        }
        industriesHeading
        industries {
          title
          description
          image
        }
        testimonialsHeading
        faqsHeading
        faqs {
          question
          answer
        }
        ctaTitle
        ctaSubtitle
        ctaButton
        clientsHeading
        clients {
          name
        }
      }
    }
    testimonials(first: 12) {
      nodes {
        title
        content
      }
    }
  }
`;

/* ------------------------------------------------------------------
   Loose CMS response shapes (WPGraphQL + REST).
   ------------------------------------------------------------------ */
interface GqlHomeResponse {
  pageBy?: {
    title?: string;
    acf?: {
      heroKicker?: string | null;
      heroTitle?: string | null;
      heroSubtitle?: string | null;
      heroTrustBadge?: string | null;
      stats?: Array<{ value?: string | null; label?: string | null }> | null;
      servicesHeading?: string | null;
      services?: Array<{
        title?: string | null;
        items?: string | string[] | null;
      }> | null;
      industriesHeading?: string | null;
      industries?: Array<{
        title?: string | null;
        description?: string | null;
        image?: string | null;
      }> | null;
      testimonialsHeading?: string | null;
      faqsHeading?: string | null;
      faqs?: Array<{ question?: string | null; answer?: string | null }> | null;
      ctaTitle?: string | null;
      ctaSubtitle?: string | null;
      ctaButton?: string | null;
      clientsHeading?: string | null;
      clients?: Array<{ name?: string | null }> | null;
    };
  };
  testimonials?: {
    nodes?: Array<{ title?: string; content?: string }>;
  };
}

interface RestHomeResponse {
  page?: {
    title?: { rendered?: string };
    acf?: {
      hero_kicker?: string | null;
      hero_title?: string | null;
      hero_subtitle?: string | null;
      hero_trust_badge?: string | null;
      stats?: Array<{ value?: string; label?: string }> | null;
      services_heading?: string | null;
      services?: Array<{
        title?: string;
        items?: string | string[];
      }> | null;
      industries_heading?: string | null;
      industries?: Array<{
        title?: string;
        description?: string;
        image?: string;
      }> | null;
      testimonials_heading?: string | null;
      faqs_heading?: string | null;
      faqs?: Array<{ question?: string; answer?: string }> | null;
      cta_title?: string | null;
      cta_subtitle?: string | null;
      cta_button?: string | null;
      clients_heading?: string | null;
      clients?: Array<{ name?: string }> | null;
    };
  };
  testimonials?: Array<{
    title?: { rendered?: string };
    content?: { rendered?: string };
  }>;
}

/* ------------------------------------------------------------------
   Mappers — merge CMS data over the defaults (never throw).

   `HomeDraft` is a looser, all-optional shape so a partial CMS
   response (including explicitly undefined collections) can merge
   over the bundled defaults without type friction.
   ------------------------------------------------------------------ */
interface HomeDraft {
  hero?: Partial<HomeContent["hero"]>;
  shots?: Shot[];
  stats?: Stat[];
  services?: { heading?: string; groups?: ServiceGroup[] };
  industries?: { heading?: string; items?: Industry[] };
  testimonials?: { heading?: string; items?: Testimonial[] };
  faqs?: { heading?: string; items?: Faq[] };
  cta?: Partial<HomeContent["cta"]>;
  clients?: { kicker?: string; heading?: string; names?: string[] };
}

function mergeHomeContent(partial: HomeDraft): HomeContent {
  return {
    hero: { ...defaultHomeContent.hero, ...partial.hero },
    shots: partial.shots ?? defaultHomeContent.shots,
    stats: partial.stats ?? defaultHomeContent.stats,
    services: {
      ...defaultHomeContent.services,
      ...partial.services,
      groups: partial.services?.groups ?? defaultHomeContent.services.groups,
    },
    industries: {
      ...defaultHomeContent.industries,
      ...partial.industries,
      items:
        partial.industries?.items ?? defaultHomeContent.industries.items,
    },
    testimonials: {
      ...defaultHomeContent.testimonials,
      ...partial.testimonials,
      items:
        partial.testimonials?.items ?? defaultHomeContent.testimonials.items,
    },
    faqs: {
      ...defaultHomeContent.faqs,
      ...partial.faqs,
      items: partial.faqs?.items ?? defaultHomeContent.faqs.items,
    },
    cta: { ...defaultHomeContent.cta, ...partial.cta },
    clients: {
      ...defaultHomeContent.clients,
      ...partial.clients,
      names: partial.clients?.names ?? defaultHomeContent.clients.names,
    },
  };
}

function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** ACF "items" can arrive as a string (newline separated) or an array. */
function toItems(items?: string | string[] | null): string[] {
  if (Array.isArray(items)) return items.filter(Boolean);
  return (items ?? "")
    .split(/\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toTestimonials(
  nodes?: Array<{ title?: string; content?: string }>
): Testimonial[] {
  return (nodes ?? [])
    .filter((n) => n.title || n.content)
    .map((n, i) => ({
      quote: `"${stripHtml(n.content) || stripHtml(n.title)}"`,
      initial: (stripHtml(n.title) || "C").charAt(0).toUpperCase(),
      author: stripHtml(n.title) || `Client ${i + 1}`,
    }));
}

function mapGraphQLHome(data: GqlHomeResponse): HomeContent {
  const acf = data.pageBy?.acf;
  const groups: ServiceGroup[] = (acf?.services ?? [])
    .filter((g) => g.title)
    .map((g) => ({ title: g.title!, items: toItems(g.items) }));

  const industries: Industry[] = (acf?.industries ?? [])
    .filter((i) => i.title)
    .map((i) => ({
      title: i.title!,
      description: i.description ?? "",
      image: i.image ?? null,
      link: "/case-studies",
    }));

  const faqs: Faq[] = (acf?.faqs ?? [])
    .filter((f) => f.question)
    .map((f) => ({ question: f.question!, answer: f.answer ?? "" }));

  const stats: Stat[] = (acf?.stats ?? [])
    .filter((s) => s.value)
    .map((s) => ({ value: s.value!, label: s.label ?? "" }));

  const tests = toTestimonials(data.testimonials?.nodes);
  const clientNames = (acf?.clients ?? [])
    .map((c) => c.name)
    .filter((n): n is string => Boolean(n));

  return mergeHomeContent({
    hero: {
      kicker: acf?.heroKicker ?? defaultHomeContent.hero.kicker,
      title: acf?.heroTitle ?? defaultHomeContent.hero.title,
      subtitle: acf?.heroSubtitle ?? defaultHomeContent.hero.subtitle,
      trustBadge:
        acf?.heroTrustBadge ?? defaultHomeContent.hero.trustBadge,
    },
    stats: stats.length ? stats : undefined,
    services: {
      heading: acf?.servicesHeading ?? defaultHomeContent.services.heading,
      groups: groups.length ? groups : undefined,
    },
    industries: {
      heading:
        acf?.industriesHeading ?? defaultHomeContent.industries.heading,
      items: industries.length ? industries : undefined,
    },
    testimonials: {
      heading:
        acf?.testimonialsHeading ?? defaultHomeContent.testimonials.heading,
      items: tests.length ? tests : undefined,
    },
    faqs: {
      heading: acf?.faqsHeading ?? defaultHomeContent.faqs.heading,
      items: faqs.length ? faqs : undefined,
    },
    cta: {
      title: acf?.ctaTitle ?? defaultHomeContent.cta.title,
      subtitle: acf?.ctaSubtitle ?? defaultHomeContent.cta.subtitle,
      buttonLabel: acf?.ctaButton ?? defaultHomeContent.cta.buttonLabel,
    },
    clients: {
      kicker: defaultHomeContent.clients.kicker,
      heading: acf?.clientsHeading ?? defaultHomeContent.clients.heading,
      names: clientNames.length ? clientNames : undefined,
    },
  });
}

function mapRestHome(data: RestHomeResponse): HomeContent {
  const acf = data.page?.acf;
  const groups: ServiceGroup[] = (acf?.services ?? [])
    .filter((g) => g.title)
    .map((g) => ({ title: g.title!, items: toItems(g.items) }));

  const industries: Industry[] = (acf?.industries ?? [])
    .filter((i) => i.title)
    .map((i) => ({
      title: i.title!,
      description: i.description ?? "",
      image: i.image ?? null,
      link: "/case-studies",
    }));

  const faqs: Faq[] = (acf?.faqs ?? [])
    .filter((f) => f.question)
    .map((f) => ({ question: f.question!, answer: f.answer ?? "" }));

  const stats: Stat[] = (acf?.stats ?? [])
    .filter((s) => s.value)
    .map((s) => ({ value: s.value!, label: s.label ?? "" }));

  const testimonials: Testimonial[] = (data.testimonials ?? []).map(
    (t, i) => ({
      quote: `"${stripHtml(t.content?.rendered) || stripHtml(t.title?.rendered)}"`,
      initial: (stripHtml(t.title?.rendered) || "C").charAt(0).toUpperCase(),
      author: stripHtml(t.title?.rendered) || `Client ${i + 1}`,
    })
  );

  const clientNames = (acf?.clients ?? [])
    .map((c) => c.name)
    .filter((n): n is string => Boolean(n));

  return mergeHomeContent({
    hero: {
      kicker: acf?.hero_kicker ?? defaultHomeContent.hero.kicker,
      title: acf?.hero_title ?? defaultHomeContent.hero.title,
      subtitle: acf?.hero_subtitle ?? defaultHomeContent.hero.subtitle,
      trustBadge:
        acf?.hero_trust_badge ?? defaultHomeContent.hero.trustBadge,
    },
    stats: stats.length ? stats : undefined,
    services: {
      heading:
        acf?.services_heading ?? defaultHomeContent.services.heading,
      groups: groups.length ? groups : undefined,
    },
    industries: {
      heading:
        acf?.industries_heading ?? defaultHomeContent.industries.heading,
      items: industries.length ? industries : undefined,
    },
    testimonials: {
      heading:
        acf?.testimonials_heading ?? defaultHomeContent.testimonials.heading,
      items: testimonials.length ? testimonials : undefined,
    },
    faqs: {
      heading: acf?.faqs_heading ?? defaultHomeContent.faqs.heading,
      items: faqs.length ? faqs : undefined,
    },
    cta: {
      title: acf?.cta_title ?? defaultHomeContent.cta.title,
      subtitle: acf?.cta_subtitle ?? defaultHomeContent.cta.subtitle,
      buttonLabel: acf?.cta_button ?? defaultHomeContent.cta.buttonLabel,
    },
    clients: {
      kicker: defaultHomeContent.clients.kicker,
      heading: acf?.clients_heading ?? defaultHomeContent.clients.heading,
      names: clientNames.length ? clientNames : undefined,
    },
  });
}

/* ------------------------------------------------------------------
   Public entry point — never throws.
   ------------------------------------------------------------------ */
// export async function getHomeContent(): Promise<HomeContent> {
//   if (!ENABLED) {
//     return defaultHomeContent;
//   }
export async function getHomeContent(): Promise<HomeContent> {
  if (ENABLED) {
    try {
      const pages = await fetchRest<any[]>(
        "wp/v2/pages?slug=home"
      );

      if (pages.length > 0) {
        console.log(
          "[wordpress] Home page connected:",
          pages[0].link
        );
      } else {
        console.warn("[wordpress] Home page not found");
      }
    } catch (error) {
      console.warn(
        "[wordpress] WordPress connection failed:",
        error
      );
    }
  }

  // Home page content/design comes from Next.js
  return defaultHomeContent;
}
  // 1) WPGraphQL first. Try each candidate URI so the page resolves whether
  //    Home is the static front page, uses pretty permalinks, or the current
  //    /index.php/ permalink structure. A page that resolves to `null` counts
  //    as "not found" so the REST fallback can take over.
  for (const uri of HOME_URI_CANDIDATES) {
    try {
      const data = await fetchWordPress<GqlHomeResponse>(homeQuery, { uri });
      if (data.pageBy) {
        return mapGraphQLHome(data);
      }
      console.warn(
        `[wordpress] WPGraphQL: no page found at URI "${uri}", trying next…`
      );
    } catch (error) {
      console.warn(
        `[wordpress] WPGraphQL unavailable for URI "${uri}", trying next:`,
        error
      );
    }
  }

  // 2) REST API as fallback.
  try {
    const pages = await fetchRest<RestHomeResponse["page"][]>(
      "wp/v2/pages?slug=home&acf_format=standard"
    );
    const testimonials = await fetchRest<RestHomeResponse["testimonials"]>(
      "wp/v2/testimonial?per_page=12"
    );
    return mapRestHome({ page: pages[0], testimonials });
  } catch (error) {
    console.warn(
      "[wordpress] REST unavailable, using bundled defaults:",
      error
    );
  }

  // 3) Bundled defaults.
  return defaultHomeContent;
}