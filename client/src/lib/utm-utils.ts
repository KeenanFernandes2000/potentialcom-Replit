/**
 * UTM Parameter Utilities
 * Handles preservation of UTM parameters across navigation
 */

// List of UTM parameters to preserve
const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "fbclid",
  "msclkid",
  "ttclid",
  "twclid",
  "li_fat_id",
  "ref",
  "referrer",
];

/**
 * Get current UTM parameters from URL
 */
export function getCurrentUTMParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};

  UTM_PARAMS.forEach((param) => {
    const value = params.get(param);
    if (value) {
      utmParams[param] = value;
    }
  });

  return utmParams;
}

/**
 * Get UTM parameters from sessionStorage (persistent across page loads)
 */
export function getStoredUTMParams(): Record<string, string> {
  try {
    const stored = sessionStorage.getItem("utm_params");
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn("Failed to parse stored UTM params:", error);
    return {};
  }
}

/**
 * Store UTM parameters in sessionStorage
 */
export function storeUTMParams(params: Record<string, string>): void {
  try {
    if (Object.keys(params).length > 0) {
      sessionStorage.setItem("utm_params", JSON.stringify(params));
    }
  } catch (error) {
    console.warn("Failed to store UTM params:", error);
  }
}

/**
 * Get all UTM parameters (current URL + stored)
 */
export function getAllUTMParams(): Record<string, string> {
  const currentParams = getCurrentUTMParams();
  const storedParams = getStoredUTMParams();

  // Current URL params take precedence over stored params
  const allParams = { ...storedParams, ...currentParams };

  // Store the combined params for future navigation
  storeUTMParams(allParams);

  return allParams;
}

/**
 * Add UTM parameters to a URL
 */
export function addUTMToUrl(
  url: string,
  utmParams?: Record<string, string>
): string {
  const params = utmParams || getAllUTMParams();

  if (Object.keys(params).length === 0) {
    return url;
  }

  const urlObj = new URL(url, window.location.origin);

  // Add UTM parameters to the URL
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  return urlObj.pathname + urlObj.search + urlObj.hash;
}

/**
 * Navigate to a URL while preserving UTM parameters
 */
export function navigateWithUTM(url: string): void {
  const urlWithUTM = addUTMToUrl(url);
  window.location.href = urlWithUTM;
}

/**
 * Initialize UTM tracking on page load
 */
export function initializeUTMTracking(): void {
  // Store any UTM params from the current URL
  const currentParams = getCurrentUTMParams();
  if (Object.keys(currentParams).length > 0) {
    storeUTMParams({ ...getStoredUTMParams(), ...currentParams });
  }
}

/**
 * Get UTM parameters as URL search string
 */
export function getUTMSearchString(): string {
  const params = getAllUTMParams();
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, value);
  });

  const searchString = searchParams.toString();
  return searchString ? `?${searchString}` : "";
}

/**
 * Clear stored UTM parameters
 */
export function clearStoredUTMParams(): void {
  try {
    sessionStorage.removeItem("utm_params");
  } catch (error) {
    console.warn("Failed to clear stored UTM params:", error);
  }
}

/**
 * Check if URL is internal (same domain)
 */
export function isInternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin === window.location.origin;
  } catch {
    // If URL parsing fails, assume it's a relative URL (internal)
    return !url.startsWith("http");
  }
}
