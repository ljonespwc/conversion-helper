import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Create Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const serverSupabase = await createServerClient()
    const { data: { user } } = await serverSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's widget pages to filter conversations
    const { data: userPages } = await supabase
      .from('widget_pages')
      .select('page_url')
      .eq('user_id', user.id)

    const userPageUrls = userPages?.map(p => p.page_url) || []

    if (userPageUrls.length === 0) {
      // No pages configured, return empty stats
      return NextResponse.json({
        total: 0,
        today: 0,
        matchRate: 0,
        activeNow: 0,
        recentSessions: []
      })
    }

    // Get pageUrl query param for filtering to specific page
    const searchParams = request.nextUrl.searchParams
    const pageUrl = searchParams.get('pageUrl')

    // Determine which pages to filter by
    const filterPages = pageUrl ? [pageUrl] : userPageUrls

    // Get total sessions (filtered by user's pages)
    const { count: total } = await supabase
      .from('conversation_sessions')
      .select('*', { count: 'exact', head: true })
      .in('page_url', filterPages)

    // Get today's sessions (filtered by user's pages)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: todayCount } = await supabase
      .from('conversation_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())
      .in('page_url', filterPages)

    // Get match rate from messages (filtered by user's page sessions)
    const { data: userSessions } = await supabase
      .from('conversation_sessions')
      .select('session_id')
      .in('page_url', filterPages)

    const userSessionIds = userSessions?.map(s => s.session_id) || []

    let messagesQuery = supabase.from('conversation_messages').select('matched')
    if (userSessionIds.length > 0) {
      messagesQuery = messagesQuery.in('session_id', userSessionIds)
    }

    const { data: messages } = await messagesQuery

    const matchedCount = messages?.filter(m => m.matched).length || 0
    const totalMessages = messages?.length || 1
    const matchRate = Math.round((matchedCount / totalMessages) * 100)

    // Get active sessions (last 5 minutes, filtered by user's pages)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    const { count: activeNow } = await supabase
      .from('conversation_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('ended_at', fiveMinutesAgo.toISOString())
      .in('page_url', filterPages)

    // Get recent sessions (last 10 sessions, filtered by user's pages)
    const { data: recentSessions, error: sessionsError } = await supabase
      .from('conversation_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
      .in('page_url', filterPages)

    // Log any errors for debugging
    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
    }

    // Get messages for these sessions
    const sessionIds = recentSessions?.map(s => s.session_id) || []
    const { data: allMessages } = await supabase
      .from('conversation_messages')
      .select('*')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: true })

    // Group messages by session_id
    const messagesBySession = (allMessages || []).reduce((acc, msg) => {
      if (!acc[msg.session_id]) {
        acc[msg.session_id] = []
      }
      acc[msg.session_id].push(msg)
      return acc
    }, {} as Record<string, any[]>)

    // Combine sessions with their messages
    const formattedSessions = recentSessions?.map(session => ({
      ...session,
      messages: messagesBySession[session.session_id] || []
    })) || []

    return NextResponse.json({
      total: total || 0,
      today: todayCount || 0,
      matchRate,
      activeNow: activeNow || 0,
      recentSessions: formattedSessions
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({
      total: 0,
      today: 0,
      matchRate: 0,
      activeNow: 0,
      recentSessions: []
    })
  }
}