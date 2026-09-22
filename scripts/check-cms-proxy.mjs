// CMS proxy status check — usage: node scripts/check-cms-proxy.mjs [base-url]

const base = (process.argv[2] ?? "https://cms.codexmattrix.com").replace(/\/$/, "");

const ok = (m) => console.log(`  ✅ ${m}`);
const miss = (m) => console.log(`  ❌ ${m}`);
const info = (m) => console.log(`  ℹ️  ${m}`);

async function fetchText(url) {
  const res = await fetch(url, { redirect: "manual" });
  const text = await res.text().catch(() => "");
  return { res, text };
}

/** Heuristic: does this HTML look like our Next.js build? */
function looksLikeNextJs(html) {
  return (
    html.includes("Envision. Design. Code.") ||
    html.includes("__next") ||
    html.includes("/_next/static") ||
    html.includes("CodeXmattriX — Envision")
  );
}

/** Heuristic: does this HTML look like the WordPress theme? */
function looksLikeWordPress(html) {
  return (
    html.includes("wp-content") ||
    html.includes("wp-includes") ||
    html.includes("Edit Page") ||
    (html.includes("<title>Cms") && !looksLikeNextJs(html))
  );
}

async function checkPage(label, url) {
  console.log(`\n[${label}] ${url}`);
  try {
    const { res, text } = await fetchText(url);
    const proxyHeader =
      res.headers.get("x-cmx-proxy") ?? res.headers.get("X-CMX-Proxy");
    info(`status=${res.status} bytes=${text.length}`);
    if (proxyHeader) ok(`X-CMX-Proxy header present (${proxyHeader})`);
    else miss("X-CMX-Proxy header missing — request did NOT go through proxy.php");
    const loc = res.headers.get("location");
    if (loc) info(`location → ${loc}`);
    if (looksLikeNextJs(text)) ok("body looks like Next.js (Vercel) ✅");
    else if (looksLikeWordPress(text)) miss("body looks like the WordPress theme");
    else miss("body matches neither Next.js nor WordPress heuristics");
    console.log(`  preview: ${text.slice(0, 160).replace(/\s+/g, " ")}…`);
  } catch (e) {
    miss(`fetch failed: ${e?.message ?? String(e)}`);
  }
}

console.log(`\nCMS proxy check — ${base}`);
await checkPage("home", `${base}/`);
await checkPage("about", `${base}/about/`);
await checkPage(
  "proxy direct-hit (works even before .htaccess)",
  `${base}/proxy.php?_cmx=1&cmx_path=/about/`
);

console.log(`
How to read this:
  • home/about show Next.js + X-CMX-Proxy header  → proxy is LIVE ✅
  • home/about show WordPress theme, no header     → .htaccess not installed yet
  • only the direct-hit shows Next.js              → proxy.php uploaded OK,
    just replace the site-root .htaccess with Variant 1 of
    wordpress/htaccess-frontend-proxy.txt
`);
