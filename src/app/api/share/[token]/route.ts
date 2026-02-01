import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteParams {
  params: Promise<{ token: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { token } = await params

    if (!token || !token.startsWith('sh_')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('conversation_sessions')
      .select('session_id, started_at, ended_at, page_url, total_questions, matched_responses, user_rating')
      .eq('share_token', token)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('conversation_messages')
      .select('id, role, message, timestamp, matched, category, grounded, created_at')
      .eq('session_id', session.session_id)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json(
        { error: 'Failed to load conversation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      started_at: session.started_at,
      ended_at: session.ended_at,
      page_url: session.page_url,
      total_questions: session.total_questions,
      matched_responses: session.matched_responses,
      user_rating: session.user_rating,
      messages: messages || [],
    })
  } catch (error) {
    console.error('Error loading shared conversation:', error)
    return NextResponse.json(
      { error: 'Failed to load conversation' },
      { status: 500 }
    )
  }
}
