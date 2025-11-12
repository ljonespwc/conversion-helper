import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenAI } from '@google/genai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
})

const BUCKET_NAME = 'uploaded-docs'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
const ALLOWED_TYPES = ['text/plain', 'text/markdown']
const ALLOWED_EXTENSIONS = ['.txt', '.md']

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const serverSupabase = await createServerClient()
    const { data: { user } } = await serverSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const results = []

    for (const file of files) {
      try {
        // Validate file type
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
        if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
          results.push({
            filename: file.name,
            success: false,
            error: `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed`
          })
          continue
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          results.push({
            filename: file.name,
            success: false,
            error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
          })
          continue
        }

        // Read file content
        const content = await file.text()

        // Calculate word count
        const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length

        // Generate storage path: {userId}/{timestamp}-{sanitized-filename}
        const timestamp = Date.now()
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
        const storagePath = `${user.id}/${timestamp}-${sanitizedFilename}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, file, {
            contentType: file.type,
            upsert: false
          })

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`)
        }

        // Create file_uploads record
        const { data: uploadRecord, error: dbError } = await supabase
          .from('file_uploads')
          .insert({
            user_id: user.id,
            filename: file.name,
            file_path: storagePath,
            file_size: file.size,
            word_count: wordCount,
            status: 'ready'
          })
          .select()
          .single()

        if (dbError) {
          // Clean up uploaded file if database insert fails
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

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const serverSupabase = await createServerClient()
    const { data: { user } } = await serverSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all file uploads for this user
    const { data: uploads, error } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch uploads: ${error.message}`)
    }

    return NextResponse.json({
      uploads: uploads || []
    })

  } catch (error) {
    console.error('File uploads API error:', error)
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

    const { uploadIds } = await request.json()

    if (!uploadIds || !Array.isArray(uploadIds) || uploadIds.length === 0) {
      return NextResponse.json(
        { error: 'Upload IDs array is required' },
        { status: 400 }
      )
    }

    const results = []

    for (const uploadId of uploadIds) {
      try {
        // Get the file upload record
        const { data: upload, error: uploadError } = await supabase
          .from('file_uploads')
          .select('*')
          .eq('id', uploadId)
          .eq('user_id', user.id) // Ensure user owns this upload
          .single()

        if (uploadError || !upload) {
          results.push({
            uploadId,
            success: false,
            error: 'Upload not found or access denied'
          })
          continue
        }

        // Delete file from Storage if it exists
        if (upload.file_path) {
          const { error: storageError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([upload.file_path])

          if (storageError) {
            console.error(`Storage deletion error for upload ${uploadId}:`, storageError)
            // Continue anyway - might already be deleted
          }
        }

        // Check if this upload has been indexed to File Search
        const { data: indexedPage, error: indexError } = await supabase
          .from('indexed_pages')
          .select('*')
          .eq('user_id', user.id)
          .contains('metadata', { file_upload_id: uploadId })
          .maybeSingle()

        if (!indexError && indexedPage) {
          // Delete from Google File Search (with force: true to delete chunks)
          try {
            await ai.fileSearchStores.documents.delete({
              name: indexedPage.document_id,
              config: { force: true }
            })
          } catch (fileSearchError) {
            console.error(`File Search deletion error for upload ${uploadId}:`, fileSearchError)
            // Continue anyway - document might already be deleted
          }

          // Delete indexed_pages record
          await supabase
            .from('indexed_pages')
            .delete()
            .eq('id', indexedPage.id)
        }

        // Delete file_uploads record
        const { error: deleteError } = await supabase
          .from('file_uploads')
          .delete()
          .eq('id', uploadId)
          .eq('user_id', user.id)

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
