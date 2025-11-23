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

  // First get the page
  const { data: page } = await supabase
    .from('widget_pages')
    .select('*')
    .eq('page_url', pageUrl)
    .single()

  if (!page) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  }

  // Then get the organization separately
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', page.organization_id)
    .single()

  return NextResponse.json({
    page_data: page,
    org_data: org,
    org_show_branding: org?.show_branding
  })
}
