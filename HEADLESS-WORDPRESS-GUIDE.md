# Headless WordPress + Next.js — Complete Setup Guide

> **Architecture in one line:** Next.js owns **100% of the frontend** (HTML, CSS,
> Tailwind, JS, components, animations, layouts, designs **and content defaults**).
> WordPress is used **only as the CMS** that registers the pages/URLs through
> WPGraphQL. **No ACF. No Elementor. No page-builder.**
>
> Example that this guide makes real:
> - `app/about/page.tsx` — the full About design, in Next.js
> - `https://cms.codexmattrix.com/about/` — displays that Next.js page

---

## 1. The recommended architecture

```
                         ┌────────────────────────────────────────┐
                         │         codexmattrix.com               │
                         │            (Vercel = Next.js)          │
                         │                                        │
                         │  /           → app/page.tsx (Home)     │
                         │  /about      → app/about/page.tsx      │
                         │  /contact    → app/contact/page.tsx    │
                         │  /services   → app/services/page.tsx   │
                         │  /[...slug]  → any other WP page       │
                         └───────▲───────────────▲────────────────┘
                                 │               │ GET page list / resolve URL
                                 │               │ POST https://cms.codexmattrix.com/graphql
                          ┌──────┴───────┐ ┌─────┴───────────────────────┐
                          │   Browser    │ │   cms.codexmattrix.com      │
                          └──────▲───────┘ │   (WordPress = backend)     │
                                 │         └─────────────────────────────┘
        WordPress domain /about/ is        WordPress serves ONLY:
        proxied/redirected here  └────────►  /wp-admin   (editing)
        → the Next.js page renders           /wp-login.php
                                             /graphql    (API)
                                             /wp-json    (API)
                                             /uploads    (media)
```

**The one rule:** every WordPress page is created **blank**. Its *slug* is the URL
(`about` → `/about/`). Next.js renders the page for that URL. WordPress's own
theme never renders to visitors.

---

## 2. What lives where — WordPress vs Next.js

| Concern | Owned by | Where |
| --- | --- | --- |
| Page URLs / routes | WordPress | blank Pages in wp-admin (slug = URL) |
| Page design, layout, CSS, Tailwind, animations | Next.js | `app/components/**`, `app/globals.css` |
| Page content/copy | Next.js | `app/lib/content/*.ts` |
| Page rendering (HTML) | Next.js | `app/<slug>/page.tsx` |
| SEO metadata | Next.js | `export const metadata` |
| Routing a WordPress URL to Next.js | `.htaccess` or Cloudflare Worker | see section 9 |
| CMS editing / GraphQL API | WordPress | `/wp-admin`, `/graphql` |

---

## 3. WordPress configuration (one time, in wp-admin)

1. **Permalinks** — Settings → Permalinks → **Post name**.
   *(Your site currently uses `/index.php/<slug>/` plain permalinks — this guide and
   the code support both, but "Post name" gives clean `/about/` URLs.)*
2. **Plugins** — install & activate **WPGraphQL** only. Do **not** install ACF or
   any page builder.
3. **Pages** — create one **blank** page per Next.js route (leave the body empty):
   - `Home` (slug `home`) — required (it is your static front page)
   - `About` (slug `about`) — already exists on your CMS ✓
   - `Contact` (slug `contact`) — **not created yet** (verify script warns you)
   - Future: `Services`, `Pricing`, `FAQ`, … (slug must match the Next.js folder)
4. **Reading** — Settings → Reading → *Your homepage displays* → **A static page**
   → select **Home** (marks `/` as valid).
5. **Frontend hand-off** — upload the `.htaccess` (section 9) so public URLs
   render from Next.js. WordPress never shows its theme to visitors.
6. **Leave pages visually empty** — the WordPress "page editor" is never used.

## 4. Connecting WordPress + Next.js (WPGraphQL)

Yes, WPGraphQL is required — it is how Next.js reads the page registry. Your
endpoint is already live: `https://cms.codexmattrix.com/graphql`.

Next.js talks to it with a tiny GraphQL client (`app/lib/wordpress.ts`) and a
registry module (`app/lib/registry.ts`). Two queries are used:

```graphql
# 1) The URL list — every published page
query PageRegistry($first: Int!) {
  pages(first: $first) {
    nodes { id slug uri title }
  }
}

# 2) Resolve ONE URL (note: uri is String, NOT ID)
query PageByUri($uri: String!) {
  pageBy(uri: $uri) { id slug uri title }
}
```

