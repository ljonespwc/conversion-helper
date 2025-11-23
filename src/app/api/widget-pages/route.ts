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

    // Use service role key for public access to widget_pages
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch page (without join to avoid PostgREST caching issues)
    const { data: page, error } = await supabase
      .from('widget_pages')
      .select('page_title, page_url, organization_id, is_active')
      .eq('page_url', pageUrl)
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
    const { data: orgData } = await supabase.rpc('get_organization_branding', {
      org_id: page.organization_id
    })

    const organizationName = orgData?.name || 'EasyAsk'
    const showBranding = orgData?.show_branding ?? true

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
