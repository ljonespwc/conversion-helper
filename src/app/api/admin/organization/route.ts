import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Service role client to bypass RLS for organization updates
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * PATCH /api/admin/organization
 * Update organization settings (e.g., show_branding)
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's organization (use service role to bypass RLS)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.organization_id) {
      console.error('Error fetching user organization:', userError)
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { show_branding } = body

    // Build updates object
    const updates: any = {}

    // Validate and add show_branding if provided
    if (show_branding !== undefined) {
      if (typeof show_branding !== 'boolean') {
        return NextResponse.json(
          { error: 'show_branding must be a boolean' },
          { status: 400 }
        )
      }
      updates.show_branding = show_branding
    }

    // Check if there are any updates to apply
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString()

    // Update organization (use service role to bypass RLS)
    const { data: updatedOrg, error: updateError } = await supabaseAdmin
      .from('organizations')
      .update(updates)
      .eq('id', userData.organization_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating organization:', updateError)
      return NextResponse.json(
        { error: 'Failed to update organization' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      organization: updatedOrg
    })
  } catch (error) {
    console.error('Organization update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
