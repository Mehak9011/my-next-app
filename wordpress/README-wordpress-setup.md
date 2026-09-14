# WordPress setup — Headless CMS (page registration only)

This folder contains the WordPress-side configuration for the Headless
WordPress + Next.js architecture. **No ACF. No Elementor. No page editor.**

WordPress's ONLY job: **register the pages/URLs**. The design and content
live 100% in Next.js.

---

## Files

| File | Purpose | Upload to |
| --- | --- | --- |
| `htaccess-frontend-redirect.txt` | 301-redirect every public URL to your live Next.js domain (URL bar changes). **Recommended — works on all hosting.** | Copy the contents into the site-root `.htaccess` (cPanel → File Manager) |
| `htaccess-frontend-proxy.txt` | Reverse-proxy every public URL to Next.js (URL bar keeps `cms.codexmattrix.com/...`). Needs `mod_proxy`. | Same location (use ONE of the two) |
| `cloudflare-worker.js` | Cloudflare Worker alternative to mod_proxy — same "keep the URL" behaviour without hosting support. | Cloudflare Worker for the `cms` subdomain |

---

## One-time WordPress configuration

1. **Permalinks** — Settings → Permalinks → **Post name** (clean `/about/`
   URLs instead of `/index.php/about/`).
2. **Plugins** — install and activate **WPGraphQL** only. Do not install
   ACF or any page builder.
3. **Pages** — create one blank page per Next.js route and leave the body
   **empty**:
   - `Home` (slug: `home`) — your home URL
   - `About` (slug: `about`) → `/about/`
   - `Contact` (slug: `contact`) → `/contact/`
   - Future: `Services`, `Pricing`, `FAQ`, … match slugs to the pages you
     build in `app/<slug>/page.tsx`
4. **Reading** — Settings → Reading → *Your homepage displays* → **A static
   page** → select **Home**.
5. **Frontend hand-off** — upload the `.htaccess` rules (or Worker) so the
   public site renders from Next.js.
6. **Test** — open `/about/`, `/contact/` and `/wp-admin` on the cms domain.

## How it works

```
Browser  ── /about/ ──► cms.codexmattrix.com
                              │  .htaccess / Worker
                              ▼
                     codexmattrix.com  (Vercel)
                              │
                              ▼
                Next.js renders app/about/page.tsx
                (WordPress never builds or serves the page)
```

WordPress `/wp-admin`, `/wp-login.php`, `/graphql` and `/wp-json` stay
untouched, so editing and the API keep working on the cms domain.

## Verify

From the repo root (picks up `.env.local` automatically):

```bash
node scripts/verify-wordpress.mjs
```