These are cached with ISR (revalidated every 60 s) and guarded so that if
WordPress is down the site still renders — a registry failure never breaks a page.

## 5. Environment variables — `.env.local` (and Vercel)

Copy `.env.example` to `.env.local`. Values:

| Variable | Local | Vercel (Production) |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_NAME` | `CodeXmattriX` | `CodeXmattriX` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://my-next-app-phi-flax.vercel.app` (or your custom domain) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `917832820005` | `917832820005` |
| `WORDPRESS_ENABLED` | `true` | `true` |
| `WORDPRESS_GRAPHQL_URL` | `https://cms.codexmattrix.com/graphql` | same |
| `WORDPRESS_REST_URL` | `https://cms.codexmattrix.com/wp-json` | same |
| `WORDPRESS_TIMEOUT_MS` | `8000` | `8000` |

`.env.local` is gitignored — it never reaches GitHub.

---

## 6. Routing — how `/about`, `/contact`, `/services` work

Next.js (App Router) resolves routes by folder. WordPress only needs to register
the matching page slug.

| URL | Next.js file | Renders |
| --- | --- | --- |
| `/` | `app/page.tsx` | Home (WordPress registers `home`) |
| `/about` | `app/about/page.tsx` | About — **custom design** |
| `/contact` | `app/contact/page.tsx` | Contact — **custom design** |
| `/services`, `/pricing`, … | their folders | custom designs as you build them |
| anything else | `app/[...slug]/page.tsx` | generic template (registered URL) or 404 |

**What happens when a visitor opens `/about` (or `/contact`):**

1. The request hits **Vercel/Next.js** (or arrives there via the WordPress-domain
   `.htaccess`/Worker from section 9) — *not* the WordPress theme.
2. Next.js matches `app/about/page.tsx`.
3. The page renders from **Next.js-owned components + content**
   (`app/components/about/*`, `app/lib/content/about.ts`) — WordPress is not
   involved in the design at all.
4. For URLs without a dedicated design, the catch-all `app/[...slug]/page.tsx`
   calls `lookupPageUri()` → `POST …/graphql` with `pageBy(uri:)`:
   - WordPress is up and the slug is published → the registered **title** renders
     in the shared template (never a 404).
   - WordPress is up but the slug isn't a page → a real `404`.
   - WordPress is down/disabled → it renders from the slug anyway, so **no URL
     ever breaks**.
5. The result is cached with ISR for 60 s; the next visit is served instantly.

## 7. Complete Next.js folder structure

```
app/
├── layout.tsx                     # Root shell: fonts, metadata, Header/Footer
├── page.tsx                       # Home (Next.js content)
├── globals.css                    # Tailwind v4 theme tokens + component classes
├── about/page.tsx                 # About page (design + content in Next.js)
├── contact/page.tsx               # Contact page + form
├── services|pricing|faq|…/page.tsx# Future pages (currently "coming soon")
├── [...slug]/page.tsx             # Catch-all for any WordPress-registered URL
├── components/
│   ├── about/                     # AboutHero, Story, Mission, Values, Team, AboutCta
│   ├── contact/                   # ContactDetails, ContactForm (client)
│   ├── home/                      # Home sections (existing)
│   ├── layout/                    # Header, Footer, WhatsAppFab
│   ├── pages/RegisteredPage.tsx   # Generic template used by the catch-all
│   └── ui/                        # Container, Kicker, SectionHeader, Reveal,
│                                  # CountUp, TiltCard, ScrollProgress
├── lib/
│   ├── site.ts                    # Business constants (contact, links)
│   ├── wordpress.ts               # ★ WPGraphQL/REST client + home content
│   ├── registry.ts                # ★ WordPress page/URL registry (the bridge)
│   └── content/
│       ├── types.ts               # Home + About content types
│       ├── defaults.ts            # Home default content (Next.js-owned)
│       └── about.ts               # About default content (Next.js-owned)
wordpress/                         # WordPress-side files to upload
│   ├── htaccess-frontend-redirect.txt
│   ├── htaccess-frontend-proxy.txt
│   ├── cloudflare-worker.js
│   └── README-wordpress-setup.md
.env.example · next.config.ts · vercel.json · scripts/verify-wordpress.mjs
```

## 8. The working code (in this repo)

The key files below already contain the full implementation — open any of them:

- **`app/lib/wordpress.ts`** — `fetchWordPress()` (POST + timeout + ISR),
  `fetchRest()`, `decodeEntities()`, and `getHomeContent()` (Next.js defaults).
