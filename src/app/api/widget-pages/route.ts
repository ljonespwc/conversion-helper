import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isValidKeyFormat } from '@/lib/api-keys'
import { isExperimentalPage } from '@/lib/experimental'
import { findMatchingPattern, isWildcardPattern } from '@/lib/url-matching'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
}

// Public endpoint - requires valid API key
// Used by the widget button to fetch page title
export async function GET(request: NextRequest) {
  // Disable Vercel Data Cache - must read fresh from DB every time
  noStore()

  try {
    const { searchParams } = new URL(request.url)
    const pageUrl = searchParams.get('url')
    const apiKey = searchParams.get('key')
    const groupId = searchParams.get('group_id')

    if (!pageUrl) {
      return NextResponse.json({ error: 'URL parameter required' }, { status: 400 })
    }

    // Validate API key format
    if (!isValidKeyFormat(apiKey)) {
      // Return null page (widget will hide itself) - don't expose auth errors
      return NextResponse.json({ page: null }, { headers: NO_CACHE_HEADERS })
    }

    // Use service role key for public access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Look up organization by API key
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, show_branding, widget_line1, widget_line2')
      .eq('publishable_key', apiKey)
      .single()

    if (orgError || !org) {
      // Invalid key - return null page
      return NextResponse.json({ page: null }, { headers: NO_CACHE_HEADERS })
    }

    // Fetch ALL widget pages for this organization to enable pattern matching
    const { data: pages, error } = await supabase
      .from('widget_pages')
      .select('page_title, page_url, is_active, widget_line1, widget_line2')
      .eq('organization_id', org.id)

    if (error || !pages || pages.length === 0) {
      return NextResponse.json({ page: null }, { headers: NO_CACHE_HEADERS })
    }

    let page
    let matchedPattern: string | null

    if (groupId) {
      // Group ID provided: direct match against page_url
      // This bypasses URL pattern matching entirely
      page = pages.find(p => p.page_url === groupId)
      matchedPattern = groupId

      if (!page) {
        return NextResponse.json({ page: null }, { headers: NO_CACHE_HEADERS })
      }
    } else {
      // No group ID: use URL pattern matching
      // Build array of all page URLs for pattern matching
      const pageUrls = pages.map(p => p.page_url)

      // Find matching pattern (exact matches take priority over wildcard patterns)
      matchedPattern = findMatchingPattern(pageUrl, pageUrls)

      if (!matchedPattern) {
        return NextResponse.json({ page: null }, { headers: NO_CACHE_HEADERS })
      }

      // Find the page that corresponds to the matched pattern
      page = pages.find(p => p.page_url === matchedPattern)

      if (!page) {
        return NextResponse.json({ page: null }, { headers: NO_CACHE_HEADERS })
      }
    }

    const response = {
      page_title: page.page_title,
      page_url: page.page_url, // Return the pattern URL (canonical identifier)
      visitor_url: pageUrl, // Also return the original visitor URL for reference
      organization_name: org.name,
      is_active: page.is_active,
      show_branding: org.show_branding ?? true,
      // Page-level widget text overrides org-level (fallback to org if page value is null)
      widget_line1: page.widget_line1 ?? org.widget_line1,
      widget_line2: page.widget_line2 ?? org.widget_line2,
      is_experimental: isExperimentalPage(page.page_url, org.name),
      is_pattern: isWildcardPattern(page.page_url) // Indicate if this was a pattern match
    }

    return NextResponse.json({ page: response }, { headers: NO_CACHE_HEADERS })
  } catch (error) {
    console.error('Error fetching widget page:', error)
    return NextResponse.json({ page: null }, { headers: NO_CACHE_HEADERS })
  }
}
