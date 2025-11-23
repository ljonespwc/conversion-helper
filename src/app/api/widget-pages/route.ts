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

    // Fetch page with organization name from organizations table
    const { data: page, error } = await supabase
      .from('widget_pages')
      .select(`
        page_title,
        page_url,
        organization_id,
        is_active,
        organizations!inner(name, show_branding)
      `)
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

    // Flatten the response structure
    // @ts-ignore - Supabase returns single object for inner join, not array
    const org = Array.isArray(page.organizations) ? page.organizations[0] : page.organizations
    const organizationName = org?.name || 'EasyAsk'
    const showBranding = org?.show_branding ?? true

    // Debug logging
    console.log('Widget page API response for', pageUrl, {
      page_title: page.page_title,
      org_raw: page.organizations,
      org_extracted: org,
      show_branding: showBranding
    })

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
