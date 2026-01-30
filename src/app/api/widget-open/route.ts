import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isValidKeyFormat } from '@/lib/api-keys'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { api_key, page_url, visitor_id } = await request.json()

    if (!isValidKeyFormat(api_key)) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    if (!page_url) {
      return NextResponse.json({ error: 'page_url is required' }, { status: 400 })
    }

    // Look up organization by API key
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('publishable_key', api_key)
      .single()

    if (orgError || !org) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Insert widget open event
    await supabase.from('widget_opens').insert({
      organization_id: org.id,
      page_url,
      visitor_id: visitor_id || null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
