import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Strip query params from a URL to get the base URL
 * Used for matching sessions regardless of UTM/tracking params
 */
function getBaseUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return `${parsed.origin}${parsed.pathname}`
  } catch {
    return url
  }
}

/**
 * Apply page URL filter that matches base URL with or without query params
 * e.g., filtering by "https://example.com/page" matches:
 *   - "https://example.com/page"
 *   - "https://example.com/page?utm_source=..."
 */
function applyPageUrlFilter<T extends { or: (filter: string) => T }>(
  query: T,
  pageUrl: string
): T {
  const baseUrl = getBaseUrl(pageUrl)
  // Match exact URL or URL with query params (starts with baseUrl?)
  return query.or(`page_url.eq.${baseUrl},page_url.like.${baseUrl}?*`)
}

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
      totalQuery = applyPageUrlFilter(totalQuery, pageUrl)
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
      todayQuery = applyPageUrlFilter(todayQuery, pageUrl)
    }

    const { count: todayCount } = await todayQuery

    // Calculate average session duration from message timestamps
    let durationQuery = supabase
      .from('conversation_sessions')
      .select('session_id')
      .eq('organization_id', organizationId)
      .is('archived_at', null)

    if (pageUrl) {
      durationQuery = applyPageUrlFilter(durationQuery, pageUrl)
    }

    const { data: durationSessions } = await durationQuery

    let avgDuration = 0
    if (durationSessions && durationSessions.length > 0) {
      const sessionIds = durationSessions.map(s => s.session_id)
      const { data: sessionMessages } = await supabase
        .from('conversation_messages')
        .select('session_id, timestamp')
        .in('session_id', sessionIds)
        .not('timestamp', 'is', null)

      // Group timestamps by session
      const messagesBySession = (sessionMessages || []).reduce((acc, msg) => {
        if (!acc[msg.session_id]) {
          acc[msg.session_id] = []
        }
        acc[msg.session_id].push(msg.timestamp)
        return acc
      }, {} as Record<string, number[]>)

      const MAX_GAP_MS = 30 * 60 * 1000 // 30 minutes — gaps larger than this are separate visits
      let totalDuration = 0
      let sessionsWithDuration = 0

      for (const session of durationSessions) {
        const timestamps = messagesBySession[session.session_id]
        if (timestamps && timestamps.length >= 2) {
          const sorted = timestamps.sort((a, b) => a - b)
          let duration = 0
          for (let i = 1; i < sorted.length; i++) {
            const gap = sorted[i] - sorted[i - 1]
            if (gap <= MAX_GAP_MS) {
              duration += gap
            }
          }
          if (duration > 0) {
            totalDuration += duration
            sessionsWithDuration++
          }
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
      activeQuery = applyPageUrlFilter(activeQuery, pageUrl)
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
      recentQuery = applyPageUrlFilter(recentQuery, pageUrl)
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
      ratingsQuery = applyPageUrlFilter(ratingsQuery, pageUrl)
    }

    const { data: ratingsData } = await ratingsQuery

    const ratings = ratingsData?.map(r => r.user_rating).filter(Boolean) || []
    const totalRatings = ratings.length
    // Count positive (5) and negative (1) ratings for thumbs up/down display
    const positiveRatings = ratings.filter(r => r === 5).length
    const negativeRatings = ratings.filter(r => r === 1).length
    // Calculate average for backwards compatibility (also includes legacy 2-4 ratings)
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
      positiveRatings,
      negativeRatings,
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