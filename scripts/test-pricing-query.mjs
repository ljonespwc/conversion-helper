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
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testPricingQuery() {
  console.log('\n💰 TEST PRICING QUERY\n')
  console.log('='.repeat(80))

  // Get user's store
  const { data: user } = await supabase
    .from('users')
    .select('file_search_store_name')
    .limit(1)
    .single()

  const STORE_NAME = user.file_search_store_name
  console.log(`📦 Store: ${STORE_NAME}\n`)

  // Test both pages
  const testCases = [
    {
      name: 'L1N Page',
      pageUrl: 'https://www.precisionnutrition.com/nutrition-certification-level-1-register-now',
      question: 'How much does it cost? What are the monthly payment options?'
    },
    {
      name: 'SSR Page',
      pageUrl: 'https://www.precisionnutrition.com/sleep-stress-management-recovery-certification-level-1-half-price',
      question: 'What is the price? Is it on sale?'
    }
  ]

  for (const test of testCases) {
    console.log('='.repeat(80))
    console.log(`\n📄 Testing: ${test.name}`)
    console.log(`   URL: ${test.pageUrl}`)
    console.log(`   Question: "${test.question}"\n`)

    // Build metadata filter exactly like production code (gemini-file-search.ts:49-53)
    const pageUrlConditions = Array.from({ length: 10 }, (_, i) =>
      `page_url_${i} = "${test.pageUrl}"`
    ).join(' OR ')
    const metadataFilter = `(${pageUrlConditions})`

    console.log(`   Metadata Filter: ${metadataFilter}\n`)

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: test.question,
        config: {
          tools: [
            {
              fileSearch: {
                fileSearchStoreNames: [STORE_NAME],
                metadataFilter
              }
            }
          ]
        }
      })

      console.log(`   ✅ Answer: ${response.text}\n`)

      if (response.candidates?.[0]?.groundingMetadata) {
        console.log(`   📚 Citations:`, JSON.stringify(response.candidates[0].groundingMetadata, null, 2))
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`)
    }

    console.log('')
  }

  console.log('='.repeat(80) + '\n')
}

testPricingQuery().catch(console.error)
