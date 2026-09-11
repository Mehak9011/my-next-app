// Verify the upgraded ACF field-group JSON is valid and has GraphQL settings.
import { readFileSync } from "node:fs";

const path = new URL("../wordpress/acf-field-group.json", import.meta.url);
const group = JSON.parse(readFileSync(path, "utf8"));

console.log("VALID JSON —", group.fields.length, "top-level fields");
console.log("group.show_in_graphql:", group.show_in_graphql);

for (const f of group.fields) {
  console.log(
    `  ${f.name}  ->  graphql:${f.graphql_field_name}  show:${f.show_in_graphql}  type:${f.type}`
  );
}