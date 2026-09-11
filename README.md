# CodeXmattriX — Headless WordPress + Next.js

Production-ready **Home Page** rebuilt from the original static HTML into a
modern **Next.js (App Router)** website, powered by **Tailwind CSS v4** for
styling and **WordPress** as the headless CMS.

> **Brand** — CodeXmattriX · "Envision. Design. Code."
> **Stack** — Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · WPGraphQL / REST

---

## 1. What's included

- **Pixel-faithful Home Page** — every section from the original file:
  sticky header, hero with screenshot marquee, stats bar, services (design vs
  development), industries cards, testimonials, FAQ accordion, final CTA,
  clients strip, dark footer with wordmark marquee + presence cards, and the
  floating WhatsApp button.
- **Global branding system** — colors, fonts, buttons and typography are
  defined **once** in `app/globals.css` (Tailwind v4 `@theme`). No repeated
  hardcoded brand values anywhere.
- **Fully responsive** — mobile, tablet and desktop breakpoints throughout.
- **Reusable components** — every page section is a small component under
  `app/components/`, reusable for About, Services, Contact and future pages.
- **WordPress integration** — WPGraphQL first, WordPress REST API fallback,
  bundled defaults as the safety net. Works locally with **zero CMS
  configuration** and upgrades to live CMS content when enabled.
- **Deployment-ready** — GitHub + Vercel configuration, `.env.example`,
  `vercel.json`, security headers included.

---

## 2. Folder structure

```
my-next-app/
├── app/
│   ├── layout.tsx               # Root layout: fonts, metadata, Header/Footer shell
│   ├── page.tsx                 # Home page (server component, CMS-or-default data)
│   ├── globals.css              # ★ Tailwind v4 @theme brand tokens + component classes
│   ├── icon.svg                 # Brand favicon
│   ├── components/
│   │   ├── layout/              # Header, Footer, WhatsAppFab
│   │   ├── home/                # Hero, ShotStrip, Stats, Services, Industries,
│   │   │                        #   Testimonials, FAQ, FinalCTA, Clients
│   │   ├── ui/                  # Container, Kicker, SectionHeader, Reveal
│   │   └── ComingSoonPage.tsx   # Shared template for upcoming pages
│   ├── lib/
│   │   ├── site.ts              # Business constants (contact, phones, links)
│   │   ├── content/
│   │   │   ├── types.ts         # HomeContent typing
│   │   │   └── defaults.ts      # Bundled default content (exact original copy)
│   │   └── wordpress.ts         # ★ WPGraphQL + REST data layer
│   ├── services|about|faq|.../page.tsx  # Future pages (Coming soon)
├── public/images/               # Branded placeholder images (swap with real shots)
├── wordpress/acf-field-group.json # ACF field group for the Home page CMS
├── .env.example                 # Documented environment variables
├── next.config.ts               # Image remote patterns etc.
├── vercel.json                  # Vercel framework + headers
└── README.md
```

---

## 3. Branding & theme (single source of truth)

All branding lives in **`app/globals.css`** as Tailwind v4 `@theme` tokens:

| Token                  | Value    | Used for                    |
| ---------------------- | -------- | --------------------------- |
| `--color-ink`          | `#14181D`| Headings / primary text     |
| `--color-crimson`      | `#E63329`| Brand red / accents         |
| `--color-crimson-light`| `#EE3E3E`| Primary gradient end        |
| `--color-panel`        | `#F6F5F3`| Soft section backgrounds    |
| `--color-slate`        | `#5B6570`| Secondary text              |
| `--color-line`         | `#E9E7E2`| Hairline borders            |
| `--color-night`        | `#0F1620`| Footer background           |
| `--font-sans`          | Manrope  | Body type                   |
| `--font-display`       | Archivo  | Headings                    |

Because Tailwind v4 emits theme tokens as real CSS custom properties on
`:root`, the **same variable drives both Tailwind utilities** (`bg-crimson`,
`text-slate`, `border-line`, …) **and** the component classes (`.btn-primary`,
`.kicker`, …) in the same file. Change a token once → the whole site updates.
Fonts are self-hosted with `next/font` (no render-blocking Google request).

