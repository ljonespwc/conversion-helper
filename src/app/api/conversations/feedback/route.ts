import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimits, getClientIP } from '@/lib/ratelimit'

export const dynamic = 'force-dynamic'

// Use service role to bypass RLS (public endpoint, no user auth)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 feedback submissions per IP per hour
    const clientIP = getClientIP(request)
    const { success, limit, remaining, reset } = await rateLimits.feedback.limit(clientIP)

    if (!success) {
      const resetDate = new Date(reset)
      console.warn(`Rate limit exceeded for feedback IP ${clientIP}. Limit: ${limit}, Remaining: ${remaining}, Reset: ${resetDate.toISOString()}`)

      return NextResponse.json(
        { error: 'Too many feedback submissions. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString()
          }
        }
      )
    }

    const { session_id, feedback } = await request.json()

    // Validate required fields
    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      )
    }

    if (!feedback || !['positive', 'negative'].includes(feedback)) {
      return NextResponse.json(
        { error: 'feedback must be "positive" or "negative"' },
        { status: 400 }
      )
    }

    // Check if session exists
    const { data: session, error: fetchError } = await supabase
      .from('conversation_sessions')
      .select('id, user_feedback')
      .eq('session_id', session_id)
      .maybeSingle()

    if (fetchError) {
      throw fetchError
    }

    if (session) {
      // Session exists - check if feedback already submitted
      if (session.user_feedback) {
        return NextResponse.json(
          {
            message: 'Feedback already submitted for this conversation',
            current_feedback: session.user_feedback
          },
          { status: 200 }
        )
      }

      // Update existing session with feedback
      const { error: updateError } = await supabase
        .from('conversation_sessions')
        .update({ user_feedback: feedback })
        .eq('session_id', session_id)

      if (updateError) {
        throw updateError
      }
    } else {
      // Session doesn't exist yet (conversation still in progress)
      // Create it now with just session_id and feedback
      // The webhook will fill in the rest at session.end
      const { error: insertError } = await supabase
        .from('conversation_sessions')
        .insert({
          session_id,
          user_feedback: feedback,
          started_at: new Date().toISOString(),
          total_questions: 0,
          matched_responses: 0
        })

      if (insertError) {
        // Handle unique constraint violation (race condition - session was just created)
        if (insertError.code === '23505') {
          // Retry update
          const { error: retryError } = await supabase
            .from('conversation_sessions')
            .update({ user_feedback: feedback })
            .eq('session_id', session_id)

          if (retryError) {
            throw retryError
          }
        } else {
          throw insertError
        }
      }
    }

    console.log(`👍👎 Feedback captured: ${feedback} for session ${session_id}`)

    return NextResponse.json(
      {
        success: true,
        message: 'Feedback recorded successfully',
        feedback
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error recording feedback:', error)
    return NextResponse.json(
      { error: 'Failed to record feedback' },
      { status: 500 }
    )
  }
}
