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

interface UploadResult {
  jobId?: string
  uploadId?: string
  success: boolean
  error?: string
  documentId?: string
  url?: string
  filename?: string
}

interface RequestBody {
  jobIds?: string[]
  uploadIds?: string[]
  pageUrls?: string[]
}

function normalizePageUrl(url: string): string {
  try {
    const parsed = new URL(url)
    // Add trailing slash only if it's a root URL (no path or just "/")
    if (!parsed.pathname || parsed.pathname === '/') {
      return url.endsWith('/') ? url : `${url}/`
    }
    return url
  } catch {
    return url
  }
}

function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Upload failed'
}

async function downloadFromStorage(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('uploaded-docs')
    .download(filePath)

  if (error || !data) {
    throw new Error(`Storage download failed: ${error?.message || 'File not found'}`)
  }

  return data.text()
}

async function uploadToFileSearch(
  markdown: string,
  title: string,
  sourceUrl: string,
  pageUrls: string[],
  userStoreName: string
): Promise<string> {
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const file = new File([blob], `${sanitizeFilename(title)}.md`, { type: 'text/markdown' })

  const customMetadata: Array<{ key: string; stringValue: string }> = [
    { key: 'source_url', stringValue: sourceUrl },
    { key: 'page_title', stringValue: title },
    { key: 'indexed_at', stringValue: new Date().toISOString() }
  ]

  // Add page URLs with indexed keys (max 10 pages per document)
  const maxPages = Math.min(pageUrls.length, 10)
  for (let i = 0; i < maxPages; i++) {
    customMetadata.push({ key: `page_url_${i}`, stringValue: pageUrls[i] })
  }

  let operation = await ai.fileSearchStores.uploadToFileSearchStore({
    file: file as File & { arrayBuffer(): Promise<ArrayBuffer> },
    fileSearchStoreName: userStoreName,
    config: {
      displayName: title,
      customMetadata
    }
  })

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 3000))
    operation = await ai.operations.get({ operation })
  }

  const response = operation.response as { name?: string } | undefined
  let documentId = response?.name || operation.name || ''

  // Convert operation ID to document ID if needed
  if (documentId.includes('/upload/operations/')) {
    documentId = documentId.replace('/upload/operations/', '/documents/')
    console.log('Converted operation ID to document ID:', documentId)
  }

  console.log('File Search upload completed:', {
    operationName: operation.name,
    documentName: response?.name,
    finalDocumentId: documentId,
    sourceUrl
  })

  return documentId
}

async function processScrapedJob(
  jobId: string,
  userId: string,
  organizationId: string,
  normalizedPageUrls: string[],
  userStoreName: string
): Promise<UploadResult> {
  const { data: job, error: jobError } = await supabase
    .from('scraping_jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (jobError || !job) {
    return { jobId, success: false, error: 'Job not found' }
  }

  if (job.scraping_status !== 'scraped') {
    return { jobId, success: false, error: `Scraping not complete (status: ${job.scraping_status})` }
  }

  if (!['not_indexed', 'failed'].includes(job.indexing_status)) {
    return { jobId, success: false, error: `Already indexed or in progress (status: ${job.indexing_status})` }
  }

  if (!job.file_path) {
    return { jobId, success: false, error: 'No file path available' }
  }

  await supabase
    .from('scraping_jobs')
    .update({ status: 'uploading', indexing_status: 'uploading' })
    .eq('id', jobId)

  const markdown = await downloadFromStorage(job.file_path)
  const title = new URL(job.url).pathname.split('/').pop() || 'page'
  const documentId = await uploadToFileSearch(markdown, title, job.url, normalizedPageUrls, userStoreName)

  const { error: indexError } = await supabase
    .from('indexed_pages')
    .upsert({
      organization_id: organizationId,
      created_by_user_id: userId,
      page_url: job.url,
      page_title: title,
      document_id: documentId,
      file_search_store_name: userStoreName,
      synced_to_file_search: true,
      source_type: 'scraped',
      markdown_preview: markdown.substring(0, 500),
      scraped_at: new Date().toISOString(),
      status: 'active',
      page_urls: normalizedPageUrls,
      metadata: {
        file_size: job.file_size,
        word_count: job.word_count,
        scraping_job_id: job.id
      }
    }, { onConflict: 'page_url' })

  if (indexError) {
    throw new Error(`Failed to update indexed_pages: ${indexError.message}`)
  }

  await supabase
    .from('scraping_jobs')
    .update({
      status: 'completed',
      indexing_status: 'indexed',
      error_message: null,
      completed_at: new Date().toISOString()
    })
    .eq('id', jobId)

  return { jobId, success: true, documentId, url: job.url }
}

