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

async function testMetadataFilter() {
  console.log('\n🧪 TESTING METADATA FILTER ISOLATION\n')
  console.log('='.repeat(80))

  // Get user's store
  const { data: user } = await supabase
    .from('users')
    .select('file_search_store_name')
    .limit(1)
    .single()

  const STORE_NAME = user.file_search_store_name
  console.log(`📦 Store: ${STORE_NAME}\n`)

  // Test Case: Select L1N page, ask about SSR content
  const L1N_URL = 'https://www.precisionnutrition.com/nutrition-certification-level-1-register-now'
  const SSR_URL = 'https://www.precisionnutrition.com/sleep-stress-management-recovery-certification-level-1-half-price'

  console.log('='.repeat(80))
  console.log(`\n🔬 TEST: L1N page selected, asking about SSR program authors`)
  console.log(`   Selected Page: ${L1N_URL}`)
  console.log(`   Question: "Who are the program authors for Sleep, Stress & Recovery?"`)
  console.log(`   Expected: Should NOT match SSR document\n`)

  // Build metadata filter exactly like production code (gemini-file-search.ts:49-53)
  const pageUrlConditions = Array.from({ length: 10 }, (_, i) =>
    `page_url_${i} = "${L1N_URL}"`
  ).join(' OR ')
  const metadataFilter = `(${pageUrlConditions})`

  console.log(`   Metadata Filter: ${metadataFilter.substring(0, 150)}...\n`)

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Who are the program authors for Sleep, Stress & Recovery?',
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
      const grounding = response.candidates[0].groundingMetadata
      console.log(`   📚 Grounding Metadata:`, JSON.stringify(grounding, null, 2))

      // Check which documents were matched
      if (grounding.groundingChunks) {
        console.log(`\n   🔍 Documents Matched:`)
        grounding.groundingChunks.forEach((chunk, i) => {
          console.log(`      ${i + 1}. ${chunk.documentReference?.documentName || 'Unknown'}`)
        })
      }
    } else {
      console.log(`   ⚠️  NO GROUNDING METADATA - Answer may be hallucinated or from general knowledge`)
    }

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`)
  }

  console.log('\n' + '='.repeat(80))
  console.log('\n🔬 TEST 2: SSR page selected, asking about SSR program authors')
  console.log(`   Selected Page: ${SSR_URL}`)
  console.log(`   Question: "Who are the program authors for Sleep, Stress & Recovery?"`)
  console.log(`   Expected: SHOULD match SSR document\n`)

  // Build filter for SSR
  const ssrPageUrlConditions = Array.from({ length: 10 }, (_, i) =>
    `page_url_${i} = "${SSR_URL}"`
  ).join(' OR ')
  const ssrMetadataFilter = `(${ssrPageUrlConditions})`

  console.log(`   Metadata Filter: ${ssrMetadataFilter.substring(0, 150)}...\n`)

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Who are the program authors for Sleep, Stress & Recovery?',
      config: {
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [STORE_NAME],
              metadataFilter: ssrMetadataFilter
            }
          }
        ]
      }
    })

    console.log(`   ✅ Answer: ${response.text}\n`)

    if (response.candidates?.[0]?.groundingMetadata) {
      const grounding = response.candidates[0].groundingMetadata
      console.log(`   📚 Grounding Metadata:`, JSON.stringify(grounding, null, 2))

      if (grounding.groundingChunks) {
        console.log(`\n   🔍 Documents Matched:`)
        grounding.groundingChunks.forEach((chunk, i) => {
          console.log(`      ${i + 1}. ${chunk.documentReference?.documentName || 'Unknown'}`)
        })
      }
    }

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`)
  }

  console.log('\n' + '='.repeat(80) + '\n')
}

testMetadataFilter().catch(console.error)
