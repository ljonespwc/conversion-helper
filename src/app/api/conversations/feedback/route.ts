import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimits, getClientIP } from '@/lib/ratelimit'
import { isValidKeyFormat } from '@/lib/api-keys'

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
    try {
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
    } catch (rateLimitError) {
      // If rate limiting fails (Redis issue), allow the request to continue
      console.error('Rate limiting error (allowing request):', rateLimitError)
    }

    const { session_id, rating, api_key } = await request.json()

    // Validate API key
    if (!isValidKeyFormat(api_key)) {
      return NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 }
      )
    }

    // Look up organization by API key
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('publishable_key', api_key)
      .single()

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

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

    // Check if session exists AND belongs to this organization
    const { data: session, error: fetchError } = await supabase
      .from('conversation_sessions')
      .select('id, user_rating, organization_id')
      .eq('session_id', session_id)
      .maybeSingle()

    if (fetchError) {
      throw fetchError
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Verify session belongs to the organization
    if (session.organization_id !== org.id) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if rating already submitted
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
      .eq('organization_id', org.id)

    if (updateError) {
      throw updateError
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
