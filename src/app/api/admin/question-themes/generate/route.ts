import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateThemes } from '@/lib/question-themes'
import type { PageThemeResult } from '@/components/admin/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getBaseUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return `${parsed.origin}${parsed.pathname}`
  } catch {
    return url
  }
}

async function analyzePageThemes(
  organizationId: string,
  pageUrl: string,
  pageTitle: string
): Promise<PageThemeResult> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const baseUrl = getBaseUrl(pageUrl)

  // Get sessions for this page (including archived)
  const { data: sessions } = await supabase
    .from('conversation_sessions')
    .select('session_id')
    .eq('organization_id', organizationId)
    .or(`page_url.eq.${baseUrl},page_url.like.${baseUrl}?*`)
    .gte('created_at', thirtyDaysAgo)

  const sessionIds = sessions?.map(s => s.session_id) || []

  let userMessages: string[] = []
  if (sessionIds.length > 0) {
    const { data: messages } = await supabase
      .from('conversation_messages')
      .select('message')
      .in('session_id', sessionIds)
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(100)

    userMessages = (messages || []).map(m => m.message)
  }

  const messageCount = userMessages.length

  let themes: PageThemeResult['themes'] = []
  if (messageCount >= 3) {
    themes = await generateThemes(userMessages)
  }

  // Upsert into question_themes
  await supabase
    .from('question_themes')
    .upsert({
      organization_id: organizationId,
      page_url: pageUrl,
      themes,
      message_count: messageCount,
      generated_at: new Date().toISOString()
    }, {
      onConflict: 'organization_id,page_url'
    })

  return {
    page_url: pageUrl,
    page_title: pageTitle,
    themes,
    generated_at: new Date().toISOString(),
    message_count: messageCount
  }
}

export async function POST(request: NextRequest) {
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
    const body = await request.json()
    const { pageUrl } = body

    // Get widget pages
    const { data: widgetPages } = await supabase
      .from('widget_pages')
      .select('page_url, page_title')
      .eq('organization_id', organizationId)

    const allPages = widgetPages || []

    if (pageUrl) {
      // Single page analysis
      const page = allPages.find(p => p.page_url === pageUrl)
      const title = page?.page_title || pageUrl
      const result = await analyzePageThemes(organizationId, pageUrl, title)
      return NextResponse.json({ pages: [result] })
    }

    // All pages - run sequentially to avoid rate limits
    const results: PageThemeResult[] = []
    for (const page of allPages) {
      const result = await analyzePageThemes(organizationId, page.page_url, page.page_title)
      results.push(result)
    }

    return NextResponse.json({ pages: results })
  } catch (error) {
    console.error('Question themes generate error:', error)
    return NextResponse.json({ error: 'Failed to generate themes' }, { status: 500 })
  }
}
