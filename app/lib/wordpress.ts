const WORDPRESS_GRAPHQL_URL =
  process.env.WORDPRESS_GRAPHQL_URL;

export async function fetchWordPress<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  if (!WORDPRESS_GRAPHQL_URL) {
    throw new Error(
      "WORDPRESS_GRAPHQL_URL is not configured"
    );
  }

  const response = await fetch(
    WORDPRESS_GRAPHQL_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `WordPress API error: ${response.status}`
    );
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(
      result.errors
        .map((error: { message: string }) => error.message)
        .join(", ")
    );
  }

  return result.data;
}