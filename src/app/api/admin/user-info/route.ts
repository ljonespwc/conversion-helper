import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization info (use service role to bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, organization_id, organizations(name, website_url, file_search_store_name, show_branding, publishable_key, widget_line1, widget_line2, notification_email)')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user info:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user info' },
        { status: 500 }
      )
    }

    // Handle Supabase join result (organizations can be object or array depending on relationship)
    let userInfo: any = data
    let organization = null

    if (data?.organizations) {
      // If it's an array, take the first item; if it's an object, use it directly
      organization = Array.isArray(data.organizations)
        ? data.organizations[0]
        : data.organizations

      userInfo = {
        ...data,
        organization: organization
      }
    }

    return NextResponse.json({
      user: userInfo,
      organization: organization
    })
  } catch (error) {
    console.error('User info API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
