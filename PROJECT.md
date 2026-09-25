# CodeXmattriX — Complete Project Documentation

> **One file for the whole project** — architecture, stack, pages, data flow,
> pricing calculator, WordPress proxy, commands, CI/CD, conventions and
> pending work. Last updated: 2026-09-23 (session: dynamic pricing section).

---

## 1. Project Overview

A production **Headless WordPress** website. **100% of the frontend lives in
Next.js** — components, Tailwind CSS, animations, layouts, designs **and
content defaults**. WordPress is only the **CMS/backend**: it registers
page URLs (blank pages), stores pricing ACF data, and serves GraphQL/REST
APIs. Visitors always see Next.js; the WP theme never renders.

| | |
| --- | --- |
| **Brand** | CodeXmattriX — "Envision · Design · Code" |
| **Business** | Web/app/software development agency (healthcare, CBD, US brands) |
| **Frontend** | Next.js on Vercel → `codexmattrix.com` |
| **CMS** | WordPress (Hostinger) → `https://cms.codexmattrix.com/` |
| **Bridge** | WPGraphQL + REST (fetched by Next.js) **and** PHP reverse proxy (browser hits WP domain, gets Next.js HTML) |
| **Repo** | `https://github.com/Mehak9011/my-next-app.git` · branch `main` |

**The one rule:** every WordPress page is created **blank**. Its *slug* is the
URL (`about` → `/about/`). Next.js renders that URL. WP only serves
`/wp-admin`, `/wp-login.php`, `/graphql`, `/wp-json`, `/wp-content` (media).

---

## 2. Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | **Next.js 16.3.4** (App Router, Turbopack) |
| UI | **React 19.2.8** |
| Language | **TypeScript ~5** (`tsc --noEmit` in CI) |
| Styling | **Tailwind CSS v4** (via `@tailwindcss/postcss`) + `app/globals.css` design tokens |
| Linting | ESLint 9 + `eslint-config-next` |
| CMS | WordPress + **WPGraphQL** + free **ACF** (pricing only) |
| Hosting | **Vercel** (Next.js) + **Hostinger** (WordPress/LiteSpeed, `.htaccess`) |
| CI | GitHub Actions (`.github/workflows/ci.yml`, Node 22) |
| Runtime deps | **Only** `next`, `react`, `react-dom` — no UI/animation libs; animations are hand-rolled CSS/JS |

## 3. Architecture — two directions of traffic

```
① DATA (server-side, during render / ISR)
   Next.js (Vercel)  ──WPGraphQL POST──►  cms.codexmattrix.com/graphql
                     ──REST GET──►       cms.codexmattrix.com/wp-json/wp/v2/…
   → registry.ts  resolves which page URLs exist in WordPress
   → wordpress.ts merges ACF pricing values over the bundled defaults
   → CMS unreachable? bundled defaults render — the page never breaks

② VISITORS (browser → CMS domain, URL bar unchanged)
   Browser ── /about/ ──► cms.codexmattrix.com
                             │  .htaccess (Variant 1)
                             ▼
                        proxy.php   (v3, lives in public_html/)
                             │  requires ?_cmx=1, fetches the SAME path
                             ▼
                my-next-app-phi-flax.vercel.app/about
                             │
                             ▼
                Next.js renders app/about/page.tsx
                (the WordPress theme NEVER renders a public page)
```

**Why this wiring:** the client domain must show the Next.js design, while
`/wp-admin`, `/wp-login.php`, `/graphql` and `/wp-json` stay on WordPress for
editing and the API. A proxy keeps the URL bar on the CMS domain (no redirect).

**Rules that make it work** (full file: `wordpress/htaccess-frontend-proxy.txt`,
troubleshooting: `wordpress/README-wordpress-setup.md`):

