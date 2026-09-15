// CodeXmattriX CMS -> Next.js reverse proxy
// Cloudflare Worker route:
//   cms.codexmattrix.com/*
// Frontend pages are rendered by Vercel/Next.js while the browser
// keeps the cms.codexmattrix.com URL.
// WordPress admin/API paths continue to go to WordPress.

const NEXT_ORIGIN = "https://my-next-app-phi-flax.vercel.app";
const CMS_ORIGIN = "https://cms.codexmattrix.com";

const WP_PATHS = [
  "/wp-admin", "/wp-login.php", "/wp-json", "/graphql",
  "/wp-content", "/wp-includes", "/wp-cron.php"
];

function isWordPressPath(pathname) {
  return WP_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/") || pathname.startsWith(prefix + "?"));
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Keep WordPress admin, login and APIs on the CMS origin.
    if (isWordPressPath(url.pathname)) {
      return fetch(request);
    }

    // Proxy public frontend routes to Next.js/Vercel.
    const target = new URL(url.pathname + url.search, NEXT_ORIGIN);
    const headers = new Headers(request.headers);

    // The upstream should see the Vercel hostname, not the CMS hostname.
    headers.set("host", new URL(NEXT_ORIGIN).host);
    headers.set("x-forwarded-host", url.host);
    headers.set("x-forwarded-proto", url.protocol.replace(":", ""));

    const upstreamRequest = new Request(target.toString(), {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "manual",
    });

    const response = await fetch(upstreamRequest);

    // Rewrite absolute redirects back to the CMS hostname so the browser
    // does not leave cms.codexmattrix.com.
    const location = response.headers.get("location");
    if (location) {
      try {
        const redirectUrl = new URL(location, NEXT_ORIGIN);
        if (redirectUrl.host === new URL(NEXT_ORIGIN).host) {
          redirectUrl.host = url.host;
          redirectUrl.protocol = url.protocol;
          const outHeaders = new Headers(response.headers);
          outHeaders.set("location", redirectUrl.toString());
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: outHeaders,
          });
        }
      } catch {
        // Keep the original response if Location is not an absolute URL.
      }
    }

    return response;
  },
};
