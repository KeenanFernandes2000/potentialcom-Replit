/**
 * Utility function to check if text contains Arabic characters
 *
 * @param text Text to check for Arabic characters
 * @returns True if the text contains Arabic characters
 */
export function containsArabic(text: string): boolean {
  // Arabic Unicode range: U+0600 to U+06FF
  // Additional Arabic presentation forms: U+FB50 to U+FDFF and U+FE70 to U+FEFF
  const arabicRegex = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
}

/**
 * Utility function to detect language based on text content
 *
 * @param text Text to analyze
 * @returns "ar" if text contains Arabic, "en" otherwise
 */
export function detectLanguage(text: string): "en" | "ar" {
  return containsArabic(text) ? "ar" : "en";
}

/**
 * Utility function to format URL with language parameter only if needed
 *
 * @param baseUrl Base URL without query parameters
 * @param slug Post slug
 * @returns URL with language parameter if slug is Arabic
 */
export function formatUrlWithLanguage(baseUrl: string, slug: string): string {
  const isArabic = containsArabic(slug);

  if (isArabic) {
    console.log(
      `[UTIL] Detected Arabic slug: ${slug}, adding language parameter`
    );
    return `${baseUrl}/?lang=ar`;
  } else {
    return baseUrl;
  }
}
