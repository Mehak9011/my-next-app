// ============================================================
// Integration health-check for the Headless WordPress setup.
//
// Usage:
//   node scripts/verify-wordpress.mjs
//
// Reads WORDPRESS_GRAPHQL_URL / WORDPRESS_REST_URL from the
// environment (or .env.local if present) and reports whether the
// WordPress "page registry" is ready for Next.js.
//
// Checks:
//   1. WPGraphQL endpoint reachable
//   2. Page registry returns published pages (the URL list)
//   3. Key routes (/home/, /about/, /contact/) resolve
//   4. REST fallback (wp-json) is reachable
//
// Exits non-zero when a REQUIRED piece is missing.
// ============================================================

import { readFileSync, existsSync } from "node:fs";

// -- env ---------------------------------------------------------------------
const ENV_FILE = new URL("../.env.local", import.meta.url);
let env = {};
if (existsSync(ENV_FILE)) {
  for (const line of readFileSync(ENV_FILE, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}
const graphqlUrl =
  process.env.WORDPRESS_GRAPHQL_URL ??
  env.WORDPRESS_GRAPHQL_URL ??
  "https://cms.codexmattrix.com/graphql";
const restUrl =
  process.env.WORDPRESS_REST_URL ??
  env.WORDPRESS_REST_URL ??
  "https://cms.codexmattrix.com/wp-json";

const ok = (msg) => console.log(`  ✅ ${msg}`);
const miss = (msg) => console.log(`  ❌ ${msg}`);
let failures = 0;

async function gql(query, variables) {
  const res = await fetch(graphqlUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

console.log(`\nHeadless WordPress integration check`);
console.log(`  GraphQL: ${graphqlUrl}`);
console.log(`  REST:    ${restUrl}\n`);

// 1. WPGraphQL reachable -----------------------------------------------------
console.log("[1] WPGraphQL endpoint");
try {
  const r = await gql(`{ __typename }`);
  if (r?.data?.__typename) {
    ok("WPGraphQL is reachable and answering queries.");
  } else {
    miss("WPGraphQL reachable but returned an unexpected shape.");
    failures++;
  }
} catch (e) {
  miss(`WPGraphQL not reachable: ${e?.message ?? String(e)}`);
  failures++;
}

// 2. Page registry (WordPress manages the URLs) ------------------------------
console.log("\n[2] Page registry — published pages");
let registry = [];
try {
  const r = await gql(
    `query PageRegistry($first: Int!) { pages(first: $first) { nodes { slug uri title } } }`,
    { first: 100 }
  );
  registry = r?.data?.pages?.nodes ?? [];
} catch {
  /* counted below */
}
if (registry.length) {
  const slugs = registry.map((p) => p.slug).join(", ");
  ok(`${registry.length} pages registered: ${slugs}`);
} else {
  miss(
    "registry returned no pages. Create blank Pages in wp-admin (Home, About, Contact...) — the page body stays empty; the slug IS the URL."
  );
  failures++;
}

// 3. Key routes resolve via pageBy -------------------------------------------
console.log("\n[3] Route resolution (pageBy uri)");
for (const expected of ["home", "about", "contact", "services", "pricing", "faq", "process", "case-studies"]) {
  try {
    // The CMS uses plain permalinks -> try /slug/ and /index.php/slug/.
    const uris = [`/${expected}/`, `/index.php/${expected}/`];
    let found = null;
    for (const uri of uris) {
      const r = await gql(
        `query PageByUri($uri: String!) { pageBy(uri: $uri) { slug } }`,
        { uri }
      );
      if (r?.data?.pageBy?.slug) {
        found = uri;
        break;
      }
    }
    if (found) {
      ok(`/${expected}/ → published ✓ (resolved as ${found})`);
    } else {
      miss(
        `/${expected}/ → not found. Create a blank page with slug '${expected}'.`
      );
      if (expected === "home") failures++;
    }
  } catch (e) {
    miss(`/${expected}/ → GraphQL error: ${e?.message ?? String(e)}`);
    if (expected === "home") failures++;
  }
}

// 4. REST fallback (optional) -------------------------------------------------
console.log("\n[4] REST API (fallback)");
try {
  const pages = await (await fetch(`${restUrl}/wp/v2/pages?per_page=1`)).json();
  if (Array.isArray(pages)) {
    ok("/wp/v2/pages is reachable.");
  } else {
    miss("REST /wp/v2/pages returned an unexpected shape.");
  }
} catch (e) {
  miss(`REST /wp/v2/pages not reachable: ${e?.message ?? String(e)}`);
  failures++;
}

console.log(
  `\n${
    failures
      ? `⚠  ${failures} required check(s) failed — see the ❌ items above.`
      : "✅ WordPress registry is ready — Next.js will resolve every registered URL."
  }\n`
);
process.exit(failures ? 1 : 0);