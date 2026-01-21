import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Use service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteParams {
  params: Promise<{ session_id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { session_id } = await params

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

    // Verify the session exists and belongs to user's organization
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('conversation_sessions')
      .select('organization_id')
      .eq('session_id', session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    if (session.organization_id !== userData.organization_id) {
      return NextResponse.json(
        { error: 'Unauthorized - conversation belongs to different organization' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const updateData: Record<string, unknown> = {}

    // Handle bookmark toggle
    if (typeof body.is_bookmarked === 'boolean') {
      updateData.is_bookmarked = body.is_bookmarked
      updateData.bookmarked_at = body.is_bookmarked ? new Date().toISOString() : null
    }

    // Handle last_viewed_at update (for marking as read)
    if (body.last_viewed_at) {
      updateData.last_viewed_at = body.last_viewed_at
    }

    // If no valid fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update the session
    const { error: updateError } = await supabaseAdmin
      .from('conversation_sessions')
      .update(updateData)
      .eq('session_id', session_id)

    if (updateError) {
      console.error('Error updating conversation:', updateError)
      return NextResponse.json(
        { error: 'Failed to update conversation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      updated: updateData
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    )
  }
}
