import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Everything ESLint must never look at. Without these, `eslint` (which
  // our `npm run lint` runs with no path) walks generated output — the
  // `.next` cache, the local Chrome audit profiles and the throwaway
  // scripts at the repo root — and reports thousands of bogus problems
  // that break CI while the actual source is clean.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Local audit/browser tooling and scratch output.
    ".cline-*/**",
    ".cline-*",
    "**/*.log",

    // Repo-root scratch files that are not part of the app.
    "classdiff*.mjs",
    "diag-now.mjs",
    "facts.mjs",

    // Generated types cache and deploy metadata.
    "*.tsbuildinfo",
    ".vercel/**",
  ]),
]);

export default eslintConfig;
