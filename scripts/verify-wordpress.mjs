// Integration health-check against a live WordPress.
//
// Usage:
//   node scripts/verify-wordpress.mjs
//
// Reads WORDPRESS_GRAPHQL_URL / WORDPRESS_REST_URL from the environment
// (or .env.local if present via --env) and reports what the data layer can
// and cannot use, so you know exactly which WordPress pieces still need
// configuring. Exits non-zero when required pieces are missing.
//
// Checks:
//   1. WPGraphQL reachable
//   2. Home page resolvable (any candidate URI the data layer tries)
//   3. `acf` field exposed (WPGraphQL for ACF plugin)
//   4. Testimonial CPT exposed (wp-content/mu-plugins/codexmattrix-testimonials.php)
//   5. REST API reaches the Home page + testimonials endpoint

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

async function gql(query) {
  const res = await fetch(graphqlUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

console.log(`\nWordPress integration check`);
console.log(`  GraphQL: ${graphqlUrl}`);
console.log(`  REST:    ${restUrl}\n`);

// 1. WPGraphQL reachable -----------------------------------------------------
console.log("[1] WPGraphQL endpoint");
try {
  const r = await gql(`{ __typename }`);
  if (r?.data?.__typename === "Query") {
    ok("WPGraphQL is reachable and answering queries.");
  } else {
    miss("WPGraphQL reachable but returned an unexpected shape.");
    failures++;
  }
} catch (e) {
  miss(`WPGraphQL not reachable: ${e?.message ?? String(e)}`);
  failures++;
}

// 2. Home page resolvable via the same URIs the data layer tries -------------
console.log("\n[2] Home page resolution");
const candidates = ["/index.php/home/", "/home/", "/"];
let foundUri = null;
for (const uri of candidates) {
  const r = await gql(
    `{ pageBy(uri: ${JSON.stringify(uri)}) { title status } }`
  );
  if (r?.data?.pageBy) {
    foundUri = uri;
    ok(`Home page found at URI "${uri}" (title: ${r.data.pageBy.title})`);
    break;
  }
}
if (!foundUri) {
  miss(
    "No Home page found. Create a page with slug 'home' and/or set it as the static front page (Settings → Reading)."
  );
  failures++;
}

// 3. ACF exposed -------------------------------------------------------------
console.log("\n[3] ACF fields (WPGraphQL for ACF plugin)");
if (foundUri) {
  const r = await gql(
    `{ pageBy(uri: ${JSON.stringify(foundUri)}) { acf { heroTitle } } }`
  );
  if (r?.data?.pageBy?.acf) {
    ok(`'acf' is exposed. heroTitle = "${r.data.pageBy.acf.heroTitle ?? "(empty)"}"`);
  } else if (r?.errors?.length) {
    miss(
      `'acf' is NOT exposed. Error: ${r.errors[0].message}. Install "WPGraphQL for Advanced Custom Fields" (AxePress) and re-import wordpress/acf-field-group.json.`
    );
    failures++;
  } else {
    miss("'acf' is exposed but returned no data — fill in the Home page fields in wp-admin.");
  }
}

// 4. Testimonial CPT ---------------------------------------------------------
console.log("\n[4] Testimonials CPT");
try {
  const r = await gql(`{ testimonials(first: 1) { nodes { title } } }`);
  if (r?.data?.testimonials) {
    ok(
      "'testimonials' is exposed in GraphQL (mu-plugin active). Add client testimonials in wp-admin → Testimonials."
    );
  } else if (r?.errors?.length) {
    miss(
      `'testimonials' NOT in GraphQL. Copy wordpress/codexmattrix-testimonials.php into wp-content/mu-plugins/. Error: ${r.errors[0].message}`
    );
    failures++;
  }
} catch {
  miss("Could not query testimonials.");
  failures++;
}

// 5. REST fallback -----------------------------------------------------------
console.log("\n[5] REST API (fallback path)");
try {
  const pages = await (await fetch(`${restUrl}/wp/v2/pages?slug=home`)).json();
  if (pages.length) {
    ok(`REST finds the Home page (id ${pages[0].id}).`);
  } else {
    miss("REST does not find a page with slug 'home'.");
    failures++;
  }
} catch (e) {
  miss(`REST pages unreachable: ${e?.message ?? String(e)}`);
  failures++;
}
try {
  const t = await (await fetch(`${restUrl}/wp/v2/testimonial?per_page=1`)).json();
  if (Array.isArray(t)) {
    ok("REST exposes /wp/v2/testimonial (mu-plugin active).");
  } else {
    miss("REST /wp/v2/testimonial not available (mu-plugin missing).");
    failures++;
  }
} catch {
  miss("REST /wp/v2/testimonial not available (mu-plugin missing).");
  failures++;
}

console.log(
  `\n${failures ? `⚠  ${failures} check(s) failed — see the ❌ items above.` : "✅ All checks passed — the Home Page is fully connected to WordPress."}\n`
);
process.exit(failures ? 1 : 0);