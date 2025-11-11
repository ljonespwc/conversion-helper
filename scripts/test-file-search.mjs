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

async function testFileSearch() {
  console.log('🔍 Testing Gemini File Search Direct Query\n')
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
  console.log('  Indexed:', page.scraped_at)

  const tests = [
    // Original working tests
    { q: 'How many chapters are in the program?', expected: '20 chapters' },
    { q: 'How many textbooks?', expected: '3 textbooks' },
    { q: 'Who are the program authors?', expected: 'John Berardi' },
    { q: 'What is the exam structure?', expected: '10 questions' },
    { q: 'What is the passing grade?', expected: '75%' },

    // New tests from user feedback
    { q: 'Are there testimonials from current grads?', expected: 'testimonial' },
    { q: 'What if I fail an exam?', expected: 'fail' },
    { q: 'Am I eligible for CEUs?', expected: 'CEU' },
    { q: 'What about the guaranteed job interview?', expected: 'interview' }
  ]

  for (const test of tests) {
    console.log('\n' + '-'.repeat(80))
    console.log(`\n❓ Question: "${test.q}"`)
    console.log(`   Expected to find: "${test.expected}"`)

    try {
      // Query WITHOUT metadata filter
      console.log('\n   🔓 WITHOUT metadata filter (searching entire store)...')
      const responseNoFilter = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: test.q,
        config: {
          tools: [
            {
              fileSearch: {
                fileSearchStoreNames: [page.file_search_store_name]
                // NO metadataFilter - search everything
              }
            }
          ]
        }
      })

      const answerNoFilter = responseNoFilter.text || 'No answer'
      console.log(`   Answer: ${answerNoFilter.substring(0, 200)}...`)
      console.log(`   ✓ Contains "${test.expected}"?`, answerNoFilter.includes(test.expected))

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Query WITH metadata filter
      console.log(`\n   🔐 WITH metadata filter (page_url="...")...`)
      const responseWithFilter = await ai.models.generateContent({
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

      const answerWithFilter = responseWithFilter.text || 'No answer'
      console.log(`   Answer: ${answerWithFilter.substring(0, 200)}...`)
      console.log(`   ✓ Contains "${test.expected}"?`, answerWithFilter.includes(test.expected))

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000))

    } catch (error) {
      if (error.status === 429) {
        console.log('   ⚠️  Rate limit hit, stopping tests')
        break
      }
      console.error('   ❌ Error:', error.message)
    }
  }

  console.log('\n' + '='.repeat(80))
}

testFileSearch().catch(console.error)
