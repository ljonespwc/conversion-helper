import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
})

const STORE_NAME = 'fileSearchStores/conversionhelperpages-kk1562zy76aq'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // List all documents in the File Search store
    const documents = []
    const documentPager = await ai.fileSearchStores.documents.list({
      parent: STORE_NAME
    })

    // Collect all documents (iterate through the async iterable)
    for await (const doc of documentPager) {
      documents.push({
        id: doc.name || '',
        displayName: doc.displayName || 'Untitled',
        createTime: doc.createTime || new Date().toISOString(),
        updateTime: doc.updateTime || new Date().toISOString(),
        customMetadata: doc.customMetadata || [],
      })
    }

    return NextResponse.json({
      documents,
      total: documents.length,
      storeName: STORE_NAME
    })
  } catch (error) {
    console.error('Error fetching File Search documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch File Search documents' },
      { status: 500 }
    )
  }
}
