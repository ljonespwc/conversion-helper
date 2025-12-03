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

    const { session_id, rating } = await request.json()

    // Validate required fields
    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      )
    }

    // Validate rating is integer 1-5
    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'rating must be an integer from 1 to 5' },
        { status: 400 }
      )
    }

    // Check if session exists
    const { data: session, error: fetchError } = await supabase
      .from('conversation_sessions')
      .select('id, user_rating')
      .eq('session_id', session_id)
      .maybeSingle()

    if (fetchError) {
      throw fetchError
    }

    if (session) {
      // Session exists - check if rating already submitted
      if (session.user_rating) {
        return NextResponse.json(
          {
            message: 'Rating already submitted for this conversation',
            current_rating: session.user_rating
          },
          { status: 200 }
        )
      }

      // Update existing session with rating
      const { error: updateError } = await supabase
        .from('conversation_sessions')
        .update({ user_rating: rating })
        .eq('session_id', session_id)

      if (updateError) {
        throw updateError
      }
    } else {
      // Session doesn't exist yet (conversation still in progress)
      // Create it now with just session_id and rating
      // The webhook will fill in the rest at session.end
      const { error: insertError } = await supabase
        .from('conversation_sessions')
        .insert({
          session_id,
          user_rating: rating,
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
            .update({ user_rating: rating })
            .eq('session_id', session_id)

          if (retryError) {
            throw retryError
          }
        } else {
          throw insertError
        }
      }
    }

    console.log(`⭐ Rating captured: ${rating}/5 for session ${session_id}`)

    return NextResponse.json(
      {
        success: true,
        message: 'Rating recorded successfully',
        rating
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error recording rating:', error)
    return NextResponse.json(
      { error: 'Failed to record rating' },
      { status: 500 }
    )
  }
}
