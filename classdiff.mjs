// TEMP: diff className usage in pricing components against selectors defined in globals.css
import fs from "node:fs";
import path from "node:path";

const compDir = "app/components/pricing";
const files = fs.readdirSync(compDir).filter((f) => f.endsWith(".tsx"));
const srcCss = fs.readFileSync("app/globals.css", "utf8");
const srcLines = srcCss.split(/\r?\n/);

const used = new Map();
// className="a b" | className={"a b"} | className={`a b`}
const re = /className=(?:"([^"]*)"|\{\s*"([^"]*)"\s*\}|\{`([^`]*)`\})/g;
for (const f of files) {
  const t = fs.readFileSync(path.join(compDir, f), "utf8");
  let m;
  while ((m = re.exec(t))) {
    const s = m[1] ?? m[2] ?? m[3] ?? "";
    for (const token of s.split(/\s+/)) {
      const clean = token.replace(/\$\{[^}]*\}/g, "").trim();
      if (!clean || clean.includes("(")) continue;
      if (!used.has(clean)) used.set(clean, new Set());
      used.get(clean).add(f);
    }
  }
}

const defined = new Set((srcCss.match(/\.(-?[_a-zA-Z][\w-]*)/g) || []).map((s) => s.slice(1)));
const missing = [...used.keys()].filter((c) => !defined.has(c)).sort();

console.log("=== USED in pricing components but NOT DEFINED in globals.css ===");
if (!missing.length) console.log("  (none)");
for (const c of missing) console.log(`  ${c}  <- ${[...used.get(c)].join(", ")}`);

console.log("");
console.log("=== selectors defined in globals.css that mention 'summary' or 'plan' or 'switch' ===");
srcLines.forEach((l, i) => {
  if (/^\s*[.#][\w-]*(summary|plan|switch|tab)[\w-]*[\s,{]/.test(l)) {
    console.log(`  ${i + 1}: ${l.trim()}`);
  }
});

console.log("");
console.log("=== every line containing 'pricing-summary' ===");
srcLines.forEach((l, i) => {
  if (l.includes("pricing-summary")) console.log(`  ${i + 1}: ${l.trim()}`);
});
