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

    const { data: page, error } = await supabase
      .from('widget_pages')
      .select('page_title, page_url')
      .eq('page_url', pageUrl)
      .single()

    if (error || !page) {
      return NextResponse.json({ page: null })
    }

    return NextResponse.json({ page })
  } catch (error) {
    console.error('Error fetching widget page:', error)
    return NextResponse.json({ page: null })
  }
}
