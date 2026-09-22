import { defaultHomeContent } from "@/app/lib/content/defaults";
import { defaultPricingContent as pricingFallback } from "@/app/lib/content/pricing";
import type {
  HomeContent,
  PricingContent,
  PricingPlan,
  PricingProductOption,
  PricingQuestion,
  PricingWebsiteType,
} from "@/app/lib/content/types";

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

/** Generic REST API client (wp-json). Route defaults to the wp/v2 namespace. */
export async function fetchRest<T>(path: string): Promise<T> {
  if (!REST_URL) {
    throw new Error("WORDPRESS_REST_URL is not configured");
  }
  const base = REST_URL.replace(/\/$/, "");
  let route = path.replace(/^\//, "");
  // REST routes live under /wp-json/wp/v2/… — add the namespace unless the
  // caller already provided one (wp/v2, acf/v3, …).
  if (!/^(wp\/v2|wp\/|acf\/v[23])/.test(route)) {
    route = `wp/v2/${route}`;
  }
  const url = `${base}/${route}`;
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

/* ------------------------------------------------------------------
   Pricing page content — WordPress ACF with bundled Next.js fallback.

   Tab "design"      ← ACF group "Designing"
   Tab "development" ← ACF group "Development"

   Free-ACF compatible: only text / number / textarea / group fields
   (fixed slots, no repeaters). WordPress exposes the same slots twice:
   snake_case over REST, camelCase over WPGraphQL (graphql_field_name).
   Both spellings are accepted here.
   ------------------------------------------------------------------ */

/** Raw ACF payload shape (exact names in wordpress/pricing-acf-setup.md). */
interface AcfPricingPayload {
  heroKicker?: unknown;
  heroTitle?: unknown;
  heroTitleAccent?: unknown;
  heroSubtitle?: unknown;
  designTabLabel?: unknown;
  designKicker?: unknown;
  designHeading?: unknown;
  designSubtitle?: unknown;
  designQuestions?: unknown;
  summaryLabel?: unknown;
  summaryTitle?: unknown;
  summaryEmpty?: unknown;
  totalLabel?: unknown;
  totalNote?: unknown;
  designCta?: unknown;
  devTabLabel?: unknown;
  devPopularLabel?: unknown;
  devKicker?: unknown;
  devHeading?: unknown;
  devSubtitle?: unknown;
  devPlans?: unknown;
  ctaTitle?: unknown;
  ctaSubtitle?: unknown;
  ctaButton?: unknown;
}

function text(value: unknown, fallback: string): string {
  const cleaned = decodeEntities(stripHtml(typeof value === "string" ? value : ""));
  return cleaned || fallback;
}

function num(value: unknown, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function lines(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((line) => text(line, "")).filter(Boolean);
  }
  if (typeof value !== "string" || !value.trim()) return [];
  return value
    .split(/\r?\n/)
    .map((line) => text(line, ""))
    .filter(Boolean);
}

function pick(record: Record<string, unknown>, ...names: string[]): unknown {
  for (const name of names) {
    if (record[name] !== undefined && record[name] !== null) return record[name];
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Merge raw ACF values over bundled defaults — slot by slot, never fatal. */
export function mergePricingContent(
  payload: AcfPricingPayload | null | undefined,
  fallback: PricingContent = pricingFallback
): PricingContent {
  if (!payload || !isRecord(payload)) return fallback;
  const get = (...names: string[]) => pick(payload, ...names);

  return {
    hero: {
      kicker: text(get("heroKicker", "hero_kicker"), fallback.hero.kicker),
      title: text(get("heroTitle", "hero_title"), fallback.hero.title),
      titleAccent: text(
        get("heroTitleAccent", "hero_title_accent"),
        fallback.hero.titleAccent
      ),
      subtitle: text(get("heroSubtitle", "hero_subtitle"), fallback.hero.subtitle),
    },
    design: {
      ...fallback.design,
      tabLabel: text(get("designTabLabel", "design_tab_label"), fallback.design.tabLabel),
      kicker: text(get("designKicker", "design_kicker"), fallback.design.kicker),
      heading: text(get("designHeading", "design_heading"), fallback.design.heading),
      sub: text(get("designSubtitle", "design_subtitle"), fallback.design.sub),
      questions: mergePricingQuestions(get("designQuestions", "design_questions"), fallback),
      summaryLabel: text(get("summaryLabel", "summary_label"), fallback.design.summaryLabel),
      summaryTitle: text(get("summaryTitle", "summary_title"), fallback.design.summaryTitle),
      emptyText: text(get("summaryEmpty", "summary_empty"), fallback.design.emptyText),
      totalLabel: text(get("totalLabel", "total_label"), fallback.design.totalLabel),
      totalNote: text(get("totalNote", "total_note"), fallback.design.totalNote),
      ctaLabel: text(get("designCta", "design_cta"), fallback.design.ctaLabel),
    },
    development: {
      ...fallback.development,
      tabLabel: text(get("devTabLabel", "dev_tab_label"), fallback.development.tabLabel),
      popularLabel: text(
        get("devPopularLabel", "dev_popular_label"),
        fallback.development.popularLabel
      ),
      kicker: text(get("devKicker", "dev_kicker"), fallback.development.kicker),
      heading: text(get("devHeading", "dev_heading"), fallback.development.heading),
      sub: text(get("devSubtitle", "dev_subtitle"), fallback.development.sub),
      plans: mergePricingPlans(get("devPlans", "dev_plans"), fallback),
    },
    cta: {
      title: text(get("ctaTitle", "cta_title"), fallback.cta.title),
      subtitle: text(get("ctaSubtitle", "cta_subtitle"), fallback.cta.subtitle),
      buttonLabel: text(get("ctaButton", "cta_button"), fallback.cta.buttonLabel),
    },
  };
}

/** Normalize one calculator question (fixed slots, key order preserved). */
function mergePricingQuestion(
  raw: unknown,
  fallback: PricingQuestion
): PricingQuestion {
  if (!isRecord(raw)) return fallback;
  const get = (...names: string[]) => pick(raw, ...names);

  const mode = text(get("mode"), fallback.mode);
  const websiteTypes = toWebsiteTypes(get("websiteTypes", "website_types"), fallback);
  const productOptions = toProductOptions(
    get("productOptions", "product_options"),
    fallback
  );

  return {
    key: fallback.key,
    number: text(get("number"), fallback.number),
    title: text(get("title"), fallback.title),
    description: text(get("description"), fallback.description),
    yesPrice: num(get("yesPrice", "yes_price"), fallback.yesPrice),
    yesSub: text(get("yesSub", "yes_sub"), fallback.yesSub),
    mode: mode === "website" || mode === "contact" ? mode : "simple",
    websitePrompt: text(get("websitePrompt", "website_prompt"), fallback.websitePrompt),
    websiteTypes,
    staticNote: text(get("staticNote", "static_note"), fallback.staticNote),
    staticTitle: text(get("staticTitle", "static_title"), fallback.staticTitle),
    staticDescription: text(
      get("staticDescription", "static_description"),
      fallback.staticDescription
    ),
    staticLabel: text(get("staticLabel", "static_label"), fallback.staticLabel),
    productPrompt: text(get("productPrompt", "product_prompt"), fallback.productPrompt),
    productOptions,
  };
}

function toWebsiteTypes(
  raw: unknown,
  fallback: PricingQuestion
): [PricingWebsiteType, PricingWebsiteType] {
  const list = Array.isArray(raw)
    ? raw
    : isRecord(raw)
      ? [pick(raw, "static", "type1", "first"), pick(raw, "ecommerce", "type2", "second")]
      : [];
  return [0, 1].map((index) => {
    const base = fallback.websiteTypes[index];
    const item = isRecord(list[index]) ? list[index] : null;
    if (!item) return base;
    return {
      key: base.key,
      title: text(pick(item, "title"), base.title),
      description: text(pick(item, "description"), base.description),
      price: num(pick(item, "price"), base.price),
      priceLabel: text(pick(item, "priceLabel", "price_label"), base.priceLabel),
    };
  }) as [PricingWebsiteType, PricingWebsiteType];
}

function toProductOptions(
  raw: unknown,
  fallback: PricingQuestion
): [PricingProductOption, PricingProductOption] {
  const list = Array.isArray(raw)
    ? raw
    : isRecord(raw)
      ? [pick(raw, "option100", "option1", "first"), pick(raw, "option550", "option2", "second")]
      : [];
  return [0, 1].map((index) => {
    const base = fallback.productOptions[index];
    const item = isRecord(list[index]) ? list[index] : null;
    if (!item) return base;
    return {
      key: base.key,
      title: text(pick(item, "title"), base.title),
      description: text(pick(item, "description"), base.description),
      price: num(pick(item, "price"), base.price),
      priceLabel: text(pick(item, "priceLabel", "price_label"), base.priceLabel),
    };
  }) as [PricingProductOption, PricingProductOption];
}

/**
 * ACF stores the five calculator questions as one fixed group.
 * Order/keys always come from the fallback — ACF only fills copy/prices.
 * Accepts the documented q1…q5 slots plus friendlier aliases.
 */
function mergePricingQuestions(
  raw: unknown,
  fallback: PricingContent
): PricingQuestion[] {
  if (!isRecord(raw)) return fallback.design.questions;
  const aliases: Record<string, string[]> = {
    logo: ["logo", "q1", "q1_logo", "q1Logo"],
    branding: ["branding", "q2", "q2_branding", "q2Branding"],
    website: ["website", "q3", "q3_website", "q3Website"],
    redesign: ["redesign", "q4", "q4_redesign", "q4Redesign"],
    custom: ["custom", "q5", "q5_custom", "q5Custom"],
  };
  return fallback.design.questions.map((question) => {
    const slot = pick(raw, question.key, `q${question.key}`, ...(aliases[question.key] ?? []));
    return mergePricingQuestion(slot, question);
  });
}

function mergePricingPlans(
  raw: unknown,
  fallback: PricingContent
): [PricingPlan, PricingPlan, PricingPlan] {
  if (!isRecord(raw)) return fallback.development.plans;
  return fallback.development.plans.map((plan, index) => {
    const slot = pick(
      raw,
      `plan${index + 1}`,
      `plan${index + 1}Name`,
      `plan${index + 1}_name`
    );
    if (!isRecord(slot)) return plan;
    const features = lines(pick(slot, "features", "planFeatures", "plan_features"));
    return {
      name: text(pick(slot, "name", "title", "planName", "plan_name"), plan.name),
      description: text(
        pick(slot, "description", "planDescription", "plan_description"),
        plan.description
      ),
      price: num(pick(slot, "price", "planPrice", "plan_price"), plan.price),
      per: text(pick(slot, "per", "planPer", "plan_per"), plan.per),
      features: features.length ? features : plan.features,
      ctaLabel: text(
        pick(slot, "cta", "ctaLabel", "cta_label", "planCta", "plan_cta"),
        plan.ctaLabel
      ),
      popular: index === 1,
    };
  }) as [PricingPlan, PricingPlan, PricingPlan];
}

/* ------------------------------------------------------------------
   Fetch the Pricing page ACF and merge it over bundled defaults.
   ------------------------------------------------------------------ */

/**
 * WPGraphQL read — the query selects the canonical slots from the
 * wordpress/acf-field-group.json names (see pricing-acf-setup.md).
 * IMPORTANT: edit this selection only together with that JSON/schema probe.
 * Throws on any failure — callers fall back to defaults.
 */
async function fetchPricingAcfGraphql(): Promise<AcfPricingPayload> {
  const data = await fetchWordPress<{
    pageBy?: { pricingFields?: AcfPricingPayload | null } | null;
  }>(
    /* GraphQL */ `
      query PricingAcf($uri: String!) {
        pageBy(uri: $uri) {
          pricingFields {
            heroKicker
            heroTitle
            heroTitleAccent
            heroSubtitle
            designTabLabel
            designKicker
            designHeading
            designSubtitle
            designQuestions {
              q1Logo: q1_logo { ...PricingQuestionFields }
              q2Branding: q2_branding { ...PricingQuestionFields }
              q3Website: q3_website { ...PricingQuestionFields }
              q4Redesign: q4_redesign { ...PricingQuestionFields }
              q5Custom: q5_custom { ...PricingQuestionFields }
            }
            summaryLabel
            summaryTitle
            summaryEmpty
            totalLabel
            totalNote
            designCta
            devTabLabel
            devPopularLabel
            devKicker
            devHeading
            devSubtitle
            devPlans {
              plan1: plan_1 { ...PricingPlanFields }
              plan2: plan_2 { ...PricingPlanFields }
              plan3: plan_3 { ...PricingPlanFields }
            }
            ctaTitle
            ctaSubtitle
            ctaButton
          }
        }
      }

      fragment PricingQuestionFields on PricingQuestion {
        number
        title
        description
        yesPrice
        yesSub
        mode
        websitePrompt
        websiteTypes {
          static { title description price priceLabel }
          ecommerce { title description price priceLabel }
        }
        staticNote
        staticTitle
        staticDescription
        staticLabel
        productPrompt
        productOptions {
          option100: option_100 { title description price priceLabel }
          option550: option_550 { title description price priceLabel }
        }
      }

      fragment PricingPlanFields on PricingPlan {
        name
        description
        price
        per
        features
        cta
      }

    `,
    { uri: "/pricing/" }
  );
  if (!data.pageBy?.pricingFields) {
    throw new Error("Pricing ACF group is empty in WPGraphQL");
  }
  return data.pageBy.pricingFields;
}

/**
 * REST fallback (free ACF exposes fields under `acf` automatically).
 * Throws on any failure — callers fall back to defaults.
 */
async function fetchPricingAcfRest(): Promise<AcfPricingPayload> {
  const pages = await fetchRest<
    Array<{ acf?: AcfPricingPayload | false | null }>
  >("pages?slug=pricing&status=publish&_fields=acf");
  const acf = pages?.[0]?.acf;
  if (!acf) throw new Error("Pricing ACF group is empty in REST");
  return acf;
}

/**
 * Full Pricing content for /pricing. ACF first (GraphQL, then REST),
 * bundled defaults as the final fallback — the page never breaks.
 */
export async function getPricingContent(): Promise<PricingContent> {
  if (!WORDPRESS_ENABLED) return pricingFallback;

  let content: PricingContent = pricingFallback;

  // 1. Page-level ACF group (optional — full control incl. hero/cta).
  try {
    const acf =
      (await fetchPricingAcfGraphql().catch(() => fetchPricingAcfRest())) ?? null;
    content = mergePricingContent(acf, content);
  } catch {
    /* no page ACF — keep current content */
  }

  // 2. `pricing` CPT posts layer (each post = one calculator tab).
  try {
    const posts =
      (await fetchPricingPostsGraphql().catch(() => fetchPricingPostsRest())) ??
      [];
    if (posts.length > 0) {
      content = applyPricingPosts(content, posts);
    }
  } catch {
    /* no CPT data reachable — keep current content */
  }

  return content;
}

/* ------------------------------------------------------------------
   Pricing CPT posts layer.

   Every post of the `pricing` custom post type drives one calculator
   tab (see the Pricings screen in wp-admin):

     • post "Designing"   → design tab      (question prices)
     • post "Development" → development tab (SEO plan cards)

   ACF values are read from either backend and matched by *normalised*
   field name (lowercase, non-alphanumerics stripped), so ACF labels
   like "logo Design" (name `logo_design`) or "Website Re-design"
   (name `website_re-design`) all resolve without exact spelling.
   Missing fields simply keep the bundled defaults.
   ------------------------------------------------------------------ */

/** One `pricing` CPT post with its ACF values (keys normalised). */
export interface PricingPostData {
  id: number;
  slug: string;
  title: string;
  fields: Record<string, unknown>;
}

/** Lowercase + strip everything non-alphanumeric ("Website Re-design" → websiteredesign). */
function normKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** First defined value among candidate field names (normalised). */
function pickNorm(
  fields: Record<string, unknown>,
  ...candidates: string[]
): unknown {
  for (const candidate of candidates) {
    const value = fields[normKey(candidate)];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

/** REST `acf` objects come keyed by raw ACF names — normalise them. */
function fieldsFromAcf(raw: unknown): Record<string, unknown> {
  if (!isRecord(raw)) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    out[normKey(key)] = value;
  }
  return out;
}

function postTitle(value: unknown): string {
  if (typeof value === "string") return decodeEntities(stripHtml(value));
  if (isRecord(value) && typeof value.rendered === "string") {
    return decodeEntities(stripHtml(value.rendered));
  }
  return "";
}

/** REST fallback — works as soon as the ACF group has "Show in REST" on. */
async function fetchPricingPostsRest(): Promise<PricingPostData[]> {
  const posts = await fetchRest<
    Array<{
      id?: unknown;
      slug?: unknown;
      title?: unknown;
      acf?: unknown;
    }>
  >("pricing?per_page=100&status=publish&_fields=id,slug,title,acf");

  return (Array.isArray(posts) ? posts : [])
    .filter((post) => isRecord(post) && (post.id || post.slug))
    .map((post) => ({
      id: num(post.id, 0),
      slug: typeof post.slug === "string" ? post.slug : "",
      title: postTitle(post.title),
      fields: fieldsFromAcf(post.acf),
    }));
}

/** WPGraphQL root fields for the pricing CPT (plural first). */
const PRICING_ROOT_CANDIDATES = ["pricings", "pricingPosts", "pricing"];
/** Core WPGraphQL node fields we never treat as ACF values. */
const PRICING_FIELD_BLOCKLIST = new Set([
  "id", "databaseid", "slug", "title", "status", "date", "dategmt",
  "modified", "modifiedgmt", "guid", "link", "uri", "content", "excerpt",
  "authorid", "featuredimageid", "menuorder", "commentcount", "template",
  "desiredslug",
]);

async function fetchPricingPostsGraphql(): Promise<PricingPostData[]> {
  // 1. Does the WPGraphQL schema expose the CPT list at all?
  const schema = await fetchWordPress<{
    __schema: { queryType: { fields: Array<{ name: string }> } };
  }>("{ __schema { queryType { fields { name } } } }");
  const rootNames = schema.__schema.queryType.fields.map((f) => f.name);
  const listField = PRICING_ROOT_CANDIDATES.find((name) =>
    rootNames.includes(name)
  );
  if (!listField) {
    throw new Error("pricing CPT is not exposed over WPGraphQL");
  }

  // 2. Introspect the node type — request only core + scalar ACF fields.
  const nodeType = await fetchWordPress<{
    __type:
      | {
          fields: Array<{
            name: string;
            type: {
              kind: string;
              name?: string;
              ofType?: { kind: string; name?: string } | null;
            };
          }>;
        }
      | null;
  }>(
    `query { __type(name: "Pricing") { fields { name type { kind name ofType { kind name } } } } }`
  );
  const scalarSelections = ["databaseId", "slug", "title"];
  for (const field of nodeType.__type?.fields ?? []) {
    if (PRICING_FIELD_BLOCKLIST.has(normKey(field.name))) continue;
    const scalarName = field.type.name ?? field.type.ofType?.name;
    const isScalar =
      field.type.kind === "SCALAR" ||
      (field.type.kind === "NON_NULL" && field.type.ofType?.kind === "SCALAR");
    if (
      isScalar &&
      ["String", "Int", "Float", "Boolean", "ID"].includes(scalarName ?? "")
    ) {
      scalarSelections.push(field.name);
    }
  }

  // 3. Fetch the posts (title/slug + flat ACF scalars, e.g. logo_design).
  const data = await fetchWordPress<
    Record<string, { nodes?: Array<Record<string, unknown>> }>
  >(`query { ${listField}(first: 100) { nodes { ${scalarSelections.join(" ")} } } }`);
  const nodes = data[listField]?.nodes ?? [];
  return nodes
    .filter((node) => node && (node.slug || node.databaseId))
    .map((node) => {
      const fields: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(node)) {
        if (!PRICING_FIELD_BLOCKLIST.has(normKey(key))) {
          fields[normKey(key)] = value;
        }
      }
      return {
        id: num(node.databaseId, 0),
        slug: typeof node.slug === "string" ? node.slug : "",
        title: postTitle(node.title),
        fields,
      };
    });
}


/**
 * Overlay CPT post data on top of the current pricing content.
 * Prices/text are copied slot by slot — anything missing on the CMS
 * side keeps the value already present in `base`.
 */
export function applyPricingPosts(
  base: PricingContent,
  posts: PricingPostData[]
): PricingContent {
  const content: PricingContent = {
    ...base,
    design: { ...base.design, questions: [...base.design.questions] },
    development: { ...base.development },
  };

  const findPost = (match: string, exclude?: string) =>
    posts.find((post) => {
      const hay = normKey(`${post.slug} ${post.title}`);
      return hay.includes(match) && (!exclude || !hay.includes(exclude));
    });

  const designPost = findPost("design", "develop");
  const devPost = findPost("develop");

  /* ---------------- Designing post → design tab ---------------- */
  if (designPost) {
    const f = designPost.fields;
    const question = (key: PricingQuestion["key"]) =>
      content.design.questions.find((q) => q.key === key);

    content.design.tabLabel = text(designPost.title, content.design.tabLabel);
    content.design.kicker = text(pickNorm(f, "kicker"), content.design.kicker);
    content.design.heading = text(pickNorm(f, "heading"), content.design.heading);
    content.design.sub = text(
      pickNorm(f, "subtext", "subtitle", "sub"),
      content.design.sub
    );

    // Simple Yes/No prices (logo, branding, website redesign).
    const priceQuestions: Array<{
      key: PricingQuestion["key"];
      names: string[];
    }> = [
      // "design" covers the live CMS field (label "Logo Design", name `design`).
      { key: "logo", names: ["logo_design", "logo", "logodesign", "design"] },
      { key: "branding", names: ["branding", "branding_price"] },
      { key: "redesign", names: ["website_redesign", "redesign", "website_redesign_price"] },
    ];
    for (const { key, names } of priceQuestions) {
      const q = question(key);
      const raw = pickNorm(f, ...names);
      if (!q || raw === undefined) continue;
      const price = num(raw, 0);
      q.yesPrice = price;
      q.yesSub = price > 0 ? `+$${price}` : "$0";
    }

    // Custom Development: price > 0 turns it into a priced Yes/No,
    // otherwise it stays a "Contact Us" item.
    const customRaw = pickNorm(f, "custom_development", "custom_development_price", "custom");
    const custom = question("custom");
    if (custom && customRaw !== undefined) {
      const price = num(customRaw, 0);
      if (price > 0) {
        custom.mode = "simple";
        custom.yesPrice = price;
        custom.yesSub = `+$${price}`;
      } else {
        custom.mode = "contact";
        custom.yesPrice = 0;
        custom.yesSub = "Contact Us";
      }
    }

    // Optional website-flow prices (static / ecommerce / product slots).
    const websiteQ = question("website");
    if (websiteQ) {
      const staticPrice = pickNorm(f, "static_website", "static_website_price", "staticwebsiteprice");
      const ecommercePrice = pickNorm(f, "ecommerce_website", "ecommerce_website_price", "ecommerceprice");
      const product100 = pickNorm(f, "products_100", "products100", "up_100_products");
      const product550 = pickNorm(f, "products_550", "products550", "up_550_products");

      websiteQ.websiteTypes = websiteQ.websiteTypes.map((type, index) => {
        const raw = index === 0 ? staticPrice : ecommercePrice;
        if (raw === undefined) return type;
        const price = num(raw, type.price);
        return { ...type, price, priceLabel: `$${price}` };
      }) as [PricingWebsiteType, PricingWebsiteType];
      websiteQ.productOptions = websiteQ.productOptions.map((option, index) => {
        const raw = index === 0 ? product100 : product550;
        if (raw === undefined) return option;
        const price = num(raw, option.price);
        return { ...option, price, priceLabel: `+$${price}` };
      }) as [PricingProductOption, PricingProductOption];
    }

    // Optional per-question copy (e.g. fields "Logo Design Title").
    for (const q of content.design.questions) {
      q.title = text(pickNorm(f, `${q.key}_title`, `${q.key}_question`), q.title);
      q.description = text(
        pickNorm(f, `${q.key}_description`, `${q.key}_desc`),
        q.description
      );
      if (q.mode === "website") {
        q.websitePrompt = text(pickNorm(f, "website_prompt"), q.websitePrompt);
        q.staticNote = text(pickNorm(f, "static_note"), q.staticNote);
        q.staticTitle = text(pickNorm(f, "static_title"), q.staticTitle);
        q.staticDescription = text(
          pickNorm(f, "static_description"),
          q.staticDescription
        );
        q.productPrompt = text(pickNorm(f, "product_prompt"), q.productPrompt);
      }
    }

    // Summary texts.
    content.design.summaryLabel = text(pickNorm(f, "summary_label"), content.design.summaryLabel);
    content.design.summaryTitle = text(pickNorm(f, "summary_title"), content.design.summaryTitle);
    content.design.emptyText = text(pickNorm(f, "empty_text", "summary_empty"), content.design.emptyText);
    content.design.totalLabel = text(pickNorm(f, "total_label"), content.design.totalLabel);
    content.design.totalNote = text(pickNorm(f, "total_note"), content.design.totalNote);
    content.design.ctaLabel = text(pickNorm(f, "cta_label", "cta_text"), content.design.ctaLabel);
  }


  /* ---------------- Development post → development tab ---------------- */
  if (devPost) {
    const f = devPost.fields;
    content.development.tabLabel = text(devPost.title, content.development.tabLabel);
    content.development.kicker = text(pickNorm(f, "kicker"), content.development.kicker);
    content.development.heading = text(pickNorm(f, "heading"), content.development.heading);
    content.development.sub = text(pickNorm(f, "subtext", "subtitle", "sub"), content.development.sub);

    const slotPrefixes: string[][] = [
      ["starter", "seo_starter", "plan_1", "plan1", "starter_plan"],
      ["growth", "seo_growth", "plan_2", "plan2", "growth_plan"],
      ["premium", "seo_premium", "plan_3", "plan3", "premium_plan"],
    ];
    content.development.plans = content.development.plans.map((plan, index) => {
      const prefixes = slotPrefixes[index] ?? [];
      const get = (...suffixes: string[]) =>
        pickNorm(f, ...prefixes.flatMap((p) => suffixes.map((s) => `${p}_${s}`)));
      const name = text(get("title", "name", "heading"), "");
      const priceRaw = get("price");
      const features = lines(get("features", "includes"));
      const hasData = Boolean(name) || priceRaw !== undefined || features.length > 0;
      if (!hasData) return plan; // nothing in CMS for this slot — keep base

      return {
        ...plan,
        name: name || plan.name,
        description: text(get("description", "desc", "text"), plan.description),
        price: priceRaw !== undefined ? num(priceRaw, plan.price) : plan.price,
        per: text(get("per", "period"), plan.per),
        features: features.length > 0 ? features : plan.features,
        ctaLabel: text(get("cta", "cta_label", "button"), plan.ctaLabel),
      };
    }) as [PricingPlan, PricingPlan, PricingPlan];
  }

  return content;
}