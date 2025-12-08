import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Use service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
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

    const { session_ids } = await request.json()

    if (!Array.isArray(session_ids) || session_ids.length === 0) {
      return NextResponse.json(
        { error: 'session_ids must be a non-empty array' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    let archivedCount = 0
    let autoResolvedCount = 0

    // Process each session
    for (const sessionId of session_ids) {
      // Verify the session belongs to user's organization
      const { data: session, error: sessionError } = await supabaseAdmin
        .from('conversation_sessions')
        .select('organization_id, user_email, resolved')
        .eq('session_id', sessionId)
        .single()

      if (sessionError || !session) {
        console.warn(`Session ${sessionId} not found, skipping`)
        continue
      }

      if (session.organization_id !== userData.organization_id) {
        console.warn(`Session ${sessionId} belongs to different org, skipping`)
        continue
      }

      // Build update data
      const updateData: Record<string, unknown> = {
        archived_at: now
      }

      // Auto-resolve unresolved escalations
      if (session.user_email && !session.resolved) {
        updateData.resolved = true
        updateData.resolved_at = now
        autoResolvedCount++
      }

      // Update the session
      const { error: updateError } = await supabaseAdmin
        .from('conversation_sessions')
        .update(updateData)
        .eq('session_id', sessionId)

      if (updateError) {
        console.error(`Error archiving session ${sessionId}:`, updateError)
        continue
      }

      archivedCount++
    }

    console.log(`Archived ${archivedCount} conversations (auto-resolved ${autoResolvedCount} escalations)`)

    return NextResponse.json({
      success: true,
      archived: archivedCount,
      autoResolved: autoResolvedCount
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error archiving conversations:', error)
    return NextResponse.json(
      { error: 'Failed to archive conversations' },
      { status: 500 }
    )
  }
}
