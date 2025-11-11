import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Create scraping job record
    const { data: job, error: createError } = await supabase
      .from('scraping_jobs')
      .insert({
        url,
        status: 'pending'
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating scraping job:', createError)
      return NextResponse.json(
        { error: 'Failed to create scraping job' },
        { status: 500 }
      )
    }

    // Start scraping in background (don't await)
    scrapeInBackground(job.id, url)

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        url: job.url,
        status: job.status,
        created_at: job.created_at
      }
    })

  } catch (error) {
    console.error('Scrape API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function scrapeInBackground(jobId: string, url: string) {
  try {
    // Update status to scraping
    await supabase
      .from('scraping_jobs')
      .update({ status: 'scraping' })
      .eq('id', jobId)

    // Call Firecrawl API
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`
      },
      body: JSON.stringify({
        url,
        formats: ['markdown']
      })
    })

    if (!response.ok) {
      throw new Error(`Firecrawl API error: ${response.statusText}`)
    }

    const data = await response.json()
    const markdown = data.markdown || data.content || ''
    const fileSize = Buffer.byteLength(markdown, 'utf8')
    const wordCount = markdown.split(/\s+/).filter((w: string) => w.length > 0).length

    // Update job with results
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'scraped',
        markdown_content: markdown,
        file_size: fileSize,
        word_count: wordCount,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId)

  } catch (error) {
    console.error('Scraping error:', error)

    // Update job with error
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId)
  }
}
