import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isValidKeyFormat } from '@/lib/api-keys'
import { isExperimentalPage } from '@/lib/experimental'
import { normalizePageUrl } from '@/lib/gemini-file-search'
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

    // Normalize URL for consistent matching
    const normalizedUrl = normalizePageUrl(pageUrl)

    // Fetch page - SCOPED TO THIS ORGANIZATION ONLY
    const { data: page, error } = await supabase
      .from('widget_pages')
      .select('page_title, page_url, is_active')
      .eq('page_url', normalizedUrl)
      .eq('organization_id', org.id)
      .single()

    if (error || !page) {
      return NextResponse.json({ page: null }, { headers: NO_CACHE_HEADERS })
    }

    const response = {
      page_title: page.page_title,
      page_url: page.page_url,
      organization_name: org.name,
      is_active: page.is_active,
      show_branding: org.show_branding ?? true,
      widget_line1: org.widget_line1,
      widget_line2: org.widget_line2,
      is_experimental: isExperimentalPage(page.page_url)
    }

    return NextResponse.json({ page: response }, { headers: NO_CACHE_HEADERS })
  } catch (error) {
    console.error('Error fetching widget page:', error)
    return NextResponse.json({ page: null }, { headers: NO_CACHE_HEADERS })
  }
}
