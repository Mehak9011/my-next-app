import fs from "node:fs";
import path from "node:path";
const files = [];
for (const d of ["app/components/pricing", "app/pricing", "app/components/ui"]) {
  for (const f of fs.readdirSync(d)) if (f.endsWith(".tsx")) files.push(path.join(d, f));
}
const css = fs.readFileSync("app/globals.css", "utf8");
const cssClasses = new Set();
for (const m of css.matchAll(/\.([a-zA-Z_][\w-]*)/g)) cssClasses.add(m[1]);
console.log("=== css classes matching summary|plan|pricing ===");
console.log([...cssClasses].filter((c) => /summary|plan|pricing/.test(c)).sort().join("\n"));
console.log("");
console.log("=== css RULES for summary ===");
for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  if (/summary/i.test(m[1])) console.log(m[1].trim().replace(/\s+/g, " ") + " {" + m[2].trim().replace(/\s+/g, " ") + "}");
}
console.log("");
console.log("=== classes USED in calculator (with css-rule presence) ===");
const t = fs.readFileSync("app/components/pricing/DesignCalculator.tsx", "utf8");
for (const m of t.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{"([^"]*)"\})/g)) {
  const raw = m[1] || m[2] || m[3] || "";
  for (const c of raw.split(/\s+/)) {
    const cl = c.replace(/\$\{[^}]*\}/g, "").trim();
    if (!cl || !/^[a-z][\w-]*$/i.test(cl)) continue;
    console.log((cssClasses.has(cl) ? "OK   " : "MISS ") + cl);
  }
}
