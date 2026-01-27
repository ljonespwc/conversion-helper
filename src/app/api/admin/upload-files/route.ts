import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenAI } from '@google/genai'
import { fileTypeFromBuffer } from 'file-type'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
})

const BUCKET_NAME = 'uploaded-docs'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per file
const MAX_BATCH_SIZE = 50 * 1024 * 1024 // 50MB total per request
const ALLOWED_EXTENSIONS = ['.txt', '.md']

type UploadResult = {
  filename: string
  success: boolean
  error?: string
  upload?: Record<string, unknown>
}

type DeleteResult = {
  uploadId: string
  success: boolean
  error?: string
  filename?: string
}

function formatBytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`
}

function createSummary<T extends { success: boolean }>(results: T[]): {
  total: number
  successful: number
  failed: number
} {
  const successful = results.filter(r => r.success).length
  return {
    total: results.length,
    successful,
    failed: results.length - successful
  }
}

async function getAuthenticatedUserOrg(): Promise<
  | { user: { id: string }; organizationId: string; error?: never }
  | { user?: never; organizationId?: never; error: NextResponse }
> {
  const serverSupabase = await createServerClient()
  const { data: { user } } = await serverSupabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (userError || !userData?.organization_id) {
    return { error: NextResponse.json({ error: 'User organization not found' }, { status: 400 }) }
  }

  return { user, organizationId: userData.organization_id }
}

function validateFileExtension(filename: string): { valid: boolean; extension: string } {
  const extension = '.' + filename.split('.').pop()?.toLowerCase()
  return {
    valid: ALLOWED_EXTENSIONS.includes(extension),
    extension
  }
}

async function validateFileContent(buffer: Buffer): Promise<
  | { valid: true; content: string }
  | { valid: false; error: string }
> {
  const detectedType = await fileTypeFromBuffer(buffer)

  if (detectedType) {
    return {
      valid: false,
      error: `Invalid file type detected: ${detectedType.mime}. Only plain text and markdown files are allowed.`
    }
  }

  const content = buffer.toString('utf-8')

  if (content.includes('\0')) {
    return {
      valid: false,
      error: 'File contains binary data. Only plain text and markdown files are allowed.'
    }
  }

  return { valid: true, content }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getAuthenticatedUserOrg()
    if (auth.error) return auth.error

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Batch too large. Total size is ${formatBytes(totalSize)}, maximum is ${formatBytes(MAX_BATCH_SIZE)}` },
        { status: 400 }
      )
    }

    const results: UploadResult[] = []

    for (const file of files) {
      try {
        const extensionCheck = validateFileExtension(file.name)
        if (!extensionCheck.valid) {
          results.push({
            filename: file.name,
            success: false,
            error: `Invalid file extension. Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed`
          })
          continue
        }

        if (file.size > MAX_FILE_SIZE) {
          results.push({
            filename: file.name,
            success: false,
            error: `File too large. Maximum size is ${formatBytes(MAX_FILE_SIZE)}`
          })
          continue
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const contentValidation = await validateFileContent(buffer)

        if (!contentValidation.valid) {
          results.push({
            filename: file.name,
            success: false,
            error: contentValidation.error
          })
          continue
        }

        const wordCount = contentValidation.content.trim().split(/\s+/).filter(word => word.length > 0).length
        const timestamp = Date.now()
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
        const storagePath = `${auth.user.id}/${timestamp}-${sanitizedFilename}`

        const contentType = extensionCheck.extension === '.md' ? 'text/markdown' : 'text/plain'
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, file, {
            contentType,
            upsert: false
          })

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`)
        }

        const { data: uploadRecord, error: dbError } = await supabase
          .from('file_uploads')
          .insert({
            organization_id: auth.organizationId,
            created_by_user_id: auth.user.id,
            filename: file.name,
            file_path: storagePath,
            file_size: file.size,
            word_count: wordCount,
            status: 'ready'
          })
          .select()
          .single()

        if (dbError) {
          await supabase.storage.from(BUCKET_NAME).remove([storagePath])
          throw new Error(`Database insert failed: ${dbError.message}`)
        }

        results.push({
          filename: file.name,
          success: true,
          upload: uploadRecord
        })
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        results.push({
          filename: file.name,
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed'
        })
      }
    }

    const summary = createSummary(results)

    return NextResponse.json({
      success: summary.successful > 0,
      results,
      summary
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    const auth = await getAuthenticatedUserOrg()
    if (auth.error) return auth.error

    const { data: uploads, error } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('organization_id', auth.organizationId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch uploads: ${error.message}`)
    }

    return NextResponse.json({ uploads: uploads || [] })
  } catch (error) {
    console.error('File uploads API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getAuthenticatedUserOrg()
    if (auth.error) return auth.error

    const { uploadIds } = await request.json()

    if (!uploadIds || !Array.isArray(uploadIds) || uploadIds.length === 0) {
      return NextResponse.json({ error: 'Upload IDs array is required' }, { status: 400 })
    }

    const results: DeleteResult[] = []

    for (const uploadId of uploadIds) {
      try {
        const { data: upload, error: uploadError } = await supabase
          .from('file_uploads')
          .select('*')
          .eq('id', uploadId)
          .eq('organization_id', auth.organizationId)
          .single()

        if (uploadError || !upload) {
          results.push({
            uploadId,
            success: false,
            error: 'Upload not found or access denied'
          })
          continue
        }

        if (upload.file_path) {
          const { error: storageError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([upload.file_path])

          if (storageError) {
            console.error(`Storage deletion error for upload ${uploadId}:`, storageError)
          }
        }

        const { data: indexedPage, error: indexError } = await supabase
          .from('indexed_pages')
          .select('*')
          .eq('organization_id', auth.organizationId)
          .contains('metadata', { file_upload_id: uploadId })
          .maybeSingle()

        if (!indexError && indexedPage) {
          try {
            await ai.fileSearchStores.documents.delete({
              name: indexedPage.document_id,
              config: { force: true }
            })
          } catch (fileSearchError) {
            console.error(`File Search deletion error for upload ${uploadId}:`, fileSearchError)
          }

          await supabase
            .from('indexed_pages')
            .delete()
            .eq('id', indexedPage.id)
        }

        const { error: deleteError } = await supabase
          .from('file_uploads')
          .delete()
          .eq('id', uploadId)
          .eq('organization_id', auth.organizationId)

        if (deleteError) {
          throw new Error(`Database deletion failed: ${deleteError.message}`)
        }

        results.push({
          uploadId,
          success: true,
          filename: upload.filename
        })
      } catch (error) {
        console.error(`Error deleting upload ${uploadId}:`, error)
        results.push({
          uploadId,
          success: false,
          error: error instanceof Error ? error.message : 'Deletion failed'
        })
      }
    }

    const summary = createSummary(results)

    return NextResponse.json({
      success: summary.successful > 0,
      results,
      summary
    })
  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
