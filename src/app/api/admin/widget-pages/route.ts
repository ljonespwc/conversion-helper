import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization_id (use service role to bypass RLS circular dependency)
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

    // Filter by organization_id (use service role for all queries)
    const { data: pages, error } = await supabaseAdmin
      .from('widget_pages')
      .select('*')
      .eq('organization_id', userData.organization_id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ pages: pages || [] }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Error fetching widget pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch widget pages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization_id (use service role)
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

    const { page_url, page_title, page_goal } = await request.json()

    // Validate required fields
    if (!page_url || !page_title) {
      return NextResponse.json(
        { error: 'page_url and page_title are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    if (!page_url.match(/^https?:\/\//)) {
      return NextResponse.json(
        { error: 'page_url must start with http:// or https://' },
        { status: 400 }
      )
    }

    // Validate page_goal if provided
    if (page_goal && !['sell', 'lead', 'support'].includes(page_goal)) {
      return NextResponse.json(
        { error: 'page_goal must be one of: sell, lead, support' },
        { status: 400 }
      )
    }

    // Check if page already exists for this organization (use service role)
    const { data: existingPage } = await supabaseAdmin
      .from('widget_pages')
      .select('id')
      .eq('organization_id', userData.organization_id)
      .eq('page_url', page_url)
      .single()

    if (existingPage) {
      return NextResponse.json(
        { error: 'This page URL already exists' },
        { status: 400 }
      )
    }

    // Create new widget page (use service role)
    const { data: newPage, error } = await supabaseAdmin
      .from('widget_pages')
      .insert({
        organization_id: userData.organization_id,
        created_by_user_id: user.id,
        page_url,
        page_title,
        page_goal: page_goal || null
      })
      .select()
      .single()

    if (error) {
      // Check for UNIQUE constraint violation (code 23505)
      if (error.code === '23505' && error.message.includes('widget_pages_page_url_unique')) {
        return NextResponse.json(
          { error: 'This page URL is already registered by another organization' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ page: newPage }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating widget page:', error)

    // Check for UNIQUE constraint violation in catch block too
    if (error?.code === '23505' && error?.message?.includes('widget_pages_page_url_unique')) {
      return NextResponse.json(
        { error: 'This page URL is already registered by another organization' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create widget page' },
      { status: 500 }
    )
  }
}
