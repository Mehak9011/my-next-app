# CodeXmattriX — Headless WordPress + Next.js

A production-ready **Headless WordPress** website. **100% of the frontend lives
in Next.js** — components, Tailwind CSS, animations, layouts and content.
**WordPress is used only as the CMS** that registers the pages/URLs through
WPGraphQL. **No ACF. No Elementor. No page-builder.**

> **Brand** — CodeXmattriX · "Envision. Design. Code."
> **Stack** — Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · WPGraphQL
> **CMS** — `https://cms.codexmattrix.com/` · GraphQL `https://cms.codexmattrix.com/graphql`

---

## Pages (built & maintained in Next.js)

| Route | Next.js file | Notes |
| --- | --- | --- |
| `/` | `app/page.tsx` | Home — Hero, Stats, Services, Industries, Testimonials, FAQ, CTA, Clients |
| `/about` | `app/about/page.tsx` | Story, Mission & Vision, Values, Stats, Team, CTA |
| `/contact` | `app/contact/page.tsx` | Contact cards + WhatsApp/email form |
| `/services`, `/pricing`, `/faq`, … | their folders | Coming-soon (build next) |
| any other URL | `app/[...slug]/page.tsx` | Renders WordPress-registered URLs (or 404) |

WordPress only needs a **blank page** whose slug matches each route — the design
and copy are 100% in Next.js.

---

## Quick start

```bash
npm install
copy .env.example .env.local      # fill real values (see below)
npm run dev                       # http://localhost:3000
```

Required for a CMS-connected build: `WORDPRESS_ENABLED=true` and
`WORDPRESS_GRAPHQL_URL=https://cms.codexmattrix.com/graphql`.

**Validate**

```bash
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm run build       # Production build
node scripts/verify-wordpress.mjs   # Live CMS health check (registry + routes)
```

---

## Folder structure

```
app/
├── layout.tsx                     # Root shell (fonts, metadata, Header/Footer)
├── page.tsx                       # Home (Next.js content)
├── globals.css                    # Tailwind v4 theme tokens + component classes
├── about/page.tsx                 # About page (Next.js design + content)
├── contact/page.tsx               # Contact page + form
├── [...slug]/page.tsx             # Catch-all for WordPress-registered URLs
├── components/
│   ├── about/  contact/  home/  layout/  pages/  ui/
└── lib/
    ├── site.ts                    # Business constants
    ├── wordpress.ts               # WPGraphQL / REST client + home content
    ├── registry.ts                # WordPress page/URL registry (the bridge)
    └── content/                   # Next.js-owned page content (types, defaults, about)
wordpress/                         # Files to upload to the WordPress host
│   ├── htaccess-frontend-redirect.txt   # Option A: 301 public URLs → Next.js
│   ├── htaccess-frontend-proxy.txt      # Option B: reverse proxy (mod_proxy)
│   ├── cloudflare-worker.js             # Option B: Cloudflare alternative
│   └── README-wordpress-setup.md
.env.example · next.config.ts · vercel.json · scripts/verify-wordpress.mjs
```

---

## How the pieces fit

```
Browser → codexmattrix.com (Vercel/Next.js)  ←─  cms.codexmattrix.com/about/
                │                                    │ .htaccess / Worker
                │                                    ▼
                │                        redirects/proxies to the Next.js URL
                ▼
        Next.js renders the page.
        WordPress only answers /graphql (page registry) & /wp-admin (editing).
```

- **WordPress** publishes blank pages → their slugs define the URLs.
- **Next.js** queries `POST https://cms.codexmattrix.com/graphql` for the page
  list/titles (`app/lib/registry.ts`), then renders its own pages — cached with
  ISR (60 s) and fully resilient if the CMS is down.
- **WordPress-domain URLs** (`cms.codexmattrix.com/about/`) are handed to
  Next.js by `.htaccess` or a Cloudflare Worker.

**Full walkthrough:** see **[HEADLESS-WORDPRESS-GUIDE.md](./HEADLESS-WORDPRESS-GUIDE.md)**
— architecture, WordPress config, WPGraphQL, routing, environment variables,
`.htaccess`/proxy setup, Vercel + domain configuration, and the deployment
workflow.

---

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_NAME` | App/brand name shown in the UI |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (SEO/metadata) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp buttons + contact form |
| `WORDPRESS_ENABLED` | `true` = read the WordPress page registry |
| `WORDPRESS_GRAPHQL_URL` | `https://cms.codexmattrix.com/graphql` |
| `WORDPRESS_REST_URL` | `https://cms.codexmattrix.com/wp-json` |
| `WORDPRESS_TIMEOUT_MS` | CMS request timeout (default `8000`) |

Set these in Vercel → Project → Settings → Environment Variables, then redeploy.

---

## GitHub + Vercel

```bash
git add .
git commit -m "feat: headless WordPress — About & Contact pages in Next.js"
git push origin main        # Vercel auto-builds & deploys
```

- Framework preset **Next.js** is pinned in `vercel.json` (build/install commands,
  security headers).
- Add the env vars once in Vercel, then every push redeploys.
- Add your domain under Vercel → Settings → Domains and update
  `NEXT_PUBLIC_SITE_URL`.
- **WordPress one-time setup**: permalinks → "Post name", install WPGraphQL,
  create the blank pages (Home/About/Contact/…), set Home as static front page,
  upload the `.htaccess` — details in `wordpress/README-wordpress-setup.md`.

---

## Checklist before pushing

- [ ] `npm run typecheck`, `npm run lint`, `npm run build` pass
- [ ] `.env.local` not committed (gitignored)
- [ ] `.env.example` documents every variable
- [ ] `node scripts/verify-wordpress.mjs` passes
- [ ] Blank WordPress pages exist for every route (home, about, contact, …)
- [ ] Domain on Vercel + `.htaccess`/Worker uploaded to the CMS host
