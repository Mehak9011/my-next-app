// One-off: add WPGraphQL for ACF (AxePress) settings to acf-field-group.json.
// Adds `show_in_graphql: 1` + `graphql_field_name` (camelCase) to the field
// group and every field/subfield, so importing the JSON auto-enables the
// fields in the GraphQL schema with the same names homeQuery already uses.
import { readFileSync, writeFileSync } from "node:fs";

const path = new URL("../wordpress/acf-field-group.json", import.meta.url);
const group = JSON.parse(readFileSync(path, "utf8"));

const toCamel = (name) => name.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

function decorateField(field) {
  field.show_in_graphql = 1;
  field.graphql_field_name = toCamel(field.name);
  if (Array.isArray(field.sub_fields)) {
    field.sub_fields.forEach(decorateField);
  }
}

group.show_in_graphql = 1;
group.fields.forEach(decorateField);

writeFileSync(path, JSON.stringify(group, null, 2) + "\n", "utf8");
console.log(
  "Upgraded field group with graphql_field_name for",
  group.fields.length,
  "top-level fields."
);