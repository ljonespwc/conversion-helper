import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Service role client for Storage operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET_NAME = 'uploaded-docs'

/**
 * Generate a safe filename from URL
 */
function generateFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace(/^www\./, '')
    const path = urlObj.pathname
      .replace(/^\/|\/$/g, '') // Remove leading/trailing slashes
      .replace(/\//g, '-')      // Replace slashes with dashes
      .replace(/[^a-zA-Z0-9-]/g, '') // Remove special chars
      .substring(0, 100)        // Limit length

    const timestamp = Date.now()
    const filename = path
      ? `${domain}-${path}-${timestamp}.md`
      : `${domain}-${timestamp}.md`

    return filename
  } catch {
    return `scraped-page-${Date.now()}.md`
  }
}

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

    // Get authenticated user
    const supabaseServer = await createServerClient()
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create scraping job record
    const { data: job, error: createError } = await supabase
      .from('scraping_jobs')
      .insert({
        url,
        status: 'pending',
        scraping_status: 'pending',
        indexing_status: 'not_indexed',
        user_id: user.id
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
    scrapeInBackground(job.id, url, user.id)

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

async function scrapeInBackground(jobId: string, url: string, userId: string) {
  try {
    // Update status to scraping
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'scraping',
        scraping_status: 'scraping'
      })
      .eq('id', jobId)

    // Use Jina AI Reader for fast, high-quality markdown conversion
    // Simple GET request - no API key needed for free tier (20 req/min)
    const response = await fetch(`https://r.jina.ai/${url}`)

    if (!response.ok) {
      throw new Error(`Jina Reader API error: ${response.statusText}`)
    }

    const markdown = await response.text()
    const fileSize = Buffer.byteLength(markdown, 'utf8')
    const wordCount = markdown.split(/\s+/).filter((w: string) => w.length > 0).length

    // Generate filename from URL
    const filename = generateFilenameFromUrl(url)
    const storagePath = `${userId}/${Date.now()}-${filename}`

    // Upload markdown to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(storagePath, markdown, {
        contentType: 'text/markdown',
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`)
    }

    // Update job with results (file_path instead of markdown_content)
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'scraped',
        scraping_status: 'scraped',
        file_path: storagePath,
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
        scraping_status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId)
  }
}
