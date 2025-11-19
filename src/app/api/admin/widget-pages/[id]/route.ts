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
    const { is_active } = body

    // Validate is_active is a boolean
    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'is_active must be a boolean' },
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
      .update({ is_active })
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
