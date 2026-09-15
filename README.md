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
| `/services` | `app/services/page.tsx` | Design + development services with deliverables |
| `/process` | `app/process/page.tsx` | 5-step process: Discovery → Design → Dev → QA → Launch |
| `/pricing` | `app/pricing/page.tsx` | Engagement models and what's included |
| `/faq` | `app/faq/page.tsx` | Timelines, industries, launch & support |
| `/case-studies` | `app/case-studies/page.tsx` | Industries and project highlights |
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
│   ├── proxy.php                   # CHOSEN: PHP reverse proxy (full-headless, hostinger-safe)
│   ├── htaccess-frontend-proxy.txt # CHOSEN: .htaccess to route public URLs → proxy.php
│   ├── htaccess-frontend-redirect.txt   # ALT: 301 public URLs → live domain
│   ├── cloudflare-worker.js             # ALT: Cloudflare alternative (same as proxy)
│   └── README-wordpress-setup.md
.github/workflows/ci.yml           # GitHub Actions — lint, typecheck & build on push/PR
.env.example · next.config.ts · vercel.json · scripts/verify-wordpress.mjs
```

---

## How the pieces fit

```
User Browser
     │        https://cms.codexmattrix.com/about/
     ▼
cms.codexmattrix.com   (Hostinger — WordPress = domain/URL layer)
     │   .htaccess → every public URL → proxy.php
     ▼
     proxy.php  ⟶  server-side fetch of the SAME path
     ▼
https://my-next-app-phi-flax.vercel.app/about   (Vercel — Next.js)
     │   renders app/about/page.tsx (design + content)
     ▼
response streamed back → browser keeps the CMS URL
```

- **Next.js owns 100% of the frontend** — every page (`app/**`), design, content
  and animation. Next.js queries `POST https://cms.codexmattrix.com/graphql`
  (server-side) only for the page list/titles (`app/lib/registry.ts`), cached
  with ISR (60 s) and resilient when the CMS is down.
- **WordPress is the URL/server layer** — blank pages define the slugs/URLs;
  `wp-admin` and `/graphql`/`/wp-json` keep working on the CMS domain. The
  public URLs are served by `wordpress/proxy.php` + the `.htaccess` rules.
- **No Cloudflare, no nameserver/DNS change** — everything stays on Hostinger
  except the Next.js build, which Vercel deploys from GitHub on every push.

**Full walkthrough:** see **[HEADLESS-WORDPRESS-GUIDE.md](./HEADLESS-WORDPRESS-GUIDE.md)**
— architecture, WordPress config, WPGraphQL, routing, environment variables,
the proxy setup (section 9 · Option C) and the deployment workflow.

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

## GitHub + Vercel + CI

```bash
git add .
git commit -m "feat: full-headless reverse proxy via WordPress domain"
git push origin main        # 1) GitHub Actions CI runs 2) Vercel auto-deploys
```

- **Framework preset** Next.js is pinned in `vercel.json` (build/install commands,
  security headers).
- **CI (GitHub Actions)** — `.github/workflows/ci.yml` runs `npm ci`, typecheck,
  lint and a production build on every push/PR. The build is offline-safe
  (`WORDPRESS_ENABLED=false`), so it never depends on the CMS being reachable.
- **Vercel** — add the env vars once (section above), every push redeploys.
  Add a custom domain under Vercel → Settings → Domains if you want one; until
  then the live URL is `https://my-next-app-phi-flax.vercel.app`.
- **WordPress one-time setup**: permalinks → "Post name", install WPGraphQL,
  create the blank pages, set Home as static front page, upload `proxy.php` +
  the `.htaccess` rules — details in `wordpress/README-wordpress-setup.md`.

---

## Checklist before pushing

- [ ] `npm run typecheck`, `npm run lint`, `npm run build` pass
- [ ] `.env.local` not committed (gitignored)
- [ ] `.env.example` documents every variable
- [ ] `node scripts/verify-wordpress.mjs` passes
- [ ] Blank WordPress pages exist for every route (home, about, contact, …)
- [ ] Domain on Vercel + `.htaccess`/Worker uploaded to the CMS host
