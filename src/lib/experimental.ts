/**
 * Experimental Feature Flags
 *
 * This file defines pages/orgs that use experimental widget behavior.
 * All experimental code checks this list - easy to find and remove later.
 *
 * To add an org: Add its name to EXPERIMENTAL_ORGS array
 * To add a page: Add its URL to EXPERIMENTAL_PAGES array
 * To remove experiment: Delete this file and grep for "isExperimental"
 */

// Organization names that use experimental mode (all their pages)
export const EXPERIMENTAL_ORGS: string[] = [
  // Empty - experimental features are now the default
]

// Page URLs that use experimental mode (for specific pages regardless of org)
export const EXPERIMENTAL_PAGES: string[] = [
  // 'https://example.com/specific-page',
]

/**
 * Check if experimental mode should be enabled
 * Returns true if the org is experimental OR the specific page URL is experimental
 */
export function isExperimentalPage(pageUrl: string | undefined, orgName?: string): boolean {
  // Check org first (all pages for this org are experimental)
  if (orgName && EXPERIMENTAL_ORGS.some(
    (name) => name.toLowerCase() === orgName.toLowerCase()
  )) {
    return true
  }

  // Then check specific page URL
  if (!pageUrl) return false

  const normalized = pageUrl.replace(/\/$/, '').toLowerCase()

  return EXPERIMENTAL_PAGES.some(
    (url) => url.replace(/\/$/, '').toLowerCase() === normalized
  )
}

// Experimental mode settings (now contains the OLD defaults - smaller/concise)
export const EXPERIMENTAL_SETTINGS = {
  // Widget modal dimensions (smaller, original design)
  modal: {
    maxWidth: 'max-w-md',
    minWidth: 'min-w-[400px]',
  },

  // Response text area (smaller text)
  responseArea: {
    maxHeight: '200px',
    textSize: 'text-sm',
  },

  // AI response settings (concise)
  ai: {
    maxOutputTokens: 1500,
    temperature: 0.3,
  },
}