**How to change the look:**
- Colors / fonts → edit tokens inside `@theme` in `app/globals.css`
- Sections → edit `app/components/home/*`
- Copy (hero, services, testimonials…) → CMS, or `app/lib/content/defaults.ts`

---

## 4. Quick start (local development)

### Prerequisites
- Node.js **20.9+** (recommended) or later
- npm (ships with Node)

### Install & run

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file (values are already sensible for offline dev)
copy .env.example .env.local        # Windows
# cp .env.example .env.local        # macOS / Linux

# 3. Start the dev server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** — the full Home Page
renders immediately using the bundled default content (WordPress not required
to see the site working).

> `.env.local` already sets `WORDPRESS_ENABLED=false`, so the site also builds
> cleanly in CI even when the CMS is unreachable.

### Useful scripts

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build (validates types + bundle)
npm run start      # Serve the production build locally
npm run lint       # ESLint
npm run typecheck  # TypeScript type check (tsc --noEmit)
```

---

## 5. WordPress (headless CMS) integration

### How the data flow works

```
WordPress (WPGraphQL)  ──►  app/lib/wordpress.ts  ──►  typed HomeContent
WordPress REST (wp-json)──►        (fallback)     ──►  app/lib/content/types.ts
Bundled defaults      ──►        (safety net)    ──►  rendered by app/page.tsx
```

`getHomeContent()` (in `app/lib/wordpress.ts`) tries **WPGraphQL first**, falls
back to the **REST API**, and only then uses the bundled defaults — so the
website is always up, even if WordPress is down, while content still streams
from the CMS when it is reachable. CMS data is cached with **ISR (revalidates
every 60 s)**, so edits appear on the site without a redeploy.

### Required environment variables

```dotenv
# Master switch — set to true only when your WP endpoints are live
WORDPRESS_ENABLED=false

# WPGraphQL endpoint (WPGraphQL plugin installed)
WORDPRESS_GRAPHQL_URL=https://cms.example.com/graphql

# REST API base
WORDPRESS_REST_URL=https://cms.example.com/wp-json

# Optional — application password for authenticated calls
WORDPRESS_AUTH_USER=
WORDPRESS_APPLICATION_PASSWORD=

# Optional — request timeout in ms
WORDPRESS_TIMEOUT_MS=8000
```

### One-time WordPress setup

1. **Install plugins** (Plugins → Add New):
   - [WPGraphQL](https://wordpress.org/plugins/wp-graphql/) — required for the
     primary path. (No REST plugin needed — it's built into WordPress.)
   - **Advanced Custom Fields (ACF)** — required for the structured Home page
     fields. The shipped field group uses **repeaters**, so use **ACF PRO**
     (or replace the repeater fields with plain text fields in ACF free).

2. **Import the Home page field group**: In WP Admin → *Custom Fields →
   Field Groups → Sync available groups*, or copy
   `wordpress/acf-field-group.json` into
   `wp-content/themes/your-theme/acf-json/`. The group auto-imports.

3. **Create the Home page** in WP: Pages → Add New → title "Home" → slug
   `home` → assign it as the front page (Settings → Reading → "A static
   page") → fill in the ACF fields.

4. **Testimonials**: register a custom post type with slug `testimonial`
   (e.g. with CPT UI or `register_post_type()` in your theme). Publish
   testimonials — WP Title = client name, Editor content = quote.

5. **Enable the CMS in `.env.local`**:
   ```dotenv
   WORDPRESS_ENABLED=true
   WORDPRESS_GRAPHQL_URL=https://cms.example.com/graphql
   WORDPRESS_REST_URL=https://cms.example.com/wp-json
   ```
   Restart the dev server. If a field is missing, that section gracefully
   falls back to the bundled defaults.

### Architecture options (no iframes)

- **Option A — WordPress stays an API-only backend (recommended).** Keep WP
  on its own domain (e.g. `cms.example.com`), serve the public site from the
  Next.js domain. Optionally redirect `CORS` from the WP site to the Next.js
  origin. Public reading works; for write access use Application Passwords.

- **Option B — Serve Next.js on the WordPress domain.** Point the WP domain's
  DNS to the Vercel deployment and set `NEXT_PUBLIC_SITE_URL` to the domain.
  Keep WordPress at a subdomain such as `cms.example.com` for editing.

---

## 6. GitHub setup

The repo is already git-initialized. `.gitignore` excludes `node_modules/`,
`.next/`, `.env*` (except `.env.example`) and `.vercel/`.

```bash
# 0. (One time) Point the remote at your own repository
#    Create an empty repo on github.com (no README/gitignore), then:
git remote add origin https://github.com/YOUR_USERNAME/codexmattrix-nextjs.git

