import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Use service role to access escalations (need service role to query conversation_sessions)
const supabaseAdmin = createClient(
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
    const { data: userData, error: userError } = await supabaseAdmin
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

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // 'all', 'unresolved', 'resolved'
    const pageUrl = searchParams.get('page_url')
    const sort = searchParams.get('sort') || 'newest' // 'newest', 'oldest', 'most_flagged'

    // Build query - filter by organization, exclude archived
    let query = supabaseAdmin
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
      .eq('organization_id', userData.organization_id) // Filter by organization
      .is('archived_at', null) // Exclude archived conversations

    // Apply status filter
    if (status === 'unresolved') {
      query = query.eq('resolved', false)
    } else if (status === 'resolved') {
      query = query.eq('resolved', true)
    }

    // Apply page URL filter (match by pathname substring since dropdown sends pathnames)
    if (pageUrl) {
      query = query.ilike('page_url', `%${pageUrl}%`)
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

    // Get all unique page URLs for this organization (for filter dropdown)
    // Do this BEFORE early return so dropdown always has options
    // Only include non-archived escalations
    const { data: allPages } = await supabaseAdmin
      .from('conversation_sessions')
      .select('page_url')
      .not('user_email', 'is', null)
      .eq('organization_id', userData.organization_id)
      .is('archived_at', null)
      .not('page_url', 'is', null)

    const availablePages = Array.from(new Set(
      (allPages || [])
        .map(p => { try { return new URL(p.page_url).pathname } catch { return p.page_url } })
        .filter(Boolean)
    ))

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({
        escalations: [],
        stats: { total: 0, unresolved: 0, resolved: 0, total_flagged_messages: 0 },
        availablePages
      })
    }

    // Fetch messages for each session (with flagged messages)
    const sessionIds = sessions.map(s => s.session_id)

    const { data: messages, error: messagesError } = await supabaseAdmin
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
      total_flagged_messages: escalations.filter(e => !e.resolved).reduce((sum, e) => sum + e.flagged_count, 0)
    }

    return NextResponse.json({ escalations, stats, availablePages }, {
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