- **`app/lib/registry.ts`** — `getPageRegistry()`, `lookupPageUri()`,
  `isRegisteredSlug()`; resolves `/index.php/<slug>/` permalinks too.
- **`app/about/page.tsx`** + **`app/components/about/*`** — full About design
  (hero, story, mission/vision, values, stats, team, CTA) with `Reveal` scroll
  animations; content in `app/lib/content/about.ts`.
- **`app/contact/page.tsx`** + **`app/components/contact/*`** — contact cards
  from `app/lib/site.ts` + a client-side form (WhatsApp/email pre-fill).
- **`app/[...slug]/page.tsx`** — catch-all with the 404/fallback logic above.
- **`scripts/verify-wordpress.mjs`** — health check against the live CMS:

```bash
node scripts/verify-wordpress.mjs
# ✅ WordPress registry is ready — Next.js will resolve every registered URL.
```

---

## 9. Making the WordPress URL show the Next.js page (#4 and #12)

Three clean ways — pick one. **Option C (PHP reverse proxy) is the CHOSEN
wiring for this project** — it works on Hostinger shared hosting without
Cloudflare, without `mod_proxy` and without any DNS/nameserver change.
Full files are in `wordpress/`.

### Option C — PHP reverse proxy (CHOSEN — Hostinger-safe, keeps the CMS URL)

The browser **keeps** `https://cms.codexmattrix.com/about/` while the exact
Next.js page renders:

1. Upload `wordpress/proxy.php` to `public_html/` on the CMS host.
2. Replace the site-root `.htaccess` with Variant 1 from
   `wordpress/htaccess-frontend-proxy.txt` (routes every public URL —
   including `/_next/static`, `/images`, `/favicon.ico` — to `proxy.php`).
3. Open `https://cms.codexmattrix.com/about/` — you get
   `app/about/page.tsx` rendered by Vercel, with the CMS URL in the address
   bar. `/wp-admin`, `/graphql`, `/wp-json` and `/wp-content` are excluded and
   keep working on WordPress.

`proxy.php` fetches the same path from `https://my-next-app-phi-flax.vercel.app`
and streams it back (status, content-type and cache-control preserved). No
Cloudflare, no nameserver/DNS change, no hosting feature required.

### Option A — `.htaccess` 301 redirect (recommended, works everywhere)

Paste the contents of `wordpress/htaccess-frontend-redirect.txt` into the
`.htaccess` at the web root of `cms.codexmattrix.com` (cPanel → File Manager),
after replacing `CODEXMATTRIX_DOMAIN` with your live domain:

```apache
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /

# --- WordPress backend / API: never redirect these ---
RewriteRule ^index\.php$ - [L]
RewriteRule ^wp-admin/ - [L]
RewriteRule ^wp-login\.php - [L]
RewriteRule ^wp-json/ - [L]
RewriteRule ^graphql - [L]
RewriteRule ^wp-content/ - [L]
RewriteRule ^wp-includes/ - [L]

# --- Static assets ---
RewriteRule \.(css|js|png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot|pdf)$ - [L,NC]

# --- Everything else → the Next.js app (same path, main domain) ---
RewriteRule ^(.*)$ https://CODEXMATTRIX_DOMAIN/$1 [R=301,L]
</IfModule>
```

Result: `https://cms.codexmattrix.com/about/` **301-redirects to**
`https://codexmattrix.com/about/`, where Vercel renders the Next.js page.

### Option B — alternative keep-URL options (mod_proxy / Cloudflare Worker)

