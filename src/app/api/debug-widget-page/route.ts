import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageUrl = searchParams.get('url')

  if (!pageUrl) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

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

  return NextResponse.json({
    raw_response: page,
    error: error
  })
}
