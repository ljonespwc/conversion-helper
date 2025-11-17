import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Use service role to access all escalations (admin only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Auth handled by middleware - /admin routes require authentication

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // 'all', 'unresolved', 'resolved'
    const pageUrl = searchParams.get('page_url')
    const sort = searchParams.get('sort') || 'newest' // 'newest', 'oldest', 'most_flagged'

    // Build query
    let query = supabase
      .from('conversation_sessions')
      .select(`
        id,
        session_id,
        user_email,
        page_url,
        total_questions,
        matched_responses,
        started_at,
        ended_at,
        escalation_timestamp,
        escalation_processed,
        resolved,
        resolved_at
      `)
      .not('user_email', 'is', null) // Only escalated sessions

    // Apply status filter
    if (status === 'unresolved') {
      query = query.eq('resolved', false)
    } else if (status === 'resolved') {
      query = query.eq('resolved', true)
    }

    // Apply page URL filter
    if (pageUrl) {
      query = query.eq('page_url', pageUrl)
    }

    // Apply sorting
    if (sort === 'oldest') {
      query = query.order('escalation_timestamp', { ascending: true })
    } else {
      // Default: newest first
      query = query.order('escalation_timestamp', { ascending: false })
    }

    const { data: sessions, error: sessionsError } = await query

    if (sessionsError) {
      throw sessionsError
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ escalations: [], stats: null })
    }

    // Fetch messages for each session (with flagged messages)
    const sessionIds = sessions.map(s => s.session_id)

    const { data: messages, error: messagesError } = await supabase
      .from('conversation_messages')
      .select('*')
      .in('session_id', sessionIds)
      .order('timestamp', { ascending: true })

    if (messagesError) {
      throw messagesError
    }

    // Group messages by session
    const messagesBySession: Record<string, any[]> = {}
    messages?.forEach(msg => {
      if (!messagesBySession[msg.session_id]) {
        messagesBySession[msg.session_id] = []
      }
      messagesBySession[msg.session_id].push(msg)
    })

    // Combine sessions with their messages and count flagged
    const escalations = sessions.map(session => {
      const sessionMessages = messagesBySession[session.session_id] || []
      const flaggedMessages = sessionMessages.filter(m => m.needs_followup === true)

      return {
        ...session,
        messages: sessionMessages,
        flagged_count: flaggedMessages.length,
        flagged_messages: flaggedMessages
      }
    })

    // Sort by most_flagged if requested
    if (sort === 'most_flagged') {
      escalations.sort((a, b) => b.flagged_count - a.flagged_count)
    }

    // Calculate stats
    const stats = {
      total: escalations.length,
      unresolved: escalations.filter(e => !e.resolved).length,
      resolved: escalations.filter(e => e.resolved).length,
      total_flagged_messages: escalations.reduce((sum, e) => sum + e.flagged_count, 0)
    }

    return NextResponse.json({ escalations, stats }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching escalations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch escalations' },
      { status: 500 }
    )
  }
}
