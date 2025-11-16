import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const { session_id, email } = await request.json()

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
      .single()

    if (fetchError || !existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if email already submitted for this session
    if (existingSession.user_email) {
      return NextResponse.json(
        {
          message: 'Email already submitted for this session',
          email: existingSession.user_email
        },
        { status: 200 }
      )
    }

    // Update session with email and timestamp
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
