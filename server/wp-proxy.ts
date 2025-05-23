import fetch from "node-fetch";

const WP_API_BASE_URL = "https://potential.com/wp-json/wp/v2";

/**
 * Check if text contains Arabic characters
 */
function containsArabic(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
}

/**
 * Proxy requests to WordPress API with proper handling of parameters
 *
 * @param endpoint The WordPress API endpoint path
 * @param queryParams Object containing query parameters
 * @returns Response data and headers
 */
export async function proxyWordPressRequest(
  endpoint: string,
  queryParams: Record<string, string> = {}
) {
  try {
    // Ensure endpoint has leading slash
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;

    // Check if we have a slug and it contains Arabic
    const slug = queryParams.slug;
    if (slug && containsArabic(slug)) {
      // Force Arabic language for Arabic slugs
      queryParams.lang = "ar";
      console.log(`[WP-PROXY] Detected Arabic slug: ${slug}, forcing lang=ar`);
    }

    // Build URL with proper encoding of parameters
    const queryString = new URLSearchParams();

    // Add all query parameters
    for (const [key, value] of Object.entries(queryParams)) {
      queryString.append(key, value);
    }

    // Create the full URL
    const url = `${WP_API_BASE_URL}${normalizedEndpoint}?${queryString.toString()}`;

    // Log the request details
    console.log(`[WP-PROXY] WordPress API request: ${url}`);
    console.log(
      `[WP-PROXY] Language parameter: ${queryParams.lang || "not set"}`
    );

    // Make the request to WordPress
    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `[WP-PROXY] WordPress API error: ${response.status} ${response.statusText}`
      );
      throw new Error(
        `WordPress API responded with status: ${response.status}`
      );
    }

    // Get the total pages from headers if available
    const totalPages = response.headers.get("X-WP-TotalPages");

    // Parse the response JSON
    const data = await response.json();

    // For debugging, log post titles if present
    if (Array.isArray(data) && data.length > 0 && data[0].title) {
      console.log(
        `[WP-PROXY] Received posts, first title: ${data[0].title.rendered}`
      );
      if (queryParams.lang === "ar") {
        console.log(`[WP-PROXY] Arabic post found: ${data[0].title.rendered}`);
      }
    }

    // Return the data and headers
    return {
      data,
      headers: {
        totalPages: totalPages || "1",
      },
    };
  } catch (error) {
    console.error("[WP-PROXY] WordPress proxy error:", error);
    throw new Error(
      `Failed to fetch from WordPress: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
