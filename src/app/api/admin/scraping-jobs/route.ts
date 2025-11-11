import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data: jobs, error } = await supabase
      .from('scraping_jobs')
      .select('id, url, status, file_size, word_count, error_message, created_at, completed_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching scraping jobs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch scraping jobs' },
        { status: 500 }
      )
    }

    return NextResponse.json({ jobs })

  } catch (error) {
    console.error('Scraping jobs API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
