import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Use service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { session_id: string } }
) {
  try {
    // TODO: Add user authentication check
    // const { data: { user }, error: authError } = await supabase.auth.getUser()
    // if (authError || !user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { session_id } = params
    const { resolved } = await request.json()

    if (typeof resolved !== 'boolean') {
      return NextResponse.json(
        { error: 'resolved must be a boolean' },
        { status: 400 }
      )
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

    const { data, error } = await supabase
      .from('conversation_sessions')
      .update(updateData)
      .eq('session_id', session_id)
      .select()
      .single()

    if (error) {
      throw error
    }

    console.log(`✅ Escalation ${session_id} marked as ${resolved ? 'resolved' : 'unresolved'}`)

    return NextResponse.json({ success: true, session: data })
  } catch (error) {
    console.error('Error updating escalation status:', error)
    return NextResponse.json(
      { error: 'Failed to update escalation status' },
      { status: 500 }
    )
  }
}
