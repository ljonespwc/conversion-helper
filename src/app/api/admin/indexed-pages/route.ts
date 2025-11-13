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

    // Get indexed pages for this user
    const { data: pages, error } = await supabaseAdmin
      .from('indexed_pages')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ pages: pages || [] })
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
          .eq('user_id', user.id) // Ensure user owns this page
          .single()

        if (pageError || !page) {
          results.push({
            pageId,
            success: false,
            error: 'Page not found or access denied'
          })
          continue
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
          .eq('user_id', user.id)

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
