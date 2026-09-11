// Deeper probes for the integration
async function gql(query) {
  const res = await fetch("https://cms.codexmattrix.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return { status: res.status, body: await res.json() };
}

// A. URI formats WPGraphQL expects
for (const uri of ["/home/", "/index.php/home/", "home"]) {
  const r = await gql(`{ pageBy(uri: ${JSON.stringify(uri)}) { title id uri } }`);
  console.log(`--- A. pageBy(uri: ${JSON.stringify(uri)}) ---`);
  console.log(JSON.stringify(r.body));
}

// B. ID lookup (always works if the page exists)
const byId = await gql(`{ page(id: 14, idType: DATABASE_ID) { title id uri status } }`);
console.log("--- B. page(DATABASE_ID: 14) ---");
console.log(JSON.stringify(byId.body));

// C. All root query fields — is "testimonials" there at all?
const schema = await gql(`{ __schema { queryType { fields { name } } } }`);
console.log("--- C. RootQuery fields ---");
const fields = schema.body?.data?.__schema?.queryType?.fields?.map((f) => f.name) ?? [];
console.log(fields.length, "fields:", fields.join(", "));

// D. Is ACF active at all? Check the Page type fields for anything ACF-like
const pageType = await gql(`{ __type(name: "Page") { fields { name } } }`);
console.log("--- D. Page type fields ---");
const pageFields =
  pageType.body?.data?.__type?.fields?.map((f) => f.name) ?? [];
console.log(pageFields.length, "fields:", pageFields.join(", "));