# WordPress setup — Headless CMS (page registration only)

This folder contains the WordPress-side configuration for the Headless
WordPress + Next.js architecture. **No ACF. No Elementor. No page editor.**

WordPress's ONLY jobs:
1. **register the pages/URLs** (blank pages → slugs → WPGraphQL registry), and
2. **serve the public URLs from Next.js** via the reverse proxy below.

The design and content live **100% in Next.js**.

---

## Files

| File | Purpose | Upload to |
| --- | --- | --- |
| `proxy.php` | **CHOSEN — PHP reverse proxy.** Fetches the same path from Vercel/Next.js and streams it back, so `https://cms.codexmattrix.com/about/` renders the exact Next.js About page while the URL bar keeps the CMS URL. Works on ANY shared host (Hostinger included) — no Cloudflare, no `mod_proxy`, no DNS change. | `public_html/proxy.php` |
| `htaccess-frontend-proxy.txt` | **CHOSEN — the `.htaccess` rules.** Routes every public URL (except `/wp-admin`, `/graphql`, `/wp-json`, `/wp-content` …) to `proxy.php`. Variant 1 = PHP proxy, Variant 2 = Apache `mod_proxy`. | Replace the site-root `.htaccess` content |
| `htaccess-frontend-redirect.txt` | ALT — 301-redirect every public URL to your live Next.js domain (URL bar changes). Works on all hosting. | Same location (use ONE method) |
| `cloudflare-worker.js` | ALT — Cloudflare Worker that proxies to Next.js when you put the `cms` subdomain on Cloudflare. | Cloudflare Worker for the `cms` subdomain |

---

## One-time WordPress configuration

1. **Permalinks** — Settings → Permalinks → **Post name** (clean `/about/`
   URLs instead of `/index.php/about/`).
2. **Plugins** — install and activate **WPGraphQL** only. Do not install
   ACF or any page builder.
3. **Pages** — create one blank page per Next.js route and leave the body
   **empty** (design + content come from Next.js):
   - `Home` (slug: `home`) — your home URL
   - `About` (slug: `about`) → `/about/`
   - `Contact` (slug: `contact`) → `/contact/`
   - `Services`, `Pricing`, `FAQ`, `Process`, `Case Studies` → match slugs to
     the pages built in `app/<slug>/page.tsx`
4. **Reading** — Settings → Reading → *Your homepage displays* → **A static
   page** → select **Home**. (This only defines the `/` page record in the
   GraphQL registry — visitors still get Next.js `app/page.tsx` through the
   proxy, never the WP theme.)
5. **Frontend hand-off (CHOSEN method)** — upload `proxy.php` (**v3** — overwrite
   any older v1 file) to `public_html/`, then replace the site-root `.htaccess`
   with the Variant 1 block from `htaccess-frontend-proxy.txt` (it contains the
   explicit `RewriteRule ^$ /proxy.php?_cmx=1` homepage rule). Then **purge all
   cache** — Hostinger hPanel → Cache → Purge All (and Purge in the LiteSpeed /
   caching plugin if installed). Without this `/` keeps showing the WP theme
   ("Cms / Home" + logo) while `/about/` already shows Next.js, and old v1
   proxy output leaks `HTTP/2 200 ...` text on `/about/` and `/contact/`.
6. **Test** — open `/`, `/about/`, `/contact/`, `/services/` and
   `/wp-admin` on the cms domain. Public URLs show the Next.js design; the
   admin, editor and `/graphql` keep working.

---

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `/` shows the WP theme ("Cms / Home" + logo) but `/about/` shows Next.js | A `RewriteCond %{REQUEST_FILENAME} -d` passthrough swallows the site root (it IS a real directory), and/or the `^$` homepage rule is missing | Replace the **whole** `.htaccess` with Variant 1 in `htaccess-frontend-proxy.txt` — it has `RewriteRule ^$ /proxy.php?_cmx=1` **first** and the `-d` rule excludes `/` via `!^/(\?|$)`. Then purge all cache. |
| `/wp-json/` returns 404 (or JSON 404 in the editor) | `rest_route` rules missing or placed **after** the proxy rule, so `/wp-json` gets proxied to Vercel | Keep both `RewriteRule ^wp-json... index.php?rest_route=...` lines **before** the proxy rule (Variant 1 has them) |
| Pages don't save in wp-admin | Same REST issue — the editor's save call hits `/wp-json/wp/v2/...` | Same fix as above; verify with `curl https://<cms-domain>/wp-json/wp/v2/types` (should return JSON) |
| Old v1 proxy output ("HTTP/2 200 ..." text at top of pages) | `public_html/proxy.php` is still v1 | Overwrite with `wordpress/proxy.php` (v3) |
| Rules look right but nothing changes | Hostinger/LiteSpeed page cache serving a stale copy | hPanel → Cache → **Purge All** (+ purge in the LiteSpeed caching plugin if active) |

If `.htaccess` has a syntax error the server returns **500** — re-check the
file against Variant 1 character-by-character (the custom rules must sit
**above** the `# BEGIN WordPress` block so WordPress's permalink save never
overwrites them).

## How it works (chosen method)

```
User Browser  ── /about/ ──►  cms.codexmattrix.com
                                   │  .htaccess  →  proxy.php
                                   ▼
                    proxy.php fetches the SAME path
                                   ▼
                 my-next-app-phi-flax.vercel.app/about   (Vercel = Next.js)
                                   │
                                   ▼
                Next.js renders app/about/page.tsx
                (WordPress never builds or serves the page design)
```

WordPress `/wp-admin`, `/wp-login.php`, `/graphql` and `/wp-json` stay
untouched, so editing and the API keep working on the cms domain.

> CORS is optional here: Next.js calls WPGraphQL **server-side** (in the
> Next.js build), so browser CORS is usually not triggered. If you ever make
> client-side calls, allow your frontend origin(s) in `functions.php` via a
> snippet plugin (WPCode): `header('Access-Control-Allow-Origin: https://my-next-app-phi-flax.vercel.app');`

---

## Verify

From the repo root (picks up `.env.local` automatically):

```bash
node scripts/verify-wordpress.mjs
```