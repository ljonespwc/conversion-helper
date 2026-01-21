import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization_id (use service role to bypass RLS)
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

    const { id } = params

    // Verify page belongs to user's organization before deleting (use service role)
    const { data: page } = await supabaseAdmin
      .from('widget_pages')
      .select('organization_id')
      .eq('id', id)
      .single()

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    if (page.organization_id !== userData.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete the page (use service role)
    const { error } = await supabaseAdmin
      .from('widget_pages')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting widget page:', error)
    return NextResponse.json(
      { error: 'Failed to delete widget page' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization_id (use service role to bypass RLS)
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

    const { id } = params
    const body = await request.json()
    const { is_active, page_title, widget_line1, widget_line2 } = body

    // Build update object based on what fields are provided
    const updates: {
      is_active?: boolean
      page_title?: string
      widget_line1?: string | null
      widget_line2?: string | null
    } = {}

    // Validate and add is_active if provided
    if (is_active !== undefined) {
      if (typeof is_active !== 'boolean') {
        return NextResponse.json(
          { error: 'is_active must be a boolean' },
          { status: 400 }
        )
      }
      updates.is_active = is_active
    }

    // Validate and add page_title if provided
    if (page_title !== undefined) {
      if (typeof page_title !== 'string' || page_title.trim().length < 2) {
        return NextResponse.json(
          { error: 'page_title must be a string with at least 2 characters' },
          { status: 400 }
        )
      }
      updates.page_title = page_title.trim()
    }

    // Validate and add widget_line1 if provided
    // Allow empty string to clear (will be stored as null)
    if (widget_line1 !== undefined) {
      if (widget_line1 !== null && typeof widget_line1 !== 'string') {
        return NextResponse.json(
          { error: 'widget_line1 must be a string or null' },
          { status: 400 }
        )
      }
      // Store empty strings as null (to trigger fallback to org-level)
      updates.widget_line1 = widget_line1 && widget_line1.trim() ? widget_line1.trim() : null
    }

    // Validate and add widget_line2 if provided
    if (widget_line2 !== undefined) {
      if (widget_line2 !== null && typeof widget_line2 !== 'string') {
        return NextResponse.json(
          { error: 'widget_line2 must be a string or null' },
          { status: 400 }
        )
      }
      // Store empty strings as null (to trigger fallback to org-level)
      updates.widget_line2 = widget_line2 && widget_line2.trim() ? widget_line2.trim() : null
    }

    // Ensure at least one field is being updated
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Verify page belongs to user's organization before updating (use service role)
    const { data: page } = await supabaseAdmin
      .from('widget_pages')
      .select('organization_id')
      .eq('id', id)
      .single()

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    if (page.organization_id !== userData.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update the page (use service role)
    const { data: updatedPage, error } = await supabaseAdmin
      .from('widget_pages')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ page: updatedPage })
  } catch (error) {
    console.error('Error updating widget page:', error)
    return NextResponse.json(
      { error: 'Failed to update widget page' },
      { status: 500 }
    )
  }
}
