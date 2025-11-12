import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenAI } from '@google/genai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
})

const STORE_NAME = 'fileSearchStores/conversionhelperpages-kk1562zy76aq'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const serverSupabase = await createServerClient()
    const { data: { user } } = await serverSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobIds } = await request.json()

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        { error: 'Job IDs array is required' },
        { status: 400 }
      )
    }

    const results = []

    for (const jobId of jobIds) {
      try {
        // Get the scraping job
        const { data: job, error: jobError } = await supabase
          .from('scraping_jobs')
          .select('*')
          .eq('id', jobId)
          .single()

        if (jobError || !job) {
          results.push({
            jobId,
            success: false,
            error: 'Job not found'
          })
          continue
        }

        if (job.status !== 'scraped') {
          results.push({
            jobId,
            success: false,
            error: `Job status is ${job.status}, must be 'scraped'`
          })
          continue
        }

        if (!job.markdown_content) {
          results.push({
            jobId,
            success: false,
            error: 'No markdown content available'
          })
          continue
        }

        // Update job status to uploading
        await supabase
          .from('scraping_jobs')
          .update({ status: 'uploading' })
          .eq('id', jobId)

        // Upload to File Search
        const title = new URL(job.url).pathname.split('/').pop() || 'page'
        const documentId = await uploadToFileSearch(job.markdown_content, title, job.url)

        // Create or update indexed_pages record
        const { error: indexError } = await supabase
          .from('indexed_pages')
          .upsert({
            user_id: user.id,
            page_url: job.url,
            page_title: title,
            document_id: documentId,
            file_search_store_name: STORE_NAME,
            synced_to_file_search: true,
            source_type: 'scraped', // Mark as scraped content
            markdown_preview: job.markdown_content.substring(0, 500),
            scraped_at: new Date().toISOString(),
            status: 'active',
            metadata: {
              file_size: job.file_size,
              word_count: job.word_count,
              scraping_job_id: job.id
            }
          }, {
            onConflict: 'page_url'
          })

        if (indexError) {
          throw new Error(`Failed to update indexed_pages: ${indexError.message}`)
        }

        // Update job status to completed
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', jobId)

        results.push({
          jobId,
          success: true,
          documentId,
          url: job.url
        })

      } catch (error) {
        console.error(`Error uploading job ${jobId}:`, error)

        // Update job status to failed
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Upload failed'
          })
          .eq('id', jobId)

        results.push({
          jobId,
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: successCount > 0,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      }
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function uploadToFileSearch(
  markdown: string,
  title: string,
  sourceUrl: string
): Promise<string> {
  // Create a file from the markdown content
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const file = new File([blob], `${sanitizeFilename(title)}.md`, { type: 'text/markdown' })

  // Upload to File Search with metadata
  let operation = await ai.fileSearchStores.uploadToFileSearchStore({
    file: file as any,
    fileSearchStoreName: STORE_NAME,
    config: {
      displayName: title,
      customMetadata: [
        { key: 'page_url', stringValue: sourceUrl },
        { key: 'page_title', stringValue: title },
        { key: 'indexed_at', stringValue: new Date().toISOString() }
      ]
    }
  })

  // Wait for upload to complete
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 3000))
    operation = await ai.operations.get({ operation })
  }

  // Extract document ID from operation response
  const documentId = (operation as any).name || `${STORE_NAME}/${sanitizeFilename(title)}-${Date.now()}`

  return documentId
}

function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}
