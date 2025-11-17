import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: pages, error } = await supabase
      .from('widget_pages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ pages: pages || [] })
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

    // Check if page already exists for this user
    const { data: existingPage } = await supabase
      .from('widget_pages')
      .select('id')
      .eq('user_id', user.id)
      .eq('page_url', page_url)
      .single()

    if (existingPage) {
      return NextResponse.json(
        { error: 'This page URL already exists' },
        { status: 400 }
      )
    }

    // Create new widget page
    const { data: newPage, error } = await supabase
      .from('widget_pages')
      .insert({
        user_id: user.id,
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
