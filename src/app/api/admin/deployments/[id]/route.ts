import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// Service role client for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/admin/deployments/[id]
 * Get a single deployment by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Get deployment (RLS will ensure user only sees their own)
    const { data: deployment, error } = await supabase
      .from('widget_deployments')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !deployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ deployment })
  } catch (error) {
    console.error('Get deployment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/deployments/[id]
 * Update a deployment
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Allowed fields to update
    const {
      deployment_key,
      company_name,
      company_domain,
      file_search_store_name,
      config,
      allowed_domains,
      status
    } = body

    // Build update object with only provided fields
    const updates: any = { updated_at: new Date().toISOString() }

    if (deployment_key !== undefined) updates.deployment_key = deployment_key
    if (company_name !== undefined) updates.company_name = company_name
    if (company_domain !== undefined) updates.company_domain = company_domain
    if (file_search_store_name !== undefined) updates.file_search_store_name = file_search_store_name
    if (config !== undefined) updates.config = config
    if (allowed_domains !== undefined) updates.allowed_domains = allowed_domains
    if (status !== undefined) updates.status = status

    // Update deployment (RLS will ensure user only updates their own)
    const { data: deployment, error } = await supabase
      .from('widget_deployments')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !deployment) {
      console.error('Error updating deployment:', error)
      return NextResponse.json(
        { error: 'Failed to update deployment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ deployment })
  } catch (error) {
    console.error('Update deployment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/deployments/[id]
 * Delete a deployment and all associated indexed pages
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Get deployment first to verify ownership
    const { data: deployment, error: fetchError } = await supabase
      .from('widget_deployments')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !deployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      )
    }

    // Delete all indexed pages for this deployment
    // They will cascade delete from File Search via their delete endpoint
    const { error: pagesError } = await supabase
      .from('indexed_pages')
      .delete()
      .eq('deployment_id', deployment.deployment_id)

    if (pagesError) {
      console.error('Error deleting indexed pages:', pagesError)
    }

    // Delete the deployment
    const { error: deleteError } = await supabase
      .from('widget_deployments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting deployment:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete deployment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Deployment deleted successfully'
    })
  } catch (error) {
    console.error('Delete deployment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
