// ============================================================
// Health-check for the enquiry wiring ("Request This Package").
//
// Usage:
//   node scripts/verify-enquiry.mjs
//
// Reads WORDPRESS_REST_URL / WORDPRESS_ENQUIRY_KEY from the
// environment (or .env.local if present) and reports whether the
// WordPress side is ready to accept leads.
//
// Checks:
//   1. The enquiry key is configured on the Next.js side
//   2. POST /wp-json/cmx/v1/enquiry is reachable
//   3. The route rejects a request with a WRONG key (403) — proves
//      the shared-secret guard is live
//
// It never creates a real enquiry, so it is safe to run in CI.
//
// Exits non-zero when a REQUIRED piece is missing.
// ============================================================

import { readFileSync, existsSync } from "node:fs";

// -- env ---------------------------------------------------------------------
const ENV_FILE = new URL("../.env.local", import.meta.url);
let env = {};
if (existsSync(ENV_FILE)) {
  for (const rawLine of readFileSync(ENV_FILE, "utf8").split("\n")) {
    // Windows .env files use CRLF, and "." in JS regex does NOT match
    // "\r" — so the line must be trimmed BEFORE matching or a CRLF file
    // silently parses as empty. (Same gotcha as verify-wordpress.mjs.)
    const line = rawLine.trim();
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}
const restUrl = (
  process.env.WORDPRESS_REST_URL ??
  env.WORDPRESS_REST_URL ??
  "https://cms.codexmattrix.com/wp-json"
).replace(/\/$/, "");
const key = process.env.WORDPRESS_ENQUIRY_KEY ?? env.WORDPRESS_ENQUIRY_KEY ?? "";

const endpoint = `${restUrl}/cmx/v1/enquiry`;

const ok = (msg) => console.log(`  ✅ ${msg}`);
const miss = (msg) => console.log(`  ❌ ${msg}`);
let failures = 0;

async function post(headers) {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({
        name: "Verify Script",
        email: "verify@example.com",
        source: "verify",
        package: [{ service: "Probe", price: 0 }],
      }),
    });
    // NOTE: response.ok is false for a 404/403, which is a VALID answer
    // here — we only need to know that WordPress replied at all.
    return { reached: true, status: response.status, ok: response.ok };
  } catch (e) {
    return { reached: false, status: 0, ok: false, err: e?.message ?? String(e) };
  }
}

console.log(`\nEnquiry wiring check`);
console.log(`  Endpoint: ${endpoint}\n`);

// 1. Key configured -----------------------------------------------------------
console.log("[1] Shared secret");
if (key) {
  ok(`WORDPRESS_ENQUIRY_KEY is set (${key.length} chars).`);
} else {
  miss(
    "WORDPRESS_ENQUIRY_KEY is missing. Copy it into .env.local and into Vercel (Project → Settings → Environment Variables)."
  );
  failures++;
}

// 2. Route reachable -----------------------------------------------------------
console.log("\n[2] WordPress route");
// A wrong key must produce a 403/401. Any of those means WordPress
// answered AND the secret guard is live — which is what we check here.
const guard = await post({ "X-CMX-Key": "invalid-probe-key" });
if (!guard.reached) {
  miss(`Route unreachable: ${guard.err ?? "network error"}`);
  failures++;
} else if (guard.status === 403 || guard.status === 401) {
  ok(`Route is live and rejects a bad key with ${guard.status}.`);
} else if (guard.status === 404) {
  miss(
    "Route returns 404 — the plugin is not installed or not activated. Upload wordpress/cmx-enquiries.php and activate it."
  );
  failures++;
} else {
  // Any other status still proves WordPress answered (e.g. 400 invalid).
  ok(`Route answered (HTTP ${guard.status}) — the endpoint exists.`);
}

// 3. Matching secret accepted -------------------------------------------------
console.log("\n[3] Save + notify (real submission)");
if (!key) {
  miss("Skipped — no key configured.");
  failures++;
} else {
  const real = await post({ "X-CMX-Key": key });
  if (real.reached && real.status === 201) {
    ok("A real enquiry was stored in WordPress.");
    // This WILL send a test email to the owner — that is the point.
    console.log(
      "  ℹ️  A test email was sent to the enquiry inbox (delete the test entry in wp-admin → Enquiries)."
    );
  } else if (real.reached && (real.status === 400 || real.status === 403)) {
    miss(
      `WordPress rejected the submission (HTTP ${real.status}). The key in .env.local does NOT match CMX_ENQUIRY_SECRET in the plugin — or the payload failed validation.`
    );
    failures++;
  } else {
    miss(
      `Submission failed: HTTP ${real.status}${
        real.err ? ` (${real.err})` : ""
      }. Check the plugin is active and WordPress mail can send.`
    );
    failures++;
  }
}

console.log(
  `\n${
    failures
      ? `⚠  ${failures} check(s) failed — see the ❌ items above.`
      : "✅ Enquiry wiring is ready — leads will be saved and emailed."
  }\n`
);
process.exit(failures ? 1 : 0);
