import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { GoogleGenAI } from '@google/genai'

export const dynamic = 'force-dynamic'

// Service role client for DB operations (bypasses RLS)
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
})

export async function GET() {
  try {
    const serverSupabase = await createClient()

    // Get current user
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
      return NextResponse.json({ error: 'User organization not found' }, { status: 400 })
    }

    // Get organization's File Search store name
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('file_search_store_name')
      .eq('id', userData.organization_id)
      .single()

    if (orgError || !orgData?.file_search_store_name) {
      return NextResponse.json({ error: 'Organization store not found' }, { status: 400 })
    }

    const storeName = orgData.file_search_store_name

    // Fetch documents from Google File Search (source of truth) - parallel with DB query
    const [googleDocsResult, dbPagesResult] = await Promise.all([
      // Fetch from Google File Search with pagination
      (async () => {
        try {
          const allDocs = []
          let pageToken: string | null = null

          do {
            const url: string = `https://generativelanguage.googleapis.com/v1beta/${storeName}/documents?pageSize=20${pageToken ? `&pageToken=${pageToken}` : ''}&key=${process.env.GEMINI_API_KEY}`
            const response = await fetch(url)

            if (!response.ok) {
              throw new Error(`Google API error: ${response.statusText}`)
            }

            const data = await response.json()
            allDocs.push(...(data.documents || []))
            pageToken = data.nextPageToken
          } while (pageToken)

          return allDocs
        } catch (error) {
          console.error('Error fetching from Google File Search:', error)
          return []
        }
      })(),
      // Fetch from database
      supabaseAdmin
        .from('indexed_pages')
        .select('*')
        .eq('organization_id', userData.organization_id)
        .eq('status', 'active')
    ])

    const googleDocs = googleDocsResult
    const dbPages = dbPagesResult.data || []

    // Create lookup maps for efficient O(1) comparison
    const googleDocsBySourceUrl = new Map()
    const dbPagesBySourceUrl = new Map()
    const dbPagesByDocId = new Map()

    // Build Google docs map (keyed by source_url from metadata)
    googleDocs.forEach((doc: any) => {
      const sourceUrl = doc.customMetadata?.find((m: any) => m.key === 'source_url')?.stringValue
      if (sourceUrl) {
        googleDocsBySourceUrl.set(sourceUrl, doc)
      }
    })

    // Build DB maps
    dbPages.forEach((page: any) => {
      dbPagesBySourceUrl.set(page.page_url, page)
      if (page.document_id) {
        dbPagesByDocId.set(page.document_id, page)
      }
    })

    // Build combined result with sync status
    const combinedPages: Array<{
      id: string
      document_id: string
      page_url: string | undefined
      page_title: string
      page_urls: string[]
      scraped_at: string | undefined
      sync_status: 'synced' | 'orphaned' | 'missing_from_google' | 'id_mismatch'
      in_google: boolean
      in_database: boolean
    }> = []

    // Process documents from Google (source of truth)
    googleDocs.forEach((doc: any) => {
      const docId = doc.name
      const sourceUrl = doc.customMetadata?.find((m: any) => m.key === 'source_url')?.stringValue
      const pageTitle = doc.customMetadata?.find((m: any) => m.key === 'page_title')?.stringValue || doc.displayName || 'Untitled'
      const indexedAt = doc.customMetadata?.find((m: any) => m.key === 'indexed_at')?.stringValue

      // Extract page URLs from metadata (page_url_0, page_url_1, etc.)
      const pageUrls = doc.customMetadata
        ?.filter((m: any) => m.key.startsWith('page_url_'))
        .map((m: any) => m.stringValue)
        .filter(Boolean) || []

      const dbPage = sourceUrl ? dbPagesBySourceUrl.get(sourceUrl) : null

      let syncStatus: 'synced' | 'orphaned' | 'id_mismatch'
      let dbId: string | null = null

      if (!dbPage) {
        syncStatus = 'orphaned'
      } else if (dbPage.document_id !== docId) {
        syncStatus = 'id_mismatch'
        dbId = dbPage.id
      } else {
        syncStatus = 'synced'
        dbId = dbPage.id
      }

      combinedPages.push({
        id: dbId || `orphan-${docId.split('/').pop()}`, // Use DB id if available, else temp id
        document_id: docId,
        page_url: sourceUrl,
        page_title: pageTitle,
        page_urls: pageUrls,
        scraped_at: indexedAt,
        sync_status: syncStatus,
        in_google: true,
        in_database: !!dbPage
      })
    })

    // Process DB pages that are missing from Google
    dbPages.forEach((dbPage: any) => {
      if (!googleDocsBySourceUrl.has(dbPage.page_url)) {
        combinedPages.push({
          id: dbPage.id,
          document_id: dbPage.document_id,
          page_url: dbPage.page_url,
          page_title: dbPage.page_title,
          page_urls: dbPage.page_urls || [],
          scraped_at: dbPage.scraped_at,
          sync_status: 'missing_from_google',
          in_google: false,
          in_database: true
        })
      }
    })

    // Sort by indexed date (most recent first)
    combinedPages.sort((a, b) => {
      const dateA = a.scraped_at ? new Date(a.scraped_at).getTime() : 0
      const dateB = b.scraped_at ? new Date(b.scraped_at).getTime() : 0
      return dateB - dateA
    })

    return NextResponse.json({
      pages: combinedPages,
      summary: {
        total: combinedPages.length,
        synced: combinedPages.filter(p => p.sync_status === 'synced').length,
        orphaned: combinedPages.filter(p => p.sync_status === 'orphaned').length,
        missing_from_google: combinedPages.filter(p => p.sync_status === 'missing_from_google').length,
        id_mismatch: combinedPages.filter(p => p.sync_status === 'id_mismatch').length
      }
    })
  } catch (error) {
    console.error('Error fetching indexed pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch indexed pages' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const serverSupabase = await createClient()

    // Get authenticated user
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

    const { pageIds } = await request.json()

    if (!pageIds || !Array.isArray(pageIds) || pageIds.length === 0) {
      return NextResponse.json(
        { error: 'Page IDs array is required' },
        { status: 400 }
      )
    }

    const results = []

    for (const pageId of pageIds) {
      try {
        // Get the indexed page
        const { data: page, error: pageError } = await supabaseAdmin
          .from('indexed_pages')
          .select('*')
          .eq('id', pageId)
          .eq('organization_id', userData.organization_id) // Ensure user's org owns this page
          .single()

        if (pageError || !page) {
          results.push({
            pageId,
            success: false,
            error: 'Page not found or access denied'
          })
          continue
        }

        // Reset source record status to allow re-indexing
        if (page.source_type === 'scraped' && page.metadata?.scraping_job_id) {
          await supabaseAdmin
            .from('scraping_jobs')
            .update({
              indexing_status: 'not_indexed',
              status: 'scraped' // Keep scraping status as completed
            })
            .eq('id', page.metadata.scraping_job_id)
        } else if (page.source_type === 'uploaded' && page.metadata?.file_upload_id) {
          await supabaseAdmin
            .from('file_uploads')
            .update({
              status: 'ready' // Reset to ready for re-indexing
            })
            .eq('id', page.metadata.file_upload_id)
        }

        // Delete from Google File Search (with force: true to delete chunks)
        try {
          await ai.fileSearchStores.documents.delete({
            name: page.document_id,
            config: { force: true }
          })
        } catch (fileSearchError) {
          console.error(`File Search deletion error for page ${pageId}:`, fileSearchError)
          // Continue anyway - document might already be deleted
        }

        // Delete indexed_pages record (hard delete, not soft delete)
        const { error: deleteError } = await supabaseAdmin
          .from('indexed_pages')
          .delete()
          .eq('id', pageId)
          .eq('organization_id', userData.organization_id)

        if (deleteError) {
          throw new Error(`Database deletion failed: ${deleteError.message}`)
        }

        results.push({
          pageId,
          success: true,
          title: page.page_title
        })

      } catch (error) {
        console.error(`Error deleting page ${pageId}:`, error)
        results.push({
          pageId,
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
