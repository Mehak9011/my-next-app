// Compact, high-signal facts: markup vs CSS for the pricing summary card.
import fs from "node:fs";

const tsx = fs.readFileSync("app/components/pricing/DesignCalculator.tsx", "utf8").split(/\r?\n/);
const css = fs.readFileSync("app/globals.css", "utf8").split(/\r?\n/);

const show = (lines, re, label, limit = 70) => {
  console.log("\n==== " + label + " ====");
  let n = 0;
  lines.forEach((l, i) => {
    if (re.test(l) && n < limit) {
      console.log(String(i + 1).padStart(4) + "| " + l.trim().slice(0, 160));
      n++;
    }
  });
  console.log("(" + n + " lines)");
};

show(tsx, /className|summary|Package|Estimated|Total|value|label/i, "DesignCalculator.tsx", 90);
show(css, /pricing-(summary|line|row|total|est|package|item|value|label)/i, "globals.css summary selectors", 90);

// every .pricing-* selector defined, sorted, so a diff is obvious
const defs = [...css.join("\n").matchAll(/^\s*(\.pricing-[a-z0-9-]+)/gim)].map((m) => m[1]);
console.log("\nCSS defines:", [...new Set(defs)].sort().join(" "));

// classNames actually used in the pricing folder
const files = fs.readdirSync("app/components/pricing").map((f) => "app/components/pricing/" + f);
let all = "";
for (const f of files) all += fs.readFileSync(f, "utf8");
const used = [...all.matchAll(/className=(?:"([^"]+)"|\{[^}]*?"([^"]+)")/g)]
  .flatMap((m) => (m[1] || m[2] || "").split(/\s+/))
  .filter((c) => c.startsWith("pricing-") || c.startsWith("btn-"));
console.log("\nUsed   :", [...new Set(used)].sort().join(" "));
const missing = [...new Set(used)].filter((c) => !defs.includes(c));
console.log("\nUSED BUT NOT DEFINED:", missing.length ? missing.join(" ") : "(none)");

// what does the dev server actually serve for the summary?
try {
  const html = await (await fetch("http://localhost:3000/pricing")).text();
  const i = html.indexOf("Your Package");
  console.log("\n==== LIVE HTML around 'Your Package' ====");
  console.log(html.slice(Math.max(0, i - 300), i + 900).replace(/></g, ">\n<").slice(0, 1800));
} catch (e) {
  console.log("\nlive fetch failed:", e.message);
}
