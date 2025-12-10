/**
 * Experimental Feature Flags
 *
 * This file defines pages that use experimental widget behavior.
 * All experimental code checks this list - easy to find and remove later.
 *
 * To add a page: Add its URL to EXPERIMENTAL_PAGES array
 * To remove experiment: Delete this file and grep for "isExperimental"
 */

// Page URLs that use experimental mode
export const EXPERIMENTAL_PAGES = [
  'https://www.precisionnutrition.com/nutrition-certification-pharmacist',
]

/**
 * Check if a page URL is in experimental mode
 * Handles trailing slash variants and case differences
 */
export function isExperimentalPage(pageUrl: string | undefined): boolean {
  if (!pageUrl) return false

  const normalized = pageUrl.replace(/\/$/, '').toLowerCase()

  return EXPERIMENTAL_PAGES.some(
    (url) => url.replace(/\/$/, '').toLowerCase() === normalized
  )
}

// Experimental mode settings
export const EXPERIMENTAL_SETTINGS = {
  // Widget modal dimensions (wider than default, responsive)
  // Default is max-w-md (448px) min-w-[400px]
  // Experimental: up to 800px, scales down on smaller screens
  modal: {
    maxWidth: 'max-w-[800px]',
    // Responsive: 90vw on small screens, 500px minimum on larger screens
    minWidth: 'sm:min-w-[500px]',
  },

  // Response text area (taller than default 200px)
  responseArea: {
    maxHeight: '350px',
    textSize: 'text-base',
  },

  // AI response settings (more detailed)
  ai: {
    maxOutputTokens: 2500, // Default: 1500
    temperature: 0.4, // Default: 0.3
  },
}
