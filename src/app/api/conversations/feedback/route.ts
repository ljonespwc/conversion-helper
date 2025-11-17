import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Use service role to bypass RLS (public endpoint, no user auth)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { session_id, message_timestamp, feedback } = await request.json()

    // Validate required fields
    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      )
    }

    if (!message_timestamp) {
      return NextResponse.json(
        { error: 'message_timestamp is required' },
        { status: 400 }
      )
    }

    if (!feedback || !['positive', 'negative'].includes(feedback)) {
      return NextResponse.json(
        { error: 'feedback must be "positive" or "negative"' },
        { status: 400 }
      )
    }

    // Find and update the message
    const { data: message, error: fetchError } = await supabase
      .from('conversation_messages')
      .select('id, role, user_feedback')
      .eq('session_id', session_id)
      .eq('timestamp', message_timestamp)
      .eq('role', 'assistant') // Only allow feedback on assistant messages
      .maybeSingle()

    if (fetchError) {
      throw fetchError
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // Check if feedback already exists
    if (message.user_feedback) {
      return NextResponse.json(
        {
          message: 'Feedback already submitted for this message',
          current_feedback: message.user_feedback
        },
        { status: 200 }
      )
    }

    // Update message with feedback
    const { error: updateError } = await supabase
      .from('conversation_messages')
      .update({ user_feedback: feedback })
      .eq('id', message.id)

    if (updateError) {
      throw updateError
    }

    console.log(`👍👎 Feedback captured: ${feedback} for session ${session_id}, timestamp ${message_timestamp}`)

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
