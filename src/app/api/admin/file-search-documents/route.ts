import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
})

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

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

    // Get organization's File Search store
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('file_search_store_name')
      .eq('id', userData.organization_id)
      .single()

    if (orgError || !orgData?.file_search_store_name) {
      return NextResponse.json(
        { error: 'Organization does not have a File Search store' },
        { status: 400 }
      )
    }

    const storeName = orgData.file_search_store_name

    // List all documents in the organization's File Search store
    // The async iterator handles pagination automatically
    const documents = []
    const documentPager = await ai.fileSearchStores.documents.list({
      parent: storeName
    })

    // Collect all documents (async iterator handles pagination)
    let pageCount = 0
    for await (const doc of documentPager) {
      documents.push({
        id: doc.name || '',
        displayName: doc.displayName || 'Untitled',
        createTime: doc.createTime || new Date().toISOString(),
        updateTime: doc.updateTime || new Date().toISOString(),
        customMetadata: doc.customMetadata || [],
      })

      // Log pagination progress
      if (documents.length % 10 === 0) {
        pageCount++
        console.log(`  Page ${pageCount}: ${documents.length} documents so far...`)
      }
    }

    console.log(`Retrieved ${documents.length} total documents from File Search`)

    return NextResponse.json({
      documents,
      total: documents.length,
      storeName
    })
  } catch (error) {
    console.error('Error fetching File Search documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch File Search documents' },
      { status: 500 }
    )
  }
}
