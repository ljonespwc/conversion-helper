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

    const { page_url, page_title } = await request.json()

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
        page_title
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ page: newPage }, { status: 201 })
  } catch (error) {
    console.error('Error creating widget page:', error)
    return NextResponse.json(
      { error: 'Failed to create widget page' },
      { status: 500 }
    )
  }
}
