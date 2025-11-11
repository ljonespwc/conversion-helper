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

const questions = [
  { q: 'What if I fail an exam?', expect: 'retake policy or attempts' },
  { q: 'Am I eligible for CEUs?', expect: 'CEU organizations or credits' },
  { q: 'What about the guaranteed job interview?', expect: 'job interview guarantee' },
  { q: 'What is the money-back guarantee?', expect: '45-day guarantee' },
  { q: 'Do I need to recertify?', expect: 'recertification requirement' }
]

async function testMissingFAQs() {
  console.log('\n🧪 Testing Missing FAQ Questions\n')
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

  console.log(`\n📄 Testing against: ${page.page_title}`)
  console.log(`🗄️  Store: ${page.file_search_store_name}\n`)

  for (const test of questions) {
    console.log(`\n❓ Question: "${test.q}"`)
    console.log(`🎯 Looking for: ${test.expect}`)
    console.log('-'.repeat(80))

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: test.q,
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

      const answer = response.text
      console.log(`\n📝 Answer: ${answer}`)

      // Check if answer contains expected info
      const hasExpected = answer.toLowerCase().includes(test.expect.toLowerCase().split(' ')[0])
      console.log(`\n${hasExpected ? '✅' : '❌'} Contains expected info: ${hasExpected}`)

      // Check grounding chunks
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      console.log(`📚 Grounding chunks: ${chunks.length}`)

      if (chunks.length > 0 && chunks.length < 3) {
        console.log('\nFirst chunk preview:')
        const firstChunk = chunks[0]?.retrievedContext?.text || ''
        console.log(firstChunk.substring(0, 200) + '...')
      }

      await new Promise(resolve => setTimeout(resolve, 2500))
    } catch (error) {
      console.error(`❌ Error: ${error.message}`)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('✅ Test complete\n')
}

testMissingFAQs().catch(console.error)
