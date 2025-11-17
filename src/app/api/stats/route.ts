import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
        avgDuration: 0,
        activeNow: 0,
        positiveFeedback: 0,
        negativeFeedback: 0,
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

    // Calculate average session duration using message timestamps (more accurate)
    const { data: completedSessions } = await supabase
      .from('conversation_sessions')
      .select('session_id, started_at, ended_at')
      .in('page_url', filterPages)
      .not('ended_at', 'is', null)

    let avgDuration = 0
    if (completedSessions && completedSessions.length > 0) {
      // Get messages for all completed sessions to calculate accurate durations
      const sessionIds = completedSessions.map(s => s.session_id)
      const { data: sessionMessages } = await supabase
        .from('conversation_messages')
        .select('session_id, timestamp')
        .in('session_id', sessionIds)
        .not('timestamp', 'is', null)

      // Group messages by session and calculate duration from timestamps
      const messagesBySession = (sessionMessages || []).reduce((acc, msg) => {
        if (!acc[msg.session_id]) {
          acc[msg.session_id] = []
        }
        acc[msg.session_id].push(msg.timestamp)
        return acc
      }, {} as Record<string, number[]>)

      // Calculate total duration across all sessions
      let totalDuration = 0
      let sessionsWithDuration = 0

      for (const session of completedSessions) {
        const timestamps = messagesBySession[session.session_id]
        if (timestamps && timestamps.length >= 2) {
          // Sort timestamps and calculate duration from first to last message
          const sortedTimestamps = timestamps.sort((a, b) => a - b)
          const duration = sortedTimestamps[sortedTimestamps.length - 1] - sortedTimestamps[0]
          totalDuration += duration
          sessionsWithDuration++
        } else if (session.ended_at) {
          // Fallback to session times if no message timestamps
          const duration = new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()
          totalDuration += duration
          sessionsWithDuration++
        }
      }

      if (sessionsWithDuration > 0) {
        avgDuration = Math.round(totalDuration / sessionsWithDuration / 1000) // Convert to seconds
      }
    }

    // Get active sessions (last 5 minutes, filtered by user's pages)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    const { count: activeNow } = await supabase
      .from('conversation_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('ended_at', fiveMinutesAgo.toISOString())
      .in('page_url', filterPages)

    // Get recent sessions (all sessions, filtered by user's pages)
    const { data: recentSessions, error: sessionsError } = await supabase
      .from('conversation_sessions')
      .select('*')
      .order('created_at', { ascending: false })
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

    // Count feedback from sessions (not messages - session-level feedback)
    const { count: positiveFeedbackCount } = await supabase
      .from('conversation_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_feedback', 'positive')
      .in('page_url', filterPages)

    const { count: negativeFeedbackCount } = await supabase
      .from('conversation_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_feedback', 'negative')
      .in('page_url', filterPages)

    const positiveFeedback = positiveFeedbackCount || 0
    const negativeFeedback = negativeFeedbackCount || 0

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
      avgDuration,
      activeNow: activeNow || 0,
      positiveFeedback,
      negativeFeedback,
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
      avgDuration: 0,
      activeNow: 0,
      positiveFeedback: 0,
      negativeFeedback: 0,
      recentSessions: []
    })
  }
}