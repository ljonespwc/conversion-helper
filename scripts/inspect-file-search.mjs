import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function inspectFileSearch() {
  console.log('🔍 Inspecting Google File Search Store\n')
  console.log('='.repeat(80))

  // Get the indexed page from database
  const { data: page } = await supabase
    .from('indexed_pages')
    .select('*')
    .eq('page_url', 'https://www.precisionnutrition.com/nutrition-certification-level-1-register-now')
    .single()

  if (!page) {
    console.log('❌ Page not found in Supabase')
    return
  }

  console.log('\n📊 Supabase Record:')
  console.log('  Store:', page.file_search_store_name)
  console.log('  Document ID:', page.document_id)
  console.log('  Title:', page.page_title)
  console.log('  Scraped at:', page.scraped_at)
  console.log('  Markdown preview length:', page.markdown_preview?.length || 0)

  // Query the store to see what content is retrievable
  console.log('\n\n🔎 Testing File Search Query (searching for "CEU"):')
  console.log('='.repeat(80))

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'What are the CEU options available?',
      config: {
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [page.file_search_store_name],
              metadataFilter: `page_url="${page.page_url}"`
            }
          }
        ]
      }
    })

    console.log('\n📝 Response:', response.text)
    console.log('\n📚 Grounding Metadata:')
    console.log(JSON.stringify(response.candidates?.[0]?.groundingMetadata, null, 2))

  } catch (error) {
    console.error('❌ Query error:', error.message)
  }

  // Try getting the store details
  console.log('\n\n📂 Store Details:')
  console.log('='.repeat(80))

  try {
    const store = await ai.fileSearchStores.get({ fileSearchStoreName: page.file_search_store_name })
    console.log('  Name:', store.name)
    console.log('  Display Name:', store.displayName)
    console.log('  Create Time:', store.createTime)
    console.log('  Update Time:', store.updateTime)
  } catch (error) {
    console.error('❌ Error getting store:', error.message)
  }

  console.log('\n' + '='.repeat(80))
}

inspectFileSearch().catch(console.error)
