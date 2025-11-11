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

const STORE_NAME = 'fileSearchStores/conversionhelperpages-kk1562zy76aq'
const PAGE_URL = 'https://www.precisionnutrition.com/nutrition-certification-level-1-register-now'

async function inspectFileSearchStore() {
  console.log('\n🔍 Google AI File Search Store Inspector\n')
  console.log('='.repeat(80))

  try {
    // Get database info
    console.log('\n📦 Your File Search Store (from Supabase):')
    console.log('-'.repeat(80))

    const { data: page, error } = await supabase
      .from('indexed_pages')
      .select('*')
      .eq('page_url', PAGE_URL)
      .single()

    if (error || !page) {
      console.log('   ❌ No indexed page found in database')
    } else {
      console.log(`   Page Title: ${page.page_title}`)
      console.log(`   Store ID: ${page.file_search_store_name}`)
      console.log(`   Last Updated: ${page.scraped_at}`)
      console.log(`   Status: ${page.status}`)

      if (page.metadata?.total_documents) {
        console.log(`\n   📊 Documents: ${page.metadata.total_documents} total`)
        console.log(`      - Sales page: 1`)
        console.log(`      - Support articles: ${page.metadata.total_documents - 1}`)
      }

      console.log(`\n   Preview:`)
      console.log(`   ${page.markdown_preview}`)
    }

    // Test a query to confirm it's working
    console.log('\n\n🧪 Test Query (to confirm File Search is working):')
    console.log('-'.repeat(80))

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'How many textbooks are included?',
      config: {
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [STORE_NAME],
              metadataFilter: `page_url="${PAGE_URL}"`
            }
          }
        ]
      }
    })

    console.log(`   Question: "How many textbooks are included?"`)
    console.log(`   Answer: ${response.text}`)
    console.log(`   ✅ File Search is working!`)

  } catch (error) {
    console.error('\n❌ Error:', error.message)
  }

  // Show rate limits and info
  console.log('\n\n💡 Google AI API Information:')
  console.log('='.repeat(80))
  console.log('\n📊 FREE TIER Rate Limits (default with API key):')
  console.log('   • Requests: 15 RPM (requests per minute)')
  console.log('   • Tokens: 1 million TPM (tokens per minute)')
  console.log('   • Daily limit: 1,500 requests per day')
  console.log('   • File Search: Included in free tier')
  console.log('   • Models: gemini-2.0-flash-lite, gemini-1.5-flash, gemini-1.5-pro')
  console.log('\n   💰 COST: $0 (Free tier)')

  console.log('\n\n📈 PAY-AS-YOU-GO Tier (if you upgrade):')
  console.log('   • Requests: 1,000 RPM')
  console.log('   • Tokens: 4 million TPM')
  console.log('   • No daily limit')
  console.log('   • Pricing: ~$0.075 per 1M input tokens')
  console.log('   •          ~$0.30 per 1M output tokens')
  console.log('   • File Search: Small additional cost per query')

  console.log('\n\n🔗 Useful Links:')
  console.log('   • Google AI Studio: https://aistudio.google.com')
  console.log('   • View/Manage API Keys: https://aistudio.google.com/apikeys')
  console.log('   • Rate Limits & Pricing: https://ai.google.dev/pricing')
  console.log('   • File Search Docs: https://ai.google.dev/gemini-api/docs/file-search')

  console.log('\n\n💬 How to Check Your Usage:')
  console.log('   1. Visit: https://aistudio.google.com')
  console.log('   2. Sign in with your Google account')
  console.log('   3. Click on your API key')
  console.log('   4. View usage stats and quota')

  console.log('\n\n⚠️  Current Limitations:')
  console.log('   • You are likely on the FREE tier')
  console.log('   • If hitting rate limits, wait 1 minute between requests')
  console.log('   • Daily limit of 1,500 requests should be plenty for testing')
  console.log('   • File Search stores: No limit on number of files')
  console.log('   • File size: Each file can be up to 20MB')

  console.log('\n' + '='.repeat(80) + '\n')
}

inspectFileSearchStore().catch(console.error)
