// Compact diagnostic: what does the running dev server actually serve?
const url = "http://localhost:3000/pricing";

const stripTags = (s) => s.replace(/<[^>]+>/g, "|").replace(/\|+/g, "|");

try {
  const html = await (await fetch(url)).text();

  // 1. summary card region from server HTML
  const i = html.indexOf("Estimated Investment");
  console.log("=== SERVER HTML: summary card ===");
  console.log(i > -1 ? stripTags(html.slice(i - 700, i + 900)) : "NOT FOUND");

  // 2. CSS files referenced
  const cssHrefs = [...html.matchAll(/href="([^"]+\.css[^"]*)"/g)].map((m) => m[1]);
  console.log("\n=== CSS HREFS ===");
  console.log(cssHrefs.join("\n") || "none (dev inlines styles?)");

  // 3. Look for the summary rules in served CSS
  let all = "";
  for (const h of cssHrefs) {
    const u = h.startsWith("http") ? h : "http://localhost:3000" + h;
    all += await (await fetch(u)).text() + "\n";
  }
  const names = ["pricing-summary", "pricing-row", "pricing-total", "pricing-switch", "pricing-calc-grid"];
  console.log("\n=== SERVED CSS: selector hits ===");
  for (const n of names) {
    const c = (all.match(new RegExp("\\." + n + "\\b", "g")) || []).length;
    console.log(`${n}: ${c}`);
  }
  const m = all.indexOf(".pricing-summary");
  if (m > -1) {
    console.log("\n=== .pricing-summary rule in served CSS ===");
    console.log(all.slice(m, m + 1200));
  } else {
    console.log("\n.pricing-summary NOT present in served CSS");
  }
} catch (e) {
  console.log("ERROR: " + e.message);
}
