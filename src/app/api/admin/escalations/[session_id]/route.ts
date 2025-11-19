import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Use service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { session_id: string } }
) {
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

    const { session_id } = params
    const { resolved } = await request.json()

    if (typeof resolved !== 'boolean') {
      return NextResponse.json(
        { error: 'resolved must be a boolean' },
        { status: 400 }
      )
    }

    // Verify the conversation session belongs to user's organization
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('conversation_sessions')
      .select('organization_id')
      .eq('session_id', session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.organization_id !== userData.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update the session
    const updateData: any = {
      resolved
    }

    // Set resolved_at timestamp when marking as resolved, clear when reopening
    if (resolved) {
      updateData.resolved_at = new Date().toISOString()
    } else {
      updateData.resolved_at = null
    }

    const { data, error } = await supabaseAdmin
      .from('conversation_sessions')
      .update(updateData)
      .eq('session_id', session_id)
      .select()
      .single()

    if (error) {
      throw error
    }

    console.log(`✅ Escalation ${session_id} marked as ${resolved ? 'resolved' : 'unresolved'}`)

    return NextResponse.json({ success: true, session: data }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error updating escalation status:', error)
    return NextResponse.json(
      { error: 'Failed to update escalation status' },
      { status: 500 }
    )
  }
}
