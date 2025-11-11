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

async function testUserQuestions() {
  console.log('🔍 Testing User-Reported Questions\n')
  console.log('='.repeat(80))

  // Get the indexed page info
  const { data: page } = await supabase
    .from('indexed_pages')
    .select('*')
    .eq('page_url', 'https://www.precisionnutrition.com/nutrition-certification-level-1-register-now')
    .single()

  if (!page) {
    console.log('❌ Page not found in database')
    return
  }

  console.log('\n✅ Found indexed page:')
  console.log('  Store:', page.file_search_store_name)
  console.log('  Title:', page.page_title)

  const questions = [
    'Are there testimonials from current grads?',
    'What if I fail an exam?',
    'Am I eligible for CEUs?',
    'What about the guaranteed job interview?'
  ]

  for (const q of questions) {
    console.log('\n' + '-'.repeat(80))
    console.log(`\n❓ Question: "${q}"`)

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: q,
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

      const answer = response.text || 'No answer'
      console.log(`\n   💬 Answer:\n   ${answer}`)

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 3000))

    } catch (error) {
      if (error.status === 429) {
        console.log('   ⚠️  Rate limit hit, waiting 10 seconds...')
        await new Promise(resolve => setTimeout(resolve, 10000))
      } else {
        console.error('   ❌ Error:', error.message)
      }
    }
  }

  console.log('\n' + '='.repeat(80))
}

testUserQuestions().catch(console.error)
