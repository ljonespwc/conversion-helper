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

    // Fetch page with organization name from users table
    const { data: page, error } = await supabase
      .from('widget_pages')
      .select(`
        page_title,
        page_url,
        user_id,
        users!inner(organization_name)
      `)
      .eq('page_url', pageUrl)
      .single()

    if (error || !page) {
      return NextResponse.json({ page: null })
    }

    // Flatten the response structure
    // @ts-ignore - Supabase returns single object for inner join, not array
    const organizationName = page.users?.organization_name || 'EasyAsk'

    const response = {
      page_title: page.page_title,
      page_url: page.page_url,
      organization_name: organizationName
    }

    return NextResponse.json({ page: response })
  } catch (error) {
    console.error('Error fetching widget page:', error)
    return NextResponse.json({ page: null })
  }
}