async function processUploadedFile(
  uploadId: string,
  userId: string,
  organizationId: string,
  normalizedPageUrls: string[],
  userStoreName: string
): Promise<UploadResult> {
  const { data: upload, error: uploadError } = await supabase
    .from('file_uploads')
    .select('*')
    .eq('id', uploadId)
    .single()

  if (uploadError || !upload) {
    return { uploadId, success: false, error: 'Upload not found' }
  }

  if (upload.status !== 'ready' && upload.status !== 'failed') {
    return { uploadId, success: false, error: `Upload status is ${upload.status}, must be 'ready' or 'failed'` }
  }

  await supabase
    .from('file_uploads')
    .update({ status: 'uploading' })
    .eq('id', uploadId)

  const content = await downloadFromStorage(upload.file_path)
  const title = upload.filename.replace(/\.(txt|md)$/i, '')
  const sanitizedTitle = sanitizeFilename(title)
  const uploadIdentifier = `upload://${sanitizedTitle}-${Date.now()}`

  const documentId = await uploadToFileSearch(content, title, uploadIdentifier, normalizedPageUrls, userStoreName)

  const { error: indexError } = await supabase
    .from('indexed_pages')
    .insert({
      organization_id: organizationId,
      created_by_user_id: userId,
      page_url: uploadIdentifier,
      page_title: title,
      document_id: documentId,
      file_search_store_name: userStoreName,
      synced_to_file_search: true,
      source_type: 'uploaded',
      markdown_preview: content.substring(0, 500),
      scraped_at: new Date().toISOString(),
      status: 'active',
      page_urls: normalizedPageUrls,
      metadata: {
        file_size: upload.file_size,
        word_count: upload.word_count,
        file_upload_id: upload.id,
        original_filename: upload.filename
      }
    })

  if (indexError) {
    throw new Error(`Failed to update indexed_pages: ${indexError.message}`)
  }

  await supabase
    .from('file_uploads')
    .update({
      status: 'completed',
      error_message: null,
      completed_at: new Date().toISOString()
    })
    .eq('id', uploadId)

  return { uploadId, success: true, documentId, filename: upload.filename }
}

async function handleJobFailure(jobId: string, error: unknown): Promise<void> {
  await supabase
    .from('scraping_jobs')
    .update({
      status: 'failed',
      indexing_status: 'failed',
      error_message: getErrorMessage(error)
    })
    .eq('id', jobId)
}

async function handleUploadFailure(uploadId: string, error: unknown): Promise<void> {
  await supabase
    .from('file_uploads')
    .update({
      status: 'failed',
      error_message: getErrorMessage(error)
    })
    .eq('id', uploadId)
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const serverSupabase = await createServerClient()
    const { data: { user } } = await serverSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.organization_id) {
      return NextResponse.json({ error: 'User organization not found' }, { status: 400 })
    }

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

    const { jobIds = [], uploadIds = [], pageUrls = [] }: RequestBody = await request.json()

    if (!Array.isArray(jobIds) || !Array.isArray(uploadIds)) {
      return NextResponse.json({ error: 'Job IDs or Upload IDs array is required' }, { status: 400 })
    }

    if (jobIds.length === 0 && uploadIds.length === 0) {
      return NextResponse.json({ error: 'No items selected for upload' }, { status: 400 })
    }

    if (pageUrls.length > 0 && !Array.isArray(pageUrls)) {
      return NextResponse.json({ error: 'pageUrls must be an array' }, { status: 400 })
    }

    const normalizedPageUrls = pageUrls.map(normalizePageUrl)
    const results: UploadResult[] = []

    for (const jobId of jobIds) {
      try {
        const result = await processScrapedJob(
          jobId,
          user.id,
          userData.organization_id,
          normalizedPageUrls,
          orgData.file_search_store_name
        )
        results.push(result)
      } catch (error) {
        console.error(`Error uploading job ${jobId}:`, error)
        await handleJobFailure(jobId, error)
        results.push({ jobId, success: false, error: getErrorMessage(error) })
      }
    }

    for (const uploadId of uploadIds) {
      try {
        const result = await processUploadedFile(
          uploadId,
          user.id,
          userData.organization_id,
          normalizedPageUrls,
          orgData.file_search_store_name
        )
        results.push(result)
      } catch (error) {
        console.error(`Error uploading file ${uploadId}:`, error)
        await handleUploadFailure(uploadId, error)
        results.push({ uploadId, success: false, error: getErrorMessage(error) })
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
