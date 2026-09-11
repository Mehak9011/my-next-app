// Show the exact bytes around the JSON.parse failure position to pinpoint
// the structural problem in acf-field-group.json.
import { readFileSync } from "node:fs";

const path = new URL("../wordpress/acf-field-group.json", import.meta.url);
const text = readFileSync(path, "utf8");
const pos = 8483;
console.log("--- chars around", pos, "---");
console.log(JSON.stringify(text.slice(pos - 120, pos + 120)));

// Count braces/brackets up to that position and beyond.
let up = 0, all = 0;
for (let i = 0; i < text.length; i++) {
  const c = text[i];
  if (c === "{" || c === "[") { all++; if (i < pos) up++; }
  else if (c === "}" || c === "]") { all--; if (i < pos) up--; }
}
console.log("balance before pos:", up, "| full-file balance:", all);