/**
 * ============================================================
 * Optional Cloudflare Worker — keep cms.codexmattrix.com URLs
 * while serving the Next.js pages from Vercel.
 *
 * When .htaccess mod_proxy is unavailable (shared hosting), you can
 * proxy the cms subdomain through Cloudflare and run this Worker:
 *
 *   1. Cloudflare Dashboard → cms.codexmattrix.com → DNS:
 *      make sure the record is proxied (orange cloud) and its origin
 *      is the WordPress host.
 *   2. Workers & Routes → Add route:  cms.codexmattrix.com/*
 *   3. Worker → Settings → Variables:
 *        MAIN_DOMAIN = codexmattrix.com   (your live Next.js domain)
 *   4. Deploy. Public page requests are proxied to Vercel; the
 *      address bar keeps cms.codexmattrix.com/about/.
 *
 * WordPress admin + API paths are left untouched → the editor and
 * https://cms.codexmattrix.com/graphql keep working normally.
 * ============================================================
 */

const ADMIN_PREFIXES = [
  "/wp-admin",
  "/wp-login.php",
  "/wp-json",
  "/graphql",
  "/wp-content",
  "/wp-includes",
  "/index.php",
];

const STATIC_EXT = /\.(css|js|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot|pdf)$/i;

const headlessProxy = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = env.MAIN_DOMAIN || "codexmattrix.com";

    const isAdmin = ADMIN_PREFIXES.some(
      (prefix) => url.pathname === prefix || url.pathname.startsWith(prefix)
    );
    const isStatic = STATIC_EXT.test(url.pathname);

    // WordPress handles its own backend, API and static files.
    if (isAdmin || isStatic) {
      return fetch(request);
    }

    // Everything else → the Next.js app on the main domain.
    const target = `https://${host}${url.pathname}${url.search}`;
    const headers = new Headers(request.headers);
    headers.set("Host", host);

    const init = {
      method: request.method,
      headers,
      redirect: "manual",
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    };

    const origin = await fetch(target, init);
    return new Response(origin.body, {
      status: origin.status,
      headers: origin.headers,
    });
  },
};

export default headlessProxy;