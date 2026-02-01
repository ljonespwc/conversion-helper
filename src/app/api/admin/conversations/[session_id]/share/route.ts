import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteParams {
  params: Promise<{ session_id: string }>
}

function generateShareToken(): string {
  return 'sh_' + randomBytes(16).toString('hex')
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { session_id } = await params

    const serverSupabase = await createServerClient()
    const { data: { user } } = await serverSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('conversation_sessions')
      .select('organization_id, share_token')
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
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin

    // Reuse existing token if present
    if (session.share_token) {
      return NextResponse.json({
        token: session.share_token,
        url: `${baseUrl}/share/${session.share_token}`,
      })
    }

    // Generate new token
    const token = generateShareToken()
    const { error: updateError } = await supabaseAdmin
      .from('conversation_sessions')
      .update({ share_token: token })
      .eq('session_id', session_id)

    if (updateError) {
      console.error('Error saving share token:', updateError)
      return NextResponse.json(
        { error: 'Failed to generate share link' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      token,
      url: `${baseUrl}/share/${token}`,
    })
  } catch (error) {
    console.error('Error generating share link:', error)
    return NextResponse.json(
      { error: 'Failed to generate share link' },
      { status: 500 }
    )
  }
}
