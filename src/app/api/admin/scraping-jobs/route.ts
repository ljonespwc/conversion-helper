import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'

// Service role client for Storage and DB operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
})

export async function GET() {
  try {
    // Get authenticated user
    const serverSupabase = await createServerClient()
    const { data: { user } } = await serverSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization_id
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

    // Fetch jobs for this organization only
    const { data: jobs, error } = await supabaseAdmin
      .from('scraping_jobs')
      .select('id, url, status, scraping_status, indexing_status, file_size, word_count, error_message, created_at, completed_at')
      .eq('organization_id', userData.organization_id)
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

export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const serverSupabase = await createServerClient()
    const { data: { user } } = await serverSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization_id
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
        const { data: job, error: jobError } = await supabaseAdmin
          .from('scraping_jobs')
          .select('*')
          .eq('id', jobId)
          .eq('organization_id', userData.organization_id) // Ensure user's org owns this job
          .single()

        if (jobError || !job) {
          results.push({
            jobId,
            success: false,
            error: 'Job not found or access denied'
          })
          continue
        }

        // Delete file from Storage if it exists
        if (job.file_path) {
          const { error: storageError } = await supabaseAdmin.storage
            .from('uploaded-docs')
            .remove([job.file_path])

          if (storageError) {
            console.error(`Storage deletion error for job ${jobId}:`, storageError)
            // Continue anyway - might already be deleted
          }
        }

        // Check if this job has been indexed to File Search
        const { data: indexedPage, error: indexError } = await supabaseAdmin
          .from('indexed_pages')
          .select('*')
          .eq('organization_id', userData.organization_id)
          .contains('metadata', { scraping_job_id: jobId })
          .maybeSingle()

        if (!indexError && indexedPage) {
          // Delete from Google File Search (with force: true to delete chunks)
          try {
            await ai.fileSearchStores.documents.delete({
              name: indexedPage.document_id,
              config: { force: true }
            })
          } catch (fileSearchError) {
            console.error(`File Search deletion error for job ${jobId}:`, fileSearchError)
            // Continue anyway - document might already be deleted
          }

          // Delete indexed_pages record
          await supabaseAdmin
            .from('indexed_pages')
            .delete()
            .eq('id', indexedPage.id)
        }

        // Delete scraping_jobs record
        const { error: deleteError } = await supabaseAdmin
          .from('scraping_jobs')
          .delete()
          .eq('id', jobId)
          .eq('organization_id', userData.organization_id)

        if (deleteError) {
          throw new Error(`Database deletion failed: ${deleteError.message}`)
        }

        results.push({
          jobId,
          success: true,
          url: job.url
        })

      } catch (error) {
        console.error(`Error deleting job ${jobId}:`, error)
        results.push({
          jobId,
          success: false,
          error: error instanceof Error ? error.message : 'Deletion failed'
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
    console.error('Delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
