// Diagnostic: find lines where a JSON object/array element is closed with `}`
// or `]` and the next non-comment line opens a new element, but no comma
// separates them (i.e., missing commas that make the JSON invalid).
// Handles CRLF line endings (the file uses \r\n).
import { readFileSync } from "node:fs";

const path = new URL("../wordpress/acf-field-group.json", import.meta.url);
const lines = readFileSync(path, "utf8").split("\n");

for (let i = 0; i < lines.length; i++) {
  const trimmed = lines[i].trim(); // trims spaces, tabs AND \r
  const next = lines[i + 1]?.trim() ?? "";

  const thisCloses = trimmed === "}" || trimmed === "]";
  const nextOpens = next.startsWith("{") || next.startsWith("]");
  const noComma = !trimmed.endsWith(",");

  if (thisCloses && nextOpens && noComma) {
    console.log(
      `MISSING COMMA after line ${i + 1}: ${JSON.stringify(trimmed)}  ->  ${JSON.stringify(next)}`
    );
  }
}