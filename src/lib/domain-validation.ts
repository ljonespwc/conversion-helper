/**
 * Domain Validation Utilities
 *
 * Used to validate that requests using group_id come from allowed domains.
 * Extracts base domain from organization's website_url and checks against request origin.
 */

/**
 * Extract base domain from a URL (removes www. and subdomains)
 * e.g., "https://www.precisionnutrition.com/" -> "precisionnutrition.com"
 * e.g., "https://easyask.io" -> "easyask.io"
 */
export function extractBaseDomain(url: string): string | null {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    // Split by dots and get last two parts (or last part for TLDs like .io)
    const parts = hostname.split('.')

    // Handle common TLDs - take last 2 parts
    // This works for: example.com, example.io, example.co.uk (though co.uk would need special handling)
    if (parts.length >= 2) {
      return parts.slice(-2).join('.')
    }

    return hostname
  } catch {
    return null
  }
}

/**
 * Extract hostname from origin/referer URL
 */
export function extractHostname(url: string): string | null {
  try {
    const parsed = new URL(url)
    return parsed.hostname.toLowerCase()
  } catch {
    return null
  }
}

/**
 * Check if a request origin matches the allowed base domain
 *
 * @param requestOrigin - The origin or referer header from the request
 * @param allowedWebsiteUrl - The organization's website_url (e.g., "https://www.precisionnutrition.com")
 * @returns true if the request origin matches the allowed domain
 *
 * Examples with allowedWebsiteUrl = "https://www.precisionnutrition.com":
 * - "https://www.precisionnutrition.com" -> true
 * - "https://precisionnutrition.com" -> true
 * - "https://burrito.staging.precisionnutrition.com" -> true
 * - "https://evil-site.com" -> false
 * - "https://precisionnutrition.com.evil.com" -> false
 */
export function isAllowedDomain(requestOrigin: string | null, allowedWebsiteUrl: string | null): boolean {
  if (!requestOrigin || !allowedWebsiteUrl) {
    return false
  }

  const baseDomain = extractBaseDomain(allowedWebsiteUrl)
  const requestHostname = extractHostname(requestOrigin)

  if (!baseDomain || !requestHostname) {
    return false
  }

  // Check if request hostname is exactly the base domain
  // or ends with .baseDomain (for subdomains)
  return requestHostname === baseDomain ||
         requestHostname.endsWith(`.${baseDomain}`)
}

/**
 * Get the origin from request headers (tries Origin first, then Referer)
 */
export function getRequestOrigin(request: Request): string | null {
  const origin = request.headers.get('origin')
  if (origin) {
    return origin
  }

  const referer = request.headers.get('referer')
  if (referer) {
    // Extract origin from referer (protocol + host)
    try {
      const parsed = new URL(referer)
      return `${parsed.protocol}//${parsed.host}`
    } catch {
      return null
    }
  }

  return null
}
