import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimits, getClientIP } from '@/lib/ratelimit'

export const dynamic = 'force-dynamic'

// Use service role to bypass RLS (public endpoint, no user auth)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Email validation regex (basic but effective)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 email escalations per IP per day
    const clientIP = getClientIP(request)
    const { success, limit, remaining, reset } = await rateLimits.escalation.limit(clientIP)

    if (!success) {
      const resetDate = new Date(reset)
      console.warn(`Rate limit exceeded for escalation IP ${clientIP}. Limit: ${limit}, Remaining: ${remaining}, Reset: ${resetDate.toISOString()}`)

      return NextResponse.json(
        { error: 'Too many email submissions. Please try again later.' },
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

    const { session_id, email, page_url } = await request.json()

    // Validate required fields
    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: 'email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if session exists
    const { data: existingSession, error: fetchError } = await supabase
      .from('conversation_sessions')
      .select('id, user_email')
      .eq('session_id', session_id)
      .maybeSingle() // Returns null if not found instead of error

    if (existingSession) {
      // Session exists - check if email already submitted
      if (existingSession.user_email) {
        return NextResponse.json(
          {
            message: 'Email already submitted for this session',
            email: existingSession.user_email
          },
          { status: 200 }
        )
      }

      // Update existing session with email
      const { error: updateError } = await supabase
        .from('conversation_sessions')
        .update({
          user_email: email.trim().toLowerCase(),
          escalation_timestamp: new Date().toISOString(),
          escalation_processed: false
        })
        .eq('session_id', session_id)

      if (updateError) {
        throw updateError
      }
    } else {
      // Session doesn't exist yet (conversation still in progress)
      // Create it now with email capture
      const { error: insertError } = await supabase
        .from('conversation_sessions')
        .insert({
          session_id,
          user_email: email.trim().toLowerCase(),
          escalation_timestamp: new Date().toISOString(),
          escalation_processed: false,
          started_at: new Date().toISOString(),
          total_questions: 0,
          matched_responses: 0,
          page_url: page_url || null
        })

      if (insertError) {
        // Handle unique constraint violation (race condition - session was just created)
        if (insertError.code === '23505') {
          // Retry update
          const { error: retryError } = await supabase
            .from('conversation_sessions')
            .update({
              user_email: email.trim().toLowerCase(),
              escalation_timestamp: new Date().toISOString(),
              escalation_processed: false
            })
            .eq('session_id', session_id)

          if (retryError) {
            throw retryError
          }
        } else {
          throw insertError
        }
      }
    }

    console.log(`✉️ Email escalation captured: ${email} for session ${session_id}`)

    return NextResponse.json(
      {
        success: true,
        message: 'Email captured successfully. We\'ll follow up with you soon.'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error capturing email escalation:', error)
    return NextResponse.json(
      { error: 'Failed to capture email' },
      { status: 500 }
    )
  }
}
