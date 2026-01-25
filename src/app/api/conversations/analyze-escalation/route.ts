import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { analyzeSessionById } from '@/lib/conversation-analysis'

const resend = new Resend(process.env.RESEND_API_KEY)

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
      .select('id, user_email, escalation_processed, organization_id, page_url')
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

    // Send email notification if configured
    await sendEscalationNotification(session, session_id)

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

async function sendEscalationNotification(
  session: { organization_id: string | null; user_email: string; page_url: string | null },
  session_id: string
) {
  if (!session.organization_id) return

  try {
    const { data: org } = await supabase
      .from('organizations')
      .select('notification_email, website_url')
      .eq('id', session.organization_id)
      .single()

    if (!org?.notification_email) return

    // Hardcoded CC for Precision Nutrition - Lance wants visibility on escalations
    const isPrecisionNutrition = org.website_url?.includes('precisionnutrition.com')
    const ccEmail = isPrecisionNutrition ? 'lance.jones@precisionnutrition.com' : undefined

    const { data: messages } = await supabase
      .from('conversation_messages')
      .select('role, message, needs_followup, followup_reason')
      .eq('session_id', session_id)
      .order('timestamp', { ascending: true })

    if (!messages?.length) return

    // Get page title for clearer emails (especially for group IDs and wildcards)
    let pageDisplay = session.page_url || 'Unknown'
    if (session.page_url) {
      const { data: page } = await supabase
        .from('widget_pages')
        .select('page_title')
        .eq('page_url', session.page_url)
        .single()
      if (page?.page_title) {
        pageDisplay = `${page.page_title} (${session.page_url})`
      }
    }

    const transcript = messages
      .map(m => `${m.role.toUpperCase()}: ${m.message}`)
      .join('\n\n')

    const flagged = messages.filter(m => m.needs_followup)

    // Mark as resolved regardless of whether we send email
    await supabase
      .from('conversation_sessions')
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq('session_id', session_id)

    // Only send email if there are flagged messages
    if (flagged.length === 0) {
      console.log(`✅ No flagged messages for session ${session_id}, marked resolved without email`)
      return
    }

    const flaggedSection = `\n\n--- FLAGGED MESSAGES (${flagged.length}) ---\n\n` +
      flagged.map(m => `• "${m.message}"\n  Reason: ${m.followup_reason || 'Unknown'}`).join('\n\n')

    await resend.emails.send({
      from: 'EasyAsk <support@easyask.io>',
      to: org.notification_email,
      ...(ccEmail && { cc: ccEmail }),
      subject: `New escalation from ${session.user_email}`,
      text: `A visitor submitted an escalation request.

VISITOR EMAIL: ${session.user_email}

PAGE: ${pageDisplay}

--- FULL TRANSCRIPT ---

${transcript}${flaggedSection}
`
    })

    console.log(`📧 Escalation notification sent to ${org.notification_email}${ccEmail ? ` (cc: ${ccEmail})` : ''}`)
  } catch (err) {
    console.error('Failed to send escalation notification:', err)
  }
}
