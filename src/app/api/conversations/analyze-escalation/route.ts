import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { analyzeSessionById } from '@/lib/conversation-analysis'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60 seconds for analysis

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Internal endpoint secret (optional - adds basic security)
const ANALYSIS_SECRET = process.env.ANALYSIS_ENDPOINT_SECRET || 'internal-only'

export async function POST(request: NextRequest) {
  try {
    // Optional: Verify internal request (prevent external calls)
    const authHeader = request.headers.get('x-analysis-secret')
    if (authHeader !== ANALYSIS_SECRET) {
      console.warn('Unauthorized analysis request')
      // Still allow for now (can tighten later)
    }

    const { session_id } = await request.json()

    // Validate required fields
    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      )
    }

    console.log(`📊 Starting analysis for session: ${session_id}`)

    // Check if session exists and needs analysis
    const { data: session, error: sessionError } = await supabase
      .from('conversation_sessions')
      .select('id, user_email, escalation_processed')
      .eq('session_id', session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    if (!session.user_email) {
      return NextResponse.json(
        { error: 'Session has no email escalation' },
        { status: 400 }
      )
    }

    if (session.escalation_processed) {
      return NextResponse.json(
        { message: 'Session already processed', session_id },
        { status: 200 }
      )
    }

    // Analyze the conversation
    const analysisResults = await analyzeSessionById(session_id)

    console.log(`📊 Analysis complete: ${analysisResults.length} messages flagged`)

    // Update messages with analysis results
    for (const result of analysisResults) {
      if (result.messageId) {
        const { error: updateError } = await supabase
          .from('conversation_messages')
          .update({
            needs_followup: result.needsFollowup,
            followup_reason: result.reason
          })
          .eq('id', result.messageId)

        if (updateError) {
          console.error(`Failed to update message ${result.messageId}:`, updateError)
        }
      }
    }

    // Mark session as processed
    const { error: markError } = await supabase
      .from('conversation_sessions')
      .update({ escalation_processed: true })
      .eq('session_id', session_id)

    if (markError) {
      console.error('Failed to mark session as processed:', markError)
    }

    console.log(`✅ Analysis complete for session ${session_id}`)

    return NextResponse.json(
      {
        success: true,
        session_id,
        flagged_count: analysisResults.length,
        analysis: analysisResults
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error analyzing escalation:', error)
    return NextResponse.json(
      {
        error: 'Failed to analyze conversation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
