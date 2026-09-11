// Probe: does idType SLUG resolve the home page? Is ACF exposed anywhere?
async function gql(query) {
  const res = await fetch("https://cms.codexmattrix.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return { status: res.status, body: await res.json() };
}

// A. SLUG idType — does it bypass the /index.php permalink problem?
const a = await gql(`{ page(id: "home", idType: SLUG) { title id uri } }`);
console.log("--- A. page(id: 'home', idType: SLUG) ---");
console.log(JSON.stringify(a.body));

// B. What acf fields exist on the home page via the working URI
const b = await gql(`{ pageBy(uri: "/index.php/home/") { title } }`);
console.log("--- B. pageBy(uri: '/index.php/home/') acf check ---");
console.log(JSON.stringify(b.body));

// C. Is there any ACF-related root query? Scan a few candidates.
for (const root of ["acfOptions", "acf", "options"]) {
  const c = await gql(`{ ${root}(first: 1) { nodes { id } } }`);
  console.log(`--- C. ${root} root query ---`, JSON.stringify(c.body?.errors?.[0]?.message ?? "OK/unknown"));
}

// D. Are there ANY custom post types with GraphQL? List post types.
const d = await gql(`{ __type(name: "WpContentNode") { possibleTypes { name } } }`);
console.log("--- D. Content node types ---");
const names = d.body?.data?.__type?.possibleTypes?.map((t) => t.name) ?? [];
console.log(names.length, "types:", names.join(", "));