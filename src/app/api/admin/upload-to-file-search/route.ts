import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenAI } from '@google/genai'

// Service role client for Storage operations (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
})

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const serverSupabase = await createServerClient()
    const { data: { user } } = await serverSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization and File Search store
    const { data: userData, error: userError } = await supabase
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

    // Get organization's File Search store
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('file_search_store_name')
      .eq('id', userData.organization_id)
      .single()

    if (orgError || !orgData?.file_search_store_name) {
      return NextResponse.json(
        { error: 'Organization does not have a File Search store. Please contact support.' },
        { status: 400 }
      )
    }

    const userStoreName = orgData.file_search_store_name

    const { jobIds = [], uploadIds = [], pageUrls = [] } = await request.json()

    if ((!jobIds || !Array.isArray(jobIds)) && (!uploadIds || !Array.isArray(uploadIds))) {
      return NextResponse.json(
        { error: 'Job IDs or Upload IDs array is required' },
        { status: 400 }
      )
    }

    if (jobIds.length === 0 && uploadIds.length === 0) {
      return NextResponse.json(
        { error: 'No items selected for upload' },
        { status: 400 }
      )
    }

    // Validate pageUrls if provided
    if (pageUrls.length > 0 && !Array.isArray(pageUrls)) {
      return NextResponse.json(
        { error: 'pageUrls must be an array' },
        { status: 400 }
      )
    }

    // Normalize page URLs to ensure trailing slashes for consistent matching
    // Only add trailing slash to ROOT URLs (e.g., "https://example.com" -> "https://example.com/")
    // Path URLs like "https://example.com/page" stay as-is (matching gemini-file-search.ts logic)
    const normalizedPageUrls = pageUrls.map((url: string) => {
      try {
        const parsed = new URL(url)
        // Add trailing slash only if it's a root URL (no path or just "/")
        if (!parsed.pathname || parsed.pathname === '/') {
          return url.endsWith('/') ? url : `${url}/`
        }
        return url // Path URLs stay as-is
      } catch {
        return url // Invalid URL - use as-is
      }
    })

    const results = []

    // Process scraped jobs
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

        // Check if scraping is complete and either not indexed or failed
        if (job.scraping_status !== 'scraped') {
          results.push({
            jobId,
            success: false,
            error: `Scraping not complete (status: ${job.scraping_status})`
          })
          continue
        }

        if (!['not_indexed', 'failed'].includes(job.indexing_status)) {
          results.push({
            jobId,
            success: false,
            error: `Already indexed or in progress (status: ${job.indexing_status})`
          })
          continue
        }

        if (!job.file_path) {
          results.push({
            jobId,
            success: false,
            error: 'No file path available'
          })
          continue
        }

        // Update indexing status to uploading
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'uploading',
            indexing_status: 'uploading'
          })
          .eq('id', jobId)

        // Download markdown from Supabase Storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('uploaded-docs')
          .download(job.file_path)

        if (downloadError || !fileData) {
          throw new Error(`Storage download failed: ${downloadError?.message || 'File not found'}`)
        }

        // Read file content as text
        const markdown = await fileData.text()

        // Upload to File Search
        const title = new URL(job.url).pathname.split('/').pop() || 'page'
        const documentId = await uploadToFileSearch(markdown, title, job.url, normalizedPageUrls, userStoreName)

        // Create or update indexed_pages record
        const indexedPageData: any = {
          organization_id: userData.organization_id,
          created_by_user_id: user.id,
          page_url: job.url,
          page_title: title,
          document_id: documentId,
          file_search_store_name: userStoreName,
          synced_to_file_search: true,
          source_type: 'scraped', // Mark as scraped content
          markdown_preview: markdown.substring(0, 500),
          scraped_at: new Date().toISOString(),
          status: 'active',
          page_urls: normalizedPageUrls, // Array of pages where this content should be available
          metadata: {
            file_size: job.file_size,
            word_count: job.word_count,
            scraping_job_id: job.id
          }
        }

        const { error: indexError } = await supabase
          .from('indexed_pages')
          .upsert(indexedPageData, {
            onConflict: 'page_url'
          })

        if (indexError) {
          throw new Error(`Failed to update indexed_pages: ${indexError.message}`)
        }

        // Update indexing status to indexed and clear any previous error
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'completed',
            indexing_status: 'indexed',
            error_message: null,
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

        // Update indexing status to failed (scraping succeeded, indexing failed)
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'failed',
            indexing_status: 'failed',
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

    // Process uploaded files
    for (const uploadId of uploadIds) {
      try {
        // Get the file upload record
        const { data: upload, error: uploadError } = await supabase
          .from('file_uploads')
          .select('*')
          .eq('id', uploadId)
          .single()

        if (uploadError || !upload) {
          results.push({
            uploadId,
            success: false,
            error: 'Upload not found'
          })
          continue
        }

        if (upload.status !== 'ready' && upload.status !== 'failed') {
          results.push({
            uploadId,
            success: false,
            error: `Upload status is ${upload.status}, must be 'ready' or 'failed'`
          })
          continue
        }

        // Update status to uploading
        await supabase
          .from('file_uploads')
          .update({ status: 'uploading' })
          .eq('id', uploadId)

        // Download file from Supabase Storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('uploaded-docs')
          .download(upload.file_path)

        if (downloadError || !fileData) {
          throw new Error(`Storage download failed: ${downloadError?.message || 'File not found'}`)
        }

        // Read file content as text
        const content = await fileData.text()

        // Extract title from filename (remove extension)
        const title = upload.filename.replace(/\.(txt|md)$/i, '')

        // Generate unique upload identifier for matching DB records with Google docs
        // Format: upload://{sanitized-filename}-{timestamp}
        const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 100)
        const uploadIdentifier = `upload://${sanitizedTitle}-${Date.now()}`

        // Upload to File Search with upload identifier as sourceUrl
        const documentId = await uploadToFileSearch(content, title, uploadIdentifier, normalizedPageUrls, userStoreName)

        // Create indexed_pages record
        // For uploaded files, use uploadIdentifier as page_url for consistent matching
        // This ensures DB records can be matched to Google docs via source_url
        const uploadIndexedPageData: any = {
          organization_id: userData.organization_id,
          created_by_user_id: user.id,
          page_url: uploadIdentifier, // Use upload identifier for matching
          page_title: title,
          document_id: documentId,
          file_search_store_name: userStoreName,
          synced_to_file_search: true,
          source_type: 'uploaded',
          markdown_preview: content.substring(0, 500),
          scraped_at: new Date().toISOString(),
          status: 'active',
          page_urls: normalizedPageUrls, // Array of pages where this content should be available
          metadata: {
            file_size: upload.file_size,
            word_count: upload.word_count,
            file_upload_id: upload.id,
            original_filename: upload.filename
          }
        }

        const { error: indexError } = await supabase
          .from('indexed_pages')
          .insert(uploadIndexedPageData)

        if (indexError) {
          throw new Error(`Failed to update indexed_pages: ${indexError.message}`)
        }

        // Update file_uploads status to completed and clear any previous error
        await supabase
          .from('file_uploads')
          .update({
            status: 'completed',
            error_message: null,
            completed_at: new Date().toISOString()
          })
          .eq('id', uploadId)

        results.push({
          uploadId,
          success: true,
          documentId,
          filename: upload.filename
        })

      } catch (error) {
        console.error(`Error uploading file ${uploadId}:`, error)

        // Update status to failed
        await supabase
          .from('file_uploads')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Upload failed'
          })
          .eq('id', uploadId)

        results.push({
          uploadId,
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
  sourceUrl: string,
  pageUrls: string[],
  userStoreName: string
): Promise<string> {
  // Create a file from the markdown content
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const file = new File([blob], `${sanitizeFilename(title)}.md`, { type: 'text/markdown' })

  // Build custom metadata array
  // sourceUrl is either the actual URL (for scraped pages) or upload identifier (for uploaded files)
  const customMetadata: Array<{ key: string; stringValue: string }> = [
    { key: 'source_url', stringValue: sourceUrl },
    { key: 'page_title', stringValue: title },
    { key: 'indexed_at', stringValue: new Date().toISOString() }
  ]

  // Add each page URL with indexed keys to avoid duplicate key errors
  // Google File Search doesn't allow duplicate keys, so we use: page_url_0, page_url_1, etc.
  // Max 10 pages per document (reasonable limit)
  const maxPages = Math.min(pageUrls.length, 10)
  for (let i = 0; i < maxPages; i++) {
    customMetadata.push({ key: `page_url_${i}`, stringValue: pageUrls[i] })
  }

  // Upload to File Search with metadata
  let operation = await ai.fileSearchStores.uploadToFileSearchStore({
    file: file as any,
    fileSearchStoreName: userStoreName,
    config: {
      displayName: title,
      customMetadata
    }
  })

  // Wait for upload to complete
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 3000))
    operation = await ai.operations.get({ operation })
  }

  // Extract document ID from operation response
  // The operation.response contains the actual document resource name
  const response = (operation as any).response
  let documentId = response?.name || (operation as any).name

  // Convert operation ID to document ID if needed
  // Operation format: fileSearchStores/STORE/upload/operations/ID
  // Document format:  fileSearchStores/STORE/documents/ID
  if (documentId.includes('/upload/operations/')) {
    documentId = documentId.replace('/upload/operations/', '/documents/')
    console.log('⚠️ Converted operation ID to document ID:', documentId)
  }

  console.log('📄 File Search upload completed:', {
    operationName: (operation as any).name,
    documentName: response?.name,
    finalDocumentId: documentId,
    sourceUrl
  })

  return documentId
}

function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}