# 1. See what's staged
git status

# 2. Stage everything (safe: secrets are gitignored)
git add .

# 3. First commit
git commit -m "feat: convert CodeXmattriX home page to Next.js + WordPress headless"

# 4. Push to GitHub
git push -u origin main
```

> Troubleshooting: if your default branch is `master`, rename it first with
> `git branch -m master main`, or push with `git push -u origin HEAD`.

---

## 7. Vercel deployment

### Option A — Import from GitHub (recommended)

1. Push the repo to GitHub (section above).
2. Go to **https://vercel.com/new** → **Import Git Repository** → pick the repo.
3. Vercel auto-detects **Next.js**. Use these settings if prompted:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build` (or leave default `next build`)
   - Install Command: `npm install`
4. **Add environment variables** (Project → Settings → Environment Variables):

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_APP_NAME` | `CodeXmattriX` |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` (later your domain) |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | `917832820005` |
   | `WORDPRESS_ENABLED` | `true` |
   | `WORDPRESS_GRAPHQL_URL` | `https://cms.example.com/graphql` |
   | `WORDPRESS_REST_URL` | `https://cms.example.com/wp-json` |
   | `WORDPRESS_TIMEOUT_MS` | `8000` |

5. Click **Deploy**. Every push to `main` now triggers an automatic
   deployment; every PR gets a preview URL.
6. Optional: add your custom domain under Project → Settings → Domains, then
   update `NEXT_PUBLIC_SITE_URL`.

> When `WORDPRESS_ENABLED=false` (or a CMS call fails), the deployment serves
> the bundled default content — so the first deploy always succeeds.

---

## 8. Full workflow: local → GitHub → Vercel → WordPress live

1. **Local**: `npm install` → `copy .env.example .env.local` → `npm run dev`
2. **Edit & verify**: make changes, run `npm run build` to validate.
3. **Commit & push**: `git add . && git commit -m "..." && git push`
4. **Auto-deploy**: Vercel builds from the push; preview appears in ~1 minute.
5. **Go live**: add custom domain in Vercel; update `NEXT_PUBLIC_SITE_URL`.
6. **WordPress**: set `WORDPRESS_ENABLED=true`, fill `WORDPRESS_GRAPHQL_URL`
   and `WORDPRESS_REST_URL` in Vercel env vars, redeploy once.
7. **Edit content**: change the WordPress Home page fields → the site refreshes
   within ~60 s (ISR) without a redeploy.

**Content update cadence**

| Action | What happens |
| --- | --- |
| Push to `main` | Vercel rebuilds & redeploys automatically |
| Update WordPress content | Visible after the 60 s ISR revalidation window |

---

## 9. Checklist before pushing

- [ ] `npm install` ran successfully
- [ ] `npm run build` passes locally
- [ ] `npm run lint` passes
- [ ] `.env.local` is NOT committed (gitignored)
- [ ] `.env.example` documents every variable used
- [ ] Custom domain verified on Vercel
- [ ] WordPress endpoints reachable + `WORDPRESS_ENABLED=true`