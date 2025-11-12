import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// Service role client for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/admin/deployments
 * List all deployments for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all deployments for this user
    const { data: deployments, error } = await supabase
      .from('widget_deployments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching deployments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch deployments' },
        { status: 500 }
      )
    }

    return NextResponse.json({ deployments })
  } catch (error) {
    console.error('Deployments API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/deployments
 * Create a new deployment
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      deployment_key,
      company_name,
      company_domain,
      file_search_store_name,
      config = {},
      allowed_domains = []
    } = body

    // Validate required fields
    if (!deployment_key || !company_name || !file_search_store_name) {
      return NextResponse.json(
        { error: 'Missing required fields: deployment_key, company_name, file_search_store_name' },
        { status: 400 }
      )
    }

    // Check for duplicate deployment_key
    const { data: existing } = await supabase
      .from('widget_deployments')
      .select('id')
      .eq('deployment_key', deployment_key)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Deployment key already exists' },
        { status: 409 }
      )
    }

    // Create deployment
    const { data: deployment, error } = await supabase
      .from('widget_deployments')
      .insert({
        user_id: user.id,
        deployment_key,
        company_name,
        company_domain,
        file_search_store_name,
        config,
        allowed_domains,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating deployment:', error)
      return NextResponse.json(
        { error: 'Failed to create deployment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ deployment }, { status: 201 })
  } catch (error) {
    console.error('Create deployment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