| # | Rule | Why it matters |
| --- | --- | --- |
| 1 | `RewriteRule ^$ /proxy.php?_cmx=1 [L,QSA]` **first** | `/` is a real directory — without this the homepage falls through and the WP theme renders |
| 2 | `wp-json` → `index.php?rest_route=…`, `graphql` rules **before** the proxy | fixes JSON 404s and "pages don't save" (the editor's save hits `/wp-json/wp/v2/…`) |
| 3 | `-d` passthrough excludes root (`%{REQUEST_URI} !^/(\?|$)`) | real dirs (uploads) still served by WP, root always proxied |
| 4 | everything else → `proxy.php` | all public URLs become Next.js |
| 5 | custom rules stay **above** `# BEGIN WordPress` | a permalink save only regenerates the block below |
| 6 | purge Hostinger/LiteSpeed cache after edits | stale page cache otherwise keeps serving the old HTML |

**proxy.php v3 highlights** (`wordpress/proxy.php`):

- `CURLOPT_HEADER OFF` + `HEADERFUNCTION` → HTTP/2/gzip safe; v1 leaked
  `HTTP/2 200 …` text into the body.
- `FOLLOWLOCATION OFF` → Vercel's `308 /about/ → /about` is re-emitted with
  `Location` rewritten to the CMS host, and the browser follows on the CMS.
- Guard: only requests with `?_cmx=1` are accepted (no open proxy).
- `$CMX_NEXT_ORIGIN` constant at the top — change it if the Vercel URL changes.
- Sends `X-CMX-Proxy: codexmattrix-php-front-proxy v3`, which
  `scripts/check-cms-proxy.mjs` asserts on.

## 4. Repository structure

```
my-next-app/
├── app/                                 # 100% of the frontend
│   ├── layout.tsx                       # Root shell: fonts, metadata, icons, Header/Footer/FAB/cursor
│   ├── globals.css                      # Tailwind v4 tokens + ALL component classes (single stylesheet)
│   ├── page.tsx                         # HOME (Hero, Stats, Services, Industries, Testimonials, FAQ, CTA, Clients)
│   ├── about/page.tsx                   # ComingSoonPage (full design parked in components/about/*)
│   ├── services/page.tsx                # ComingSoonPage
│   ├── faq/page.tsx                     # ComingSoonPage
│   ├── process/page.tsx                 # ComingSoonPage
│   ├── case-studies/page.tsx            # ComingSoonPage
│   ├── contact/page.tsx                 # LIVE: hero + 4-step process + details + form + CTA
│   ├── pricing/page.tsx                 # LIVE: hero + 3 tabs + CTA (ACF-driven)
│   ├── [...slug]/page.tsx               # Catch-all for WordPress-registered URLs (else real 404)
│   ├── components/
│   │   ├── home/                        # Hero, HeroBackground, RotatingWord, ScrollCue, ShotStrip,
│   │   │                                # Stats, Services, Industries, Testimonials, FAQ, FinalCTA, Clients
│   │   ├── about/                       # AboutHero, Story, Mission, Values, Team, AboutCta (parked)
│   │   ├── contact/                     # ContactHero, ContactProcess, ContactDetails, ContactForm, ContactCta
│   │   ├── pricing/                     # PricingHero, PricingTabs, DesignCalculator, DevelopmentPlans, PricingCta
│   │   ├── layout/                      # Header, Footer, WhatsAppFab, CustomCursor, IframeHeightReporter
│   │   ├── ui/                          # Container, Kicker, SectionHeader, Reveal, CountUp, TiltCard, ScrollProgress
│   │   ├── pages/RegisteredPage.tsx     # Shared template for WordPress-registered pages
│   │   └── ComingSoonPage.tsx           # Shared "Coming Soon" view
│   └── lib/
│       ├── site.ts                      # Business constants + navLinks (single source of truth)
│       ├── registry.ts                  # WordPress page registry (URL ↔ slug bridge, 60 s cache)
│       ├── wordpress.ts                 # WPGraphQL/REST clients + pricing data layer + merges
│       └── content/
│           ├── types.ts                 # Typed shapes for every page's content
│           ├── defaults.ts              # Home page bundled content
│           ├── about.ts                 # About page bundled content (parked)
│           └── pricing.ts               # Pricing defaults + emptyQuestionSlots + contact href
├── wordpress/                           # Everything to upload/apply on the WP host
│   ├── proxy.php                        # CHOSEN: v3 PHP reverse proxy (Hostinger-safe)
│   ├── htaccess-frontend-proxy.txt      # CHOSEN: Variant 1 proxy rules / Variant 2 mod_proxy
│   ├── htaccess-frontend-redirect.txt   # ALT: 301 public URLs → live Next.js domain
│   ├── cloudflare-worker.js             # ALT: Cloudflare Worker equivalent of the proxy
│   ├── pricing-acf-setup.md             # ACF field map (Option A = CPT posts, Option B = page group)
│   ├── README-wordpress-setup.md        # WP one-time setup + troubleshooting table
│   └── acf-field-group.json             # Importable ACF group (if present)
├── scripts/                             # Node .mjs utilities — run directly, no build step
│   ├── verify-wordpress.mjs             # CMS health: registry + every route
│   ├── check-cms-proxy.mjs              # Proxy live? (X-CMX-Proxy header + Next.js body markers)
│   ├── probe-graphql.mjs, probe-slug.mjs          # GraphQL debugging (by id / by slug)
│   ├── find-json-errors.mjs, pinpoint-json.mjs    # Locate malformed JSON from WP
│   ├── verify-acf.mjs, upgrade-acf-graphql.mjs    # ACF JSON + graphql_field_name helpers
│   └── make-favicons.mjs                # Regenerate favicon.ico / apple-icon.png
├── public/images/                       # Bundled brand + placeholder artwork (SVG/WebP)
├── .github/workflows/ci.yml             # CI: npm ci → typecheck → lint → build (WP off)
├── next.config.ts · vercel.json · postcss.config.mjs · eslint.config.mjs · tsconfig.json
├── .env.example / .env.local            # Env template / real local values (gitignored)
├── README.md                            # Quick start, pages, structure, deploy
├── HEADLESS-WORDPRESS-GUIDE.md          # Long-form setup guide (§1–14, all 4 hand-off options)
└── PROJECT.md                           # ← this file
```

## 5. Pages & routes

| Route | File | State | Content source |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | ✅ Live | `defaultHomeContent` (`lib/content/defaults.ts`) — `getHomeContent()` returns it directly |
| `/pricing` | `app/pricing/page.tsx` | ✅ Live | WordPress ACF (page group + `pricing` CPT posts) → fallback `lib/content/pricing.ts` |
| `/contact` | `app/contact/page.tsx` | ✅ Live | Copy hard-coded in the page + `site.ts`; form is client-side only |
| `/about` | `app/about/page.tsx` | ⏳ Coming Soon | Full design parked in `components/about/*` + `lib/content/about.ts` |
| `/services` | `app/services/page.tsx` | ⏳ Coming Soon | Design parked (old version in git `6b5a0ef`) |
| `/faq`, `/process`, `/case-studies` | `app/*/page.tsx` | ⏳ Coming Soon | — |
| any other URL | `app/[...slug]/page.tsx` | ✅ Live | WordPress registry → title, or a real 404 |

**Catch-all behaviour** (the WordPress "URL registry" contract):

| Situation | Result |
| --- | --- |
| WordPress up, slug published | renders the registered page title in `RegisteredPage` |
| WordPress up, slug NOT published | `notFound()` → real 404 |
| WordPress down / disabled | renders anyway from the humanised slug (no URL ever breaks) |

Every WordPress page is created **blank** (no page builder, no content) — the
slug alone defines the URL, the title is the metadata hint.

---

## 6. Data layer

### 6.1 `lib/site.ts` — business constants
`name`, `tagline`, `email` (`cmx@codexmattrix.com`), two phone numbers,
India + US addresses, WhatsApp number/URL (env-overridable), `links` map and
`navLinks` — the primary menu: **exactly the 6 entries the footer's "Company"
column renders** (About, Services, Process, Case Studies, Pricing, Contact), so
the header and footer menus can never drift apart. The desktop row shows from
`lg` (≥1024px, reduced gap below `xl`) because six labels plus the logo and the
"Book a Call" button need that width; under `lg` the hamburger menu renders the
same list.

### 6.2 `lib/wordpress.ts` — CMS clients + content merges
- Constants: `WORDPRESS_ENABLED` (`process.env.WORDPRESS_ENABLED === "true"`),
  `GRAPHQL_URL`, `REST_URL`, `TIMEOUT_MS` (default 8000), `REVALIDATE_SECONDS = 60`.
- `request()` — `fetch` with `next: { revalidate: 60 }` + timeout race.
- `fetchWordPress<T>(query, variables)` — POST GraphQL; throws on `errors[]`.
- `fetchRest<T>(path)` — GET `wp-json`; auto-prefixes `wp/v2/` when the caller
  did not pass a namespace.
- Helpers: `stripHtml`, `decodeEntities`, `text`, `num`, `lines`, `pick`,
  `pickNorm`, `normKey`, `isRecord`.
- `getHomeContent()` → bundled defaults (WordPress not involved).
- `mergePricingContent(payload, fallback)` → page-level ACF over defaults.
- `applyPricingPosts(base, posts)` → `pricing` CPT posts over that result.
- `getPricingContent()` → **read order**: page-ACF → CPT posts → bundled
  defaults; every step is try/catch so a failure just keeps the previous value.

**Every layer is a "slot merge", never a replacement** — a missing field keeps
the value underneath it, so the page can never render empty.

### 6.3 `lib/registry.ts` — the URL bridge
- `REGISTRY_QUERY` → `pages(first: 100) { nodes { id slug uri title } }`.
- `PAGE_QUERY` → `pageBy(uri: $uri)` (note: `uri` is a **String**, not ID).
- `getPageRegistry()` — in-memory promise cache for the 60 s ISR window,
  never throws (returns `[]` on failure).
- `lookupPageUri(path)` — tries `/{path}/`, `/{path}`, `/index.php/{path}/`,
  `/index.php/{path}` (the CMS has used plain permalinks), cached per path.
- `PageLookup = { ok: true, page | null } | { ok: false }` — distinguishes
  "not a page" (404) from "CMS unreachable" (render anyway).
- `isRegisteredSlug(slug)` — true when the slug exists in the registry.

### 6.4 `lib/content/*` — Next.js-owned content
| File | Owns |
| --- | --- |
| `types.ts` | `HomeContent`, `AboutContent`, `PricingContent` (+ `PricingQuestion`, `PricingPlan`, `PricingDesignTab`, `PricingDevTab`, `PricingWebDevTab`) |
| `defaults.ts` | Home page copy, stats, services, industries, testimonials, FAQs, clients |
| `about.ts` | About page copy (parked with the Coming Soon pages) |
| `pricing.ts` | `defaultPricingContent`, `emptyQuestionSlots`, `pricingContactHref` |

Components consume **only these interfaces** — they never know or care whether
the value came from WordPress or from the bundled defaults.

## 7. Pricing system (the most customised page)

### 7.1 Three tabs

| # | Tab key | Label source | Panel |
| --- | --- | --- | --- |
| 1 | `design` | `content.design.tabLabel` (WP post title "Designing") | `DesignCalculator` — Yes/No questions + sticky summary |
| 2 | `webdev` | `content.webdev.tabLabel` (WP post title "Development") | `DesignCalculator` re-used with the webdev content, or a heading + quote-CTA empty state when `cmsReady === false` |
| 3 | `development` | `content.development.tabLabel` (SEO post title) | `DevelopmentPlans` — 3 plan cards (Starter / Growth / Popular / Premium) |

- `PricingTabs.tsx` is a client component (`useState<TabKey>`, default `design`),
  renders buttons from an array (`design → webdev → development`), so the middle
  tab is always visible (no gating anymore) and shows either the calculator or
  the empty state.
- The **middle tab inherits the tab label from the WordPress post title** —
  rename the post and the button label changes (60 s ISR).

### 7.2 Sequential Yes/No calculator (`DesignCalculator.tsx`)

Client component, props: `design: Omit<PricingDesignTab, "id">` and `contactHref`.
State: `selections` (priced items), `answers` (explicit `"yes"`/`"no"` per key),
`showWebsite`, `websiteType`, `productKey`.

**Reveal rule** — a question renders only when *every earlier question is
answered*:

```ts
const revealed = design.questions.map((_, index) =>
  design.questions.slice(0, index).every((earlier) => isAnswered(earlier))
);

function isAnswered(q) {
  if (q.mode === "website") {                    // nested flow
    if (answers[q.key] === "no") return true;
    if (answers[q.key] !== "yes") return false;
    if (!websiteType) return false;              // must pick Static / E-Commerce
    return websiteType !== "ecommerce" || productKey !== null;  // e-com → product slot
  }
  return answers[q.key] !== undefined;           // "simple" / "contact": Yes or No
}
```

- Unanswered questions show **no** selected button (fixes the old "No looked
  pre-selected" bug); answered ones keep their state so the user can scroll back
  and change an answer.
- Question modes: `"simple"` (Yes adds `yesPrice`), `"website"` (Yes opens the
  nested Static / E-Commerce flow; E-Commerce then asks for a product slot),
  `"contact"` (Yes shows "Contact Us" and adds nothing to the total).
- Summary sidebar: rows = selections with `price > 0`, `Estimated Total`, a
  note, and the CTA (`design.ctaLabel` → `/contact`).
- Reveal animation + `prefers-reduced-motion` guard live in `globals.css`
  (`.pricing-question` keyframes).

### 7.3 How a question's text is used
`cleanTitle()` strips `Do you need (a|an)?` and the trailing `?` so summary rows
read "Logo Design" instead of the full question.

### 7.4 WordPress ACF mapping (Option A — `pricing` CPT posts, current live setup)

Each post of the `Pricing` post type drives one tab; **the post title becomes
the tab label**. Post lookup is **exact-slug first**:
`development | development-plans | web-development | webdev` → middle tab; the
SEO tab only matches `seo`/`digitalmarketing` posts; the design tab matches
`design` (excluding `develop`). This ordering prevents the middle tab from
stealing another tab's data.

| Post (live) | Slug | Fields read | Tab |
| --- | --- | --- | --- |
| **Designing** (id 46) | `designing` | `design`, `branding`, `website_re-design`, `custom_development`, optional `static_website`, `ecommerce_website`, `products_100`, `products_550`, optional `<key>_title` / `<key>_description`, optional `summary_label`, `summary_title`, `empty_text`, `total_label`, `total_note`, `cta_label` | 1 · Designing |
| **Development** (id 70) | `development` | **dynamic** — see below | 2 · Development |
| *any SEO-title post* | — | plan slots `starter_* / growth_* / premium_*` (also `seo_starter…`, `plan_1…`); per slot `_title`/`_name`, `_price`, `_features` (one per line), `_description`, `_per`, `_cta` | 3 · Digital Marketing & SEO |

**Field matching is normalised** (`normKey`: lowercase, non-alphanumerics
stripped), so the ACF auto-names `logo_design` (label "Logo Design") and
`website_re-design` (label "Website Re-design") both resolve — exact spelling is
not required.

**Designing tab rules**
- `design` → Q01 Yes price, `branding` → Q02, `website_re-design` → Q04.
- `custom_development` → Q05: price `> 0` = priced Yes/No, `0`/empty = "Contact Us".
- Website-flow prices (`static_website`, `ecommerce_website`, `products_100`,
  `products_550`) are optional — missing keeps the bundled values.

**Development tab rules (fully dynamic — no code changes needed)**

> Every **priced ACF field** on the Development post automatically becomes one
> Yes/No question. The question title is the field name title-cased
> (`new_website_development` → **"Do you need New Website Development?"**) with
> the auto description "Add New Website Development to your project.", the value
> is the price (`+$500`), and the question number is assigned in field order
> (`01`, `02`, …).

- Empty or non-numeric field → **hidden** (no placeholder questions ever).
- `SKIP_DYNAMIC` list (never become questions): `design`, `branding`,
  `websiteredesign`, `kicker`, `heading`, `subtext`/`subtitle`/`sub`,
  `ctalabel`/`ctatext`, `totallabel`, `totalnote`, `popularlabel`,
  `summarylabel`, `summarytitle`, `emptytext`, `tablabel`.
- `kicker` / `heading` / `subtext` override the tab's copy;
  the post title overrides the tab label.
- Zero priced fields → `cmsReady = false` → the tab shows the heading + a
  "Request a Custom Quote →" button instead of questions.
- ACF group must have **Show in REST API = Yes** (the merge reads REST/GraphQL
  raw field names — that is what makes the tab work without a code change).

**Live values (verified 2026-09-23 via `/wp-json/wp/v2/pricing`)**

| Post | Field | Value |
| --- | --- | --- |
| Designing (46) | `design` | 500 |
| Designing (46) | `branding` | 1000 |
| Designing (46) | `website_re-design` | 100 |
| Development (70) | `new_website_development` | 500 |
| Development (70) | `custom_functionality` | 300 |
| Development (70) | `wordpress_website` | 200 |
| Development (70) | `shopify_store` | 300 |

So the middle tab currently renders 4 questions: New Website Development
+$500, Custom Functionality +$300, WordPress Website +$200, Shopify Store +$300.

**Recipe — add a question:** ACF → Development group → add a **Number** field
(e.g. `mobile_app` = 1500) → publish → within 60 s
"Do you need Mobile App?" +$1500 appears. No deploy, no code change.

**Recipe — hide a question:** clear the field's value (or set it to `0` …
`0` renders "$0", empty hides it entirely).

**Option B (documented, not in use):** the `pricingFields` ACF group on the
Pricing *page* (`designing` + `development` sub-groups, `hero_*`, `cta_*`) —
the older full-control layout. It merges **under** the CPT posts, so it can be
used for hero/tab copy while posts keep driving prices. Field-by-field map:
`wordpress/pricing-acf-setup.md` §1–3.

## 8. WordPress side

### 8.1 One-time configuration (wp-admin)
1. **Permalinks** → Settings → Permalinks → **Post name**.
2. **Plugins** → install **WPGraphQL** (required) + free **ACF** (pricing data
   only). No page builder, no Elementor.
3. **Pages** → create one **blank** page per Next.js route: `Home`, `About`,
   `Contact`, `Services`, `Pricing`, `FAQ`, `Process`, `Case Studies` — slugs
   must match the route names. Leave the body empty; the design is in Next.js.
4. **Reading** → *Your homepage displays* → **A static page** → **Home**
   (this only defines `/` in the GraphQL registry).
5. **Frontend hand-off (chosen method)** — upload `wordpress/proxy.php` (**v3**)
   to `public_html/` (overwrite older versions), replace the root `.htaccess`
   with **Variant 1** of `wordpress/htaccess-frontend-proxy.txt`, then
   **purge all cache** (Hostinger hPanel → Cache → Purge All, plus the LiteSpeed
   plugin if active).
6. **Pricing data** — create the `pricing` CPT posts and fill the ACF fields
   (§7.4 / `wordpress/pricing-acf-setup.md`).
7. **Test** — `/`, `/about/`, `/contact/`, `/pricing` show the Next.js design;
   `/wp-admin`, `/wp-login.php`, `/graphql`, `/wp-json/wp/v2/types` keep working.

### 8.2 Hand-off options in the repo

| File | Approach | When to use |
| --- | --- | --- |
| `proxy.php` + `htaccess-frontend-proxy.txt` (Variant 1) | **CHOSEN** — PHP reverse proxy, URL bar keeps the CMS domain | Any shared host incl. Hostinger; no Cloudflare/mod_proxy needed |
| `htaccess-frontend-proxy.txt` (Variant 2, commented) | Apache `mod_proxy` | Hosts where `mod_proxy` is enabled |
| `htaccess-frontend-redirect.txt` | 301 redirect to the live Next.js domain | When the URL bar may change |
| `cloudflare-worker.js` | Cloudflare Worker proxy | When the `cms` subdomain is on Cloudflare |

### 8.3 Troubleshooting (mirrors `wordpress/README-wordpress-setup.md`)

| Symptom | Cause | Fix |
| --- | --- | --- |
| `/` shows the WP theme ("Cms / Home" + logo) but `/about/` shows Next.js | a `-d` passthrough swallowed the site root (it *is* a real directory) and/or the `^$` rule is missing | use Variant 1 (its `^$` rule is first and the `-d` rule excludes `/`), then purge cache |
| `/wp-json/` → 404 (or JSON 404 inside the editor) | `rest_route` rules missing or placed **after** the proxy rule | keep both `wp-json` rules before the proxy rule |
| Pages don't save in wp-admin | same REST problem — the editor's save calls `/wp-json/wp/v2/...` | same fix; verify `curl https://<cms>/wp-json/wp/v2/types` returns JSON |
| Old v1 proxy output ("HTTP/2 200 …" text at the top of pages) | `public_html/proxy.php` is still v1 | overwrite with `wordpress/proxy.php` (v3) |
| Rules look right but nothing changes | Hostinger/LiteSpeed page cache | hPanel → Cache → **Purge All** |
| Server returns 500 | `.htaccess` syntax error | re-check against Variant 1 character-by-character; custom rules must stay **above** `# BEGIN WordPress` |
| Development tab shows only the quote CTA | no priced field reached the app (empty values, missing "Show in REST", or wrong slug) | clear-value → hidden by design; else set values + enable Show in REST (60 s) |

### 8.4 Verify commands
```bash
node scripts/verify-wordpress.mjs                       # registry + routes
node scripts/check-cms-proxy.mjs https://cms.codexmattrix.com   # proxy live?
```
`check-cms-proxy.mjs` expects the `X-CMX-Proxy: codexmattrix-php-front-proxy v3`
header and Next.js markers in the body for `/` and a sub-route.

## 9. Design system, CSS & animations

- **One stylesheet:** `app/globals.css` (~40 KB) — Tailwind v4 `@theme` tokens
  plus every component class. There is **no CSS-in-JS and no UI library**.
- **Fonts:** `next/font/google` self-hosted in `app/layout.tsx` —
  **Manrope** (`--font-manrope` → `--font-sans`) for body text,
  **Archivo** (`--font-archivo` → `--font-display`) for display headings.
- **Colour tokens** (`@theme`):

  | Token | Value | Use |
  | --- | --- | --- |
  | `--color-ink` | `#14181d` | near-black body text |
  | `--color-navy` | `#1a2530` | presence cards |
  | `--color-crimson` / `--color-crimson-light` | `#e63329` / `#ee3e3e` | primary brand red + gradient end |
  | `--color-panel` | `#f6f5f3` | soft section background |
  | `--color-slate` / `--color-slate-light` | `#5b6570` / `#9aa3ac` | secondary / muted text |
  | `--color-line` | `#e9e7e2` | hairline borders |
  | `--color-night` / `--color-mist` / `--color-dusk` | `#0f1620` / `#c7cdd3` / `#6b7580` | footer background / body / fine print |
  | `--color-wa` | `#25d366` | WhatsApp green |

- **Reusable primitives** (`components/ui/`): `Container` (1180px shell),
  `Kicker`, `SectionHeader` (accepts `kickerCentered`; centres both the text and
  the `max-width` box so headings line up with their kicker and sub-copy),
  `Reveal` (scroll-in), `CountUp` (stat numbers), `TiltCard` (pointer tilt),
  `ScrollProgress` (top bar).
- **Layout components:** `Header` (sticky nav + mobile menu), `Footer`,
  `WhatsAppFab`, `CustomCursor`, `IframeHeightReporter` (posts the iframe height
  so an embedding parent can resize).
- **Animation inventory:** `cursor-spin`, `shotscroll`, `fmscroll` (marquees),
  `riseIn`, `gridDrift`, `blobFloat`, `pulseRing`, `gradientShift`, `wordRise`,
  `rotatorSwap`, `scrollDot`, `ctaGlow`, `pricing-question-in`.
- **Accessibility / performance rules** (documented in `README.md`):
  - `prefers-reduced-motion: reduce` disables **every** animation (guards at
    `globals.css:1166` and `:1729`).
  - The custom cursor runs only on `(hover: hover) and (pointer: fine)` devices;
    touch/keyboard/JS-off visitors keep the native pointer and text fields keep
    the native caret. The native cursor is hidden only via `has-custom-cursor`,
    which exists only while the cursor runs.
  - Only `transform` / `opacity` / `clip-path` are animated, and follow loops
    (cursor, tilt, parallax, progress) write to the DOM inside
    `requestAnimationFrame` — no React re-renders per frame.
- **Icons:** `public/images/favicon.webp` (declared in metadata),
  `app/favicon.ico`, `app/apple-icon.png` — regenerate with
  `node scripts/make-favicons.mjs [source]`.
- `pricing-block.css` in the repo root is a **standalone artifact** (not imported
  anywhere) — the live pricing styles are in `globals.css`.
- `next.config.ts`: `poweredByHeader: false` + `images.remotePatterns` for
  `images.unsplash.com`, `cms.codexmattrix.com`, `**.codexmattrix.com`, `**.wp.com`.
- `vercel.json`: framework preset + security headers
  (`X-Content-Type-Options: nosniff`, CSP `frame-ancestors 'self' https://cms.codexmattrix.com`,
  `Referrer-Policy`, `Permissions-Policy`) and a 1-year immutable cache for
  `/_next/static/*`.

## 10. Environment, commands & scripts

### 10.1 Environment variables

| Variable | Purpose | Local value |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_NAME` | brand name in the UI | `CodeXmattriX` |
| `NEXT_PUBLIC_SITE_URL` | canonical URL for metadata/SEO | `http://localhost:3000` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp FAB + contact form | `917832820005` |
| `WORDPRESS_ENABLED` | master switch for the CMS registry | `true` |
| `WORDPRESS_GRAPHQL_URL` | WPGraphQL endpoint | `https://cms.codexmattrix.com/graphql` |
| `WORDPRESS_REST_URL` | REST base | `https://cms.codexmattrix.com/wp-json` |
| `WORDPRESS_TIMEOUT_MS` | CMS request timeout | `8000` |

`.env.local` is gitignored; `.env.example` documents every variable. Vercel →
Project → Settings → Environment Variables for production, then redeploy.

### 10.2 Commands

```bash
npm install
copy .env.example .env.local     # then fill real values
npm run dev                      # http://localhost:3000
npm run typecheck                # tsc --noEmit
npm run lint                     # eslint
npm run build                    # production build (12 routes)
npm start                        # serve the production build

node scripts/verify-wordpress.mjs
node scripts/check-cms-proxy.mjs https://cms.codexmattrix.com
node scripts/make-favicons.mjs
```

Runtime dependencies are **only** `next`, `react`, `react-dom` — dev deps are
Tailwind v4 (`@tailwindcss/postcss`), TypeScript, ESLint.

## 11. History & status

### 11.1 Git milestones (`main`)

| Commit | Date | What |
| --- | --- | --- |
| `0388c98` | 2026-09-15 | verify all Next.js routes in the WordPress registry |
| `d567784`, `20ca264` | 2026-09-15 | CMS reverse-proxy wiring (Cloudflare → Vercel) |
| `a30b180`, `6d560bd`, `cf4b41c` | 2026-09-15 | iframe height reporter + allow embedding inside the CMS |
| `6b5a0ef` | 2026-09-15 | full-headless PHP reverse proxy + GitHub Actions CI |
| `d540f68` | 2026-09-18 | home uses reference photos, responsive breakpoints |
| `d98c7bb` | 2026-09-18 | Coming Soon on inner pages, every route kept |
| `7b211e0` | 2026-09-22 | pricing calculator + contact redesign, animations, brand favicons |
| `73e46d0` | 2026-09-22 | contact kicker alignment |
| `c45dc8a` | 2026-09-22 | proxy v2 (header-safe) + CMS proxy status checker (current HEAD) |

### 11.2 Uncommitted work in the working tree (as of 2026-09-23)

| File | Change |
| --- | --- |
| `wordpress/proxy.php` | **v3** — homepage proxied, header-safe, `FOLLOWLOCATION` off |
| `wordpress/htaccess-frontend-proxy.txt` | Variant 1 rewritten: explicit `^$` homepage rule first, `wp-json`/`graphql` rules before the proxy, root-safe `-d` guard |
| `wordpress/README-wordpress-setup.md` | troubleshooting table + step 5 cache purge |
| `wordpress/pricing-acf-setup.md` | development-tab recipes (dynamic fields, $0 rule, Show in REST) |
| `app/lib/wordpress.ts` | `webdev` tab data layer: exact-slug lookup, dynamic question builder from priced ACF fields, `rawFields`, CMS-unreachable guards |
| `app/lib/content/types.ts` | `PricingPlansTabBase`, `PricingDevTab`, `PricingWebDevTab` (`cmsReady`), `PricingQuestion.key: string` |
| `app/lib/content/pricing.ts` | webdev defaults = calculator copy (independent question objects), `emptyQuestionSlots` |
| `app/components/pricing/PricingTabs.tsx` | 3 tabs, always visible middle tab (calculator or empty state) |
| `app/components/pricing/DesignCalculator.tsx` | accepts `Omit<PricingDesignTab,"id">`, explicit `answers` state, sequential reveal, `isAnswered()` |
| `app/components/ui/SectionHeader.tsx` | `mx-auto text-center` on centred headings (alignment fix) |
| `app/globals.css` | 3-tab switch fix, `.pricing-empty`, `pricing-question-in`, reduced-motion guard |
| `app/pricing/page.tsx` | passes `webdev` |
| `app/lib/site.ts` | `navLinks` = the footer "Company" list (About, Services, Process, Case Studies, Pricing, Contact) — shared by header + footer |
| `app/components/layout/Header.tsx` | desktop nav renders `navLinks` from `lg` (1024px) with `xl` gap, hamburger below `lg` |
| `app/components/layout/Footer.tsx` | Company column reads the same `navLinks` array |
| `PROJECT.md` | this document |

**Not yet pushed** — `git push` triggers GitHub Actions CI and a Vercel deploy.

### 11.3 Current state

| Area | State |
| --- | --- |
| Home page | ✅ live (Next.js content) |
| Contact page | ✅ live |
| Pricing page | ✅ live — 3 tabs, ACF-driven, dynamic Development tab |
| Inner pages (about, services, faq, process, case-studies) | ⏳ Coming Soon placeholders, designs parked |
| WordPress front-end hand-off | ⚠️ server still serves the pre-fix `.htaccess`/proxy — upload v3 + Variant 1 + purge cache |
| Pricing data | ✅ Designing post (500 / 1000 / 100) + Development post (500 / 300 / 200 / 300), enforced no-placeholder policy |

## 12. Conventions & guardrails

1. **No placeholders in CMS-driven UI** — if a value has not been filled in
   WordPress, the element is hidden rather than faked. (The middle pricing tab
   shows an empty state + quote CTA until the first priced ACF field exists.)
2. **Slot merges, never replacement** — a missing CMS field always keeps the
   bundled default underneath, so a CMS outage or a half-filled post can never
   blank a section.
3. **Never break the CMS for the design** — GraphQL/REST calls are try/catch'd,
   CI builds with `WORDPRESS_ENABLED=false`, and the page registry degrades to
   slug-derived titles.
4. **WordPress keeps its own URLs** — `/wp-admin`, `/wp-login.php`, `/graphql`,
   `/wp-json`, `wp-content`, `wp-includes` are always excluded from the proxy.
5. **Typed content contracts** — components receive interfaces from
   `lib/content/types.ts` only; content is never read from `process.env` or
   `fetch` inside a component.
6. **Server components by default** — `"use client"` only where interaction
   lives (pricing tabs/calculator, header, cursor, forms, count-up, reveal).
7. **All styling in `globals.css`** — new sections add a block there; no
   inline style libraries, no per-component CSS modules.
8. **Icons/artwork are bundled** (`public/images/…`) so the favicon and
   decorative art never depend on the CMS being reachable.
9. **Content edits happen in WordPress** (titles, ACF values); **structural
   edits happen in Next.js** (sections, layout, new fields' rendering rules).
10. **Motion is progressive** — every animation must be disabled under
    `prefers-reduced-motion: reduce` and must not touch layout properties.

### 12.1 Working agreement (how this project has been run)

- Local-only changes are fine; **run `npm run typecheck`, `npm run lint` and
  `npm run build` before every push** (the CI workflow runs the same three).
- After any CMS change, allow the **60 s ISR revalidate** (or restart the dev
  server) before concluding something is broken.
- After any host change (`.htaccess`, `proxy.php`, cache plugin), **purge the
  Hostinger/LiteSpeed cache** — otherwise old HTML keeps being served.
- Verify with the scripts rather than eyeballing:
  `node scripts/verify-wordpress.mjs` (routes) and
  `node scripts/check-cms-proxy.mjs <host>` (proxy).

## 13. Roadmap & known follow-ups

| # | Item | Notes |
| --- | --- | --- |
| 1 | **Deploy the uncommitted work** | `git push` → CI → Vercel. Live site currently runs the older 2-tab pricing code |
| 2 | **Upload `proxy.php` v3 + Variant 1 `.htaccess`** to `public_html/`, then purge cache | server-side only; without it `/` still shows the WP theme |
| 3 | **Pricing:** optional per-tab hero image + `subtext` overrides via ACF | hero copy already merges from the page group |
| 4 | **Pricing:** multi-currency / discount logic | the calculator totals are plain integers today |
| 5 | **Contact form:** currently client-side only | wire it to a real endpoint (WP form plugin, Resend, or a Next route handler) |
| 6 | **Inner pages:** build About / Services / FAQ / Process / Case Studies | all Coming Soon; designs + content models already parked |
| 7 | **SEO layer:** `sitemap.xml` / `robots.txt` route handlers, per-page OG images | metadata exists per page; sitemap not generated yet |
| 8 | **Tests:** no unit/e2e suite yet — only the `scripts/*.mjs` health checks | candidates: pricing merge, sequential reveal, registry lookup |
| 9 | **Analytics / conversion tracking** | not installed |
| 10 | **ACF for the home page** | home content is still bundled-only in `lib/content/defaults.ts` |

## 14. Key file index

| Need to change… | File |
| --- | --- |
| Brand name, emails, phones, addresses, WhatsApp, nav links | `app/lib/site.ts` |
| Home page copy / stats / services / testimonials / FAQs / clients | `app/lib/content/defaults.ts` |
| Pricing defaults & question definitions | `app/lib/content/pricing.ts` |
| Section markup / layout of any page | `app/components/<area>/*.tsx` |
| Any colour, spacing, animation | `app/globals.css` |
| How CMS data merges into a page | `app/lib/wordpress.ts` |
| Which URLs exist (WordPress registry) | `app/lib/registry.ts` + WordPress pages |
| Front-end hand-off (proxy / redirect) | `wordpress/proxy.php`, `wordpress/htaccess-frontend-proxy.txt` |
| WordPress one-time setup & troubleshooting | `wordpress/README-wordpress-setup.md` |
| Pricing ACF field reference | `wordpress/pricing-acf-setup.md` |
| CI / deploy behaviour | `.github/workflows/ci.yml`, `vercel.json`, `next.config.ts` |

---

### Definition of done for any change in this repo

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes (0 errors)
- [ ] `npm run build` succeeds
- [ ] `/pricing`, `/` and `/contact` render locally (CMS on **and** off)
- [ ] If `.env` was touched, `.env.example` documents the new variable
- [ ] If the host was touched, the cache was purged and
      `node scripts/check-cms-proxy.mjs <host>` passes
- [ ] Committed with a message describing the user-visible change and pushed to
      `main` (CI + Vercel then run automatically)

*Last updated: 2026-09-23 · Maintained by the CodeXmattriX dev team.*
