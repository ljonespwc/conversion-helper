import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Public endpoint - no auth required
// Used by the widget button to fetch page title
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageUrl = searchParams.get('url')

    if (!pageUrl) {
      return NextResponse.json({ error: 'URL parameter required' }, { status: 400 })
    }

    // Normalize URL to have trailing slash for consistent matching
    // This ensures "https://example.com" matches "https://example.com/" in database
    let normalizedUrl = pageUrl
    try {
      const parsed = new URL(pageUrl)
      // Add trailing slash if it's a root URL (no path or just "/")
      if (!parsed.pathname || parsed.pathname === '/') {
        normalizedUrl = pageUrl.endsWith('/') ? pageUrl : pageUrl + '/'
      }
    } catch (e) {
      // Invalid URL - use as-is
    }

    // Use service role key for public access to widget_pages
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch page (without join to avoid PostgREST caching issues)
    const { data: page, error } = await supabase
      .from('widget_pages')
      .select('page_title, page_url, organization_id, is_active')
      .eq('page_url', normalizedUrl)
      .single()

    if (error || !page) {
      return NextResponse.json({ page: null }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'CDN-Cache-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store'
        }
      })
    }

    // Fetch organization using RPC to bypass PostgREST caching
    const { data: orgRows } = await supabase.rpc('get_organization_branding', {
      org_id: page.organization_id
    })

    const org = orgRows?.[0]
    const organizationName = org?.name || 'EasyAsk'
    const showBranding = org?.show_branding ?? true

    const response = {
      page_title: page.page_title,
      page_url: page.page_url,
      organization_name: organizationName,
      is_active: page.is_active,
      show_branding: showBranding
    }

    return NextResponse.json({ page: response }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Error fetching widget page:', error)
    return NextResponse.json({ page: null }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store'
      }
    })
  }
}
