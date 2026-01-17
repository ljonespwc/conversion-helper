/**
 * URL Pattern Matching Utilities
 *
 * Supports simple wildcard patterns for widget page matching:
 * - "*" matches any characters in a single path segment
 * - Examples:
 *   - "https://example.com/blog/*" matches "/blog/post-1", "/blog/my-article"
 *   - "https://example.com/STAR/pricing" matches "/product/pricing", "/service/pricing"
 */

/**
 * Check if a string contains wildcard characters
 */
export function isWildcardPattern(url: string): boolean {
  return url.includes('*')
}

/**
 * Escape special regex characters in a string (except asterisk)
 */
function escapeRegexChars(str: string): string {
  // Escape each special regex character individually
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\./g, '\\.')
    .replace(/\+/g, '\\+')
    .replace(/\?/g, '\\?')
    .replace(/\^/g, '\\^')
    .replace(/\$/g, '\\$')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\|/g, '\\|')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
}

/**
 * Convert a URL pattern to a RegExp for matching
 * @param pattern - URL with asterisk wildcards
 * @returns RegExp that matches the pattern
 */
function patternToRegExp(pattern: string): RegExp {
  // Escape special regex characters except asterisk
  const escaped = escapeRegexChars(pattern)
  // Replace asterisk with regex for any characters except /
  const regexStr = escaped.replace(/\*/g, '[^/]*')
  return new RegExp('^' + regexStr + '$')
}

/**
 * Check if a URL matches a pattern with simple wildcards
 * @param pattern - URL with asterisk wildcards (e.g., https://example.com/blog/*)
 * @param url - Actual URL to test
 * @returns true if URL matches pattern
 */
export function urlMatchesPattern(pattern: string, url: string): boolean {
  // Exact match check first (for non-pattern URLs)
  if (!isWildcardPattern(pattern)) {
    return normalizeForComparison(pattern) === normalizeForComparison(url)
  }

  // Normalize both URLs for comparison
  const normalizedPattern = normalizeForComparison(pattern)
  const normalizedUrl = normalizeForComparison(url)

  try {
    const regex = patternToRegExp(normalizedPattern)
    return regex.test(normalizedUrl)
  } catch {
    // If regex creation fails, fall back to exact match
    return normalizedPattern === normalizedUrl
  }
}

/**
 * Normalize URL for pattern comparison
 * - Removes trailing slashes (except for root URLs)
 * - Removes query strings and fragments for matching purposes
 * - Lowercases the hostname
 */
function normalizeForComparison(url: string): string {
  try {
    const parsed = new URL(url)
    // Lowercase the hostname
    let normalized = parsed.protocol + '//' + parsed.host.toLowerCase()

    // Add pathname, removing trailing slash unless it's the root
    let pathname = parsed.pathname
    if (pathname !== '/' && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1)
    }
    normalized += pathname

    return normalized
  } catch {
    // If URL parsing fails, return as-is
    return url
  }
}

/**
 * Find the first matching pattern from a list of patterns
 * Returns exact matches first (more specific), then wildcard matches
 *
 * @param url - Actual URL to match
 * @param patterns - Array of URL patterns to check
 * @returns The matching pattern, or null if no match
 */
export function findMatchingPattern(url: string, patterns: string[]): string | null {
  const normalizedUrl = normalizeForComparison(url)

  // First, try exact matches (more specific = higher priority)
  for (const pattern of patterns) {
    if (!isWildcardPattern(pattern)) {
      if (normalizeForComparison(pattern) === normalizedUrl) {
        return pattern
      }
    }
  }

  // Then, try wildcard patterns
  // Sort by specificity: more path segments and fewer wildcards = more specific
  const wildcardPatterns = patterns
    .filter(isWildcardPattern)
    .sort((a, b) => {
      // Count path segments (more = more specific)
      const segmentsA = a.split('/').length
      const segmentsB = b.split('/').length
      if (segmentsB !== segmentsA) return segmentsB - segmentsA

      // Count wildcards (fewer = more specific)
      const wildcardsA = (a.match(/\*/g) || []).length
      const wildcardsB = (b.match(/\*/g) || []).length
      return wildcardsA - wildcardsB
    })

  for (const pattern of wildcardPatterns) {
    if (urlMatchesPattern(pattern, url)) {
      return pattern
    }
  }

  return null
}
