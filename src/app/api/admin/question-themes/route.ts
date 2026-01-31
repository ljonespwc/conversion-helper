import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { PageThemeResult } from '@/components/admin/types'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const serverSupabase = await createServerClient()
    const { data: { user } } = await serverSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData?.organization_id) {
      return NextResponse.json({ error: 'User organization not found' }, { status: 400 })
    }

    const organizationId = userData.organization_id
    const pageUrl = request.nextUrl.searchParams.get('pageUrl')

    // Get widget pages for title lookup
    const { data: widgetPages } = await supabase
      .from('widget_pages')
      .select('page_url, page_title')
      .eq('organization_id', organizationId)

    const pageTitleMap = new Map(
      (widgetPages || []).map(p => [p.page_url, p.page_title])
    )

    let query = supabase
      .from('question_themes')
      .select('*')
      .eq('organization_id', organizationId)

    if (pageUrl) {
      query = query.eq('page_url', pageUrl)
    }

    const { data: themeRows } = await query

    const pages: PageThemeResult[] = (themeRows || []).map(row => ({
      page_url: row.page_url,
      page_title: pageTitleMap.get(row.page_url) || row.page_url,
      themes: row.themes || [],
      generated_at: row.generated_at,
      message_count: row.message_count
    }))

    return NextResponse.json({ pages })
  } catch (error) {
    console.error('Question themes GET error:', error)
    return NextResponse.json({ pages: [] })
  }
}