If you cannot upload a PHP file and still want to **keep** the CMS URL:
- `wordpress/htaccess-frontend-proxy.txt` — Variant 2 uses Apache `mod_proxy`
  (`[P]` flag). Requires the host to enable it (many shared hosts don't).
- `wordpress/cloudflare-worker.js` — same "keep the URL" behaviour without
  mod_proxy. Put the `cms` subdomain on Cloudflare, add a route
  `cms.codexmattrix.com/*`, set `MAIN_DOMAIN`, deploy. WordPress admin + API are
  left untouched.

> Tip: Whatever you choose, `https://cms.codexmattrix.com/wp-admin`,
> `/graphql` and `/wp-json` keep working because they're excluded from the rules.

## 10. Do I need a WordPress plugin or a rewrite/proxy?

**Both, for different jobs:**

| Job | Need |
| --- | --- |
| Next.js reads the URL list | **WPGraphQL** plugin (only plugin required) |
| A WordPress URL displays the Next.js page | **Proxy** — `proxy.php` + `.htaccess` (Option C, CHOSEN), redirect (Option A) or Worker (Option B) |
| Building the page in WordPress | **No** — that's exactly what you're avoiding (no ACF, no Elementor) |

## 11. Vercel configuration (#11)

1. **Import the repo** — https://vercel.com/new → Import Git Repository →
   your `my-next-app` repo. The Vercel project is `my-next-app-phi-flax` and
   its live URL is `https://my-next-app-phi-flax.vercel.app`. Vercel
   auto-detects **Next.js** (also pinned in `vercel.json`).
2. **Environment variables** — Project → Settings → Environment Variables:
   add every row from the table in section 5 (use the same values for
   Production + Preview + Development).
3. **CI + Deploy** — GitHub Actions (`.github/workflows/ci.yml`) runs
   `npm ci` + typecheck + lint + build on every push/PR. Vercel deploys every
   push to `main` (production) and every PR (preview). Change env vars →
   **Redeploy** once for them to take effect.
4. **Domain (optional)** — Project → Settings → Domains → add
   `codexmattrix.com` (and `www`) when you own it. Follow Vercel's DNS
   instructions (point `A`/`CNAME` records to Vercel).
5. After adding a domain, update `NEXT_PUBLIC_SITE_URL` to it.

`vercel.json` already pins the framework, build/install commands and security
headers — nothing else to configure.

## 12. Domain configuration (#12)

```
my-next-app-phi-flax.vercel.app  →  Vercel  (live Next.js URL today)
codexmattrix.com      (optional) →  Vercel  (if/when you attach the domain)
cms.codexmattrix.com             →  WordPress host (editing + GraphQL API)
```

Flow when someone opens `https://cms.codexmattrix.com/about/`:
WordPress host receives it → `.htaccess` sends it to `proxy.php` (Option C)
→ the proxy fetches the same path from `https://my-next-app-phi-flax.vercel.app`
→ the exact Next.js page renders while the browser **keeps** the
`cms.codexmattrix.com/about/` URL.

## 13. Deployment workflow — local → WordPress → GitHub → Vercel → live

```bash
# 1. Local development
npm install
copy .env.example .env.local     # fill real values (WORDPRESS_ENABLED=true)
npm run dev                      # http://localhost:3000  → test /about /contact

# 2. Validate locally
npm run typecheck
npm run lint
npm run build                    # must pass before pushing
node scripts/verify-wordpress.mjs# confirms the live CMS is ready

# 3. Push to GitHub — CI runs, then Vercel auto-deploys main
git add .
git commit -m "feat: full-headless reverse proxy via WordPress domain"
git push origin main

# 4. Vercel
#    - env vars set once (section 5): Project → Settings → Environment Variables
#    - domain optional (section 12) — today live at my-next-app-phi-flax.vercel.app
#    - GitHub Actions verifies every push/PR; every push to main redeploys

# 5. WordPress one-time setup (section 3) + frontend hand-off (section 9, Option C)
#    - upload wordpress/proxy.php → public_html/
#    - replace the site-root .htaccess with Variant 1 of htaccess-frontend-proxy.txt
```

**Content/URL cadence after launch**

| Action | Result |
| --- | --- |
| Edit a Next.js page & push | Vercel redeploys → page updates |
| Create a new blank WP page (new slug) | URL exists; catch-all renders it within ~60 s |
| Delete/unpublish a WP page | Catch-all returns 404 for that URL |
| WordPress is down | Site keeps serving (Next.js defaults; no URLs break) |

---

## 14. The four concepts, clarified (#13)

- **WordPress as CMS** — the *backend*. You log into `cms.codexmattrix.com/wp-admin`
  to create/publish the pages. Each published page = one URL. WordPress holds no
  design and no content — just blank page records + the GraphQL API.
- **Next.js as frontend** — everything a visitor sees: `app/` code, components,
  Tailwind, animations, copy. It queries WordPress *only* to learn the URL list
  and titles, then renders its own pages.
- **WordPress URL** (`https://cms.codexmattrix.com/about/`) — the URL registered
  in WordPress. It's the *content-editing/API domain*; when a visitor hits a page
  URL there, it redirects/proxies to the Next.js site (section 9).
- **Next.js / Vercel URL** (`https://my-next-app-phi-flax.vercel.app/about/`,
  or `codexmattrix.com/about/` once the domain is attached) — the URL where
  Vercel runs Next.js and renders the actual page. With the proxy (Option C)
  the browser stays on the WordPress-domain URL and still gets these pages.

> In short: WordPress decides **which URLs exist**; Next.js decides **what they
> look like**; Vercel serves the result.






