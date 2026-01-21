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

    // Get user's organization_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.organization_id) {
      return NextResponse.json(
        { error: 'User organization not found' },
        { status: 400 }
      )
    }

    const organizationId = userData.organization_id

    // Get pageUrl query param for filtering to specific page
    const searchParams = request.nextUrl.searchParams
    const pageUrl = searchParams.get('pageUrl')

    // Build base query - always filter by organization_id, exclude archived
    // Optionally also filter by specific page_url if provided
    let totalQuery = supabase
      .from('conversation_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .is('archived_at', null)

    if (pageUrl) {
      totalQuery = totalQuery.eq('page_url', pageUrl)
    }

    // Get total sessions (filtered by organization, excluding archived)
    const { count: total } = await totalQuery

    // Get today's sessions (filtered by organization)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let todayQuery = supabase
      .from('conversation_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .is('archived_at', null)
      .gte('created_at', today.toISOString())

    if (pageUrl) {
      todayQuery = todayQuery.eq('page_url', pageUrl)
    }

    const { count: todayCount } = await todayQuery

    // Calculate average session duration using message timestamps (more accurate)
    let completedQuery = supabase
      .from('conversation_sessions')
      .select('session_id, started_at, ended_at')
      .eq('organization_id', organizationId)
      .is('archived_at', null)
      .not('ended_at', 'is', null)

    if (pageUrl) {
      completedQuery = completedQuery.eq('page_url', pageUrl)
    }

    const { data: completedSessions } = await completedQuery

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

    // Get active sessions (last 5 minutes, filtered by organization)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    let activeQuery = supabase
      .from('conversation_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .is('archived_at', null)
      .gte('ended_at', fiveMinutesAgo.toISOString())

    if (pageUrl) {
      activeQuery = activeQuery.eq('page_url', pageUrl)
    }

    const { count: activeNow } = await activeQuery

    // Get recent sessions (all sessions, filtered by organization, excluding archived)
    let recentQuery = supabase
      .from('conversation_sessions')
      .select('*')
      .eq('organization_id', organizationId)
      .is('archived_at', null)
      .order('created_at', { ascending: false })

    if (pageUrl) {
      recentQuery = recentQuery.eq('page_url', pageUrl)
    }

    const { data: recentSessions, error: sessionsError } = await recentQuery

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

    // Get ratings from sessions (1-5 star rating, excluding archived)
    let ratingsQuery = supabase
      .from('conversation_sessions')
      .select('user_rating')
      .eq('organization_id', organizationId)
      .is('archived_at', null)
      .not('user_rating', 'is', null)

    if (pageUrl) {
      ratingsQuery = ratingsQuery.eq('page_url', pageUrl)
    }

    const { data: ratingsData } = await ratingsQuery

    const ratings = ratingsData?.map(r => r.user_rating).filter(Boolean) || []
    const totalRatings = ratings.length
    const avgRating = totalRatings > 0
      ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / totalRatings) * 10) / 10
      : 0

    // Group messages by session_id
    const messagesBySession = (allMessages || []).reduce((acc, msg) => {
      if (!acc[msg.session_id]) {
        acc[msg.session_id] = []
      }
      acc[msg.session_id].push(msg)
      return acc
    }, {} as Record<string, any[]>)

    // Combine sessions with their messages and compute is_unread
    const formattedSessions = recentSessions?.map(session => {
      const messages = messagesBySession[session.session_id] || []

      // Compute is_unread: true if never viewed OR has messages newer than last_viewed_at
      let isUnread = false
      if (!session.last_viewed_at) {
        // Never been viewed = unread
        isUnread = true
      } else {
        // Check if any message is newer than last_viewed_at
        const lastViewedTime = new Date(session.last_viewed_at).getTime()
        isUnread = messages.some((msg: { created_at: string }) => {
          const msgTime = new Date(msg.created_at).getTime()
          return msgTime > lastViewedTime
        })
      }

      return {
        ...session,
        messages,
        is_unread: isUnread
      }
    }) || []

    return NextResponse.json({
      total: total || 0,
      today: todayCount || 0,
      avgDuration,
      activeNow: activeNow || 0,
      avgRating,
      totalRatings,
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
      avgRating: 0,
      totalRatings: 0,
      recentSessions: []
    })
  }
}