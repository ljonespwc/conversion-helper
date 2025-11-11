import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const PAGE_URL = 'https://www.precisionnutrition.com/nutrition-certification-level-1-register-now'
const STORE = 'fileSearchStores/conversionhelperpages-kk1562zy76aq'

// Full markdown from Firecrawl MCP (inline to avoid file I/O)
const markdown = `Jump to...

[What's included](https://www.precisionnutrition.com/nutrition-certification-level-1-register-now#whats-included) [What you'll learn](https://www.precisionnutrition.com/nutrition-certification-level-1-register-now#what-youll-learn) [Program authors](https://www.precisionnutrition.com/nutrition-certification-level-1-register-now#program-authors) [What our grads say](https://www.precisionnutrition.com/nutrition-certification-level-1-register-now#what-our-grads-say) [How PN is different](https://www.precisionnutrition.com/nutrition-certification-level-1-register-now#how-pn-is-different) [Pricing](https://www.precisionnutrition.com/nutrition-certification-level-1-register-now#pricing) [FAQ](https://www.precisionnutrition.com/nutrition-certification-level-1-register-now#faq)

## What's included in the program

### Textbooks in a beautiful box set

3 textbooks with 20 chapters covering everything you need to know about nutrition science and behavior-change coaching. Plus workbook and study guide to help you retain and apply what you've learned.

### Short end-of-chapter exams

Each exam is 10 questions each, for a total of 200 questions. Get at least 150 of the questions correct (75%) to earn your PN1 credentials. Most of our students pass on the first try. But just in case you don't, you'll still have 5 more tries.

## What you'll learn

Throughout the textbooks and online materials, you'll learn our ​​science-proven nutrition coaching system​ for guiding anyone step-by-step to better physical ​and​ mental health.

Self-paced

20 chapters

Real-world case studies

Live Q&As

Community access

The Precision Nutrition ApproachUnit 1

Learn how you can use our proven coaching system to help people reach all their goals.

IntroductionChapter 1

How the program works + A few key coaching principles.

Your learning planChapter 2

Set expectations and take charge of your path.

What is a great coach?Chapter 3

The critical differences between a good coach and a great coach.

Helping people changeChapter 4

Our 5-S formula for helping your clients move forward, even when things get tough.

What is good nutrition?Chapter 5

Why there is no "best diet". Plus how to use data to make nutritional choices.

The Science of NutritionUnit 2

Learn the ins and outs of nutrition science based on the latest cutting-edge research—from macro- and micronutrients, to energy balance, digestion, hydration, and more.

Intro to nutritional scienceChapter 6

A brief overview + Why science matters for coaches.

Systems and cellsChapter 7

The body's basic systems + The role of nutrition in cellular health.

Through the GI tractChapter 8

The GI tract, digestion, nutrient processing, and more.

Energy transformation and metabolismChapter 9

How we get energy from food, energy transfer in the body, and the role of macronutrients.

Energy balanceChapter 10

How we get, expend, and measure energy; what affects energy balance; and adjusting energy balance for clients.

MacronutrientsChapter 11

The three major macronutrients (carbohydrate, fat and protein), why we need them, and how much we should eat.

Micronutrients and whole foodsChapter 12

The role of micronutrients (vitamins, minerals, and other compounds). Plus why whole, less processed foods are the ideal sources of these.

Water and fluid balanceChapter 13

All about hydration and how our body regulates and balances our fluids.

Stress, recovery, and sleepChapter 14

Stress and the body's response to it, how we can boost recovery, our circadian rhythms, and why sleep is so important.

Working through the PN Coaching ProcessUnit 3

Learn how to coach anyone from nutritional newcomers and recreational exercisers to high-level competitors.

Coaching in practiceChapter 15

PN's proven 6-step coaching process + Working with various nutrition client "levels".

Working with Level 1 clientsChapter 16

The core skills and practices that make up the foundational "essentials" for all clients.

Working with Level 2 clientsChapter 17

Targeted tactics for clients with specific goals, and for those ready to try more complex tasks.

Working with Level 3 clientsChapter 18

Helping advanced nutrition clients safely achieve specific, short-term, aggressive, usually aesthetic goals.

Special scenariosChapter 19

Addressing common situations such as injuries, food sensitivities, aging, disordered eating, and more.

Business 101Chapter 20

Multiple successful business models to choose from, how to make your coaching more effective and efficient, how to attract clients, and how to build a stellar reputation.

## Program authors

Developed by some of the world's top nutrition coaching experts.

### John Berardi

PHD  CSCS

Dr. John Berardi is a co-founder of Precision Nutrition and has been recognized as one of the 20 smartest coaches in the world. He holds a PhD in Exercise Physiology and Nutrient Biochemistry from the University of Western Ontario. He has advised and consulted thousands of clients including Olympic gold medalists, professional sports teams, Apple, Nike, and Equinox. His work has been published in numerous textbooks, academic journals, and countless exercise and nutrition books and magazines.

### Krista Scott-Dixon

PHD

Krista has been the intellectual powerhouse behind PN's coaching curriculum. She holds a PhD from York University and has over 20 years of experience in research, education, curriculum design, coaching, and counseling. Krista has helped thousands of people transform their health and fitness for the better, and has guided countless health and fitness professionals to a higher level of success.`

console.log('📤 Uploading', markdown.length, 'chars to Google File Search...')

const file = new File([new Blob([markdown], { type: 'text/markdown' })], 'PN.md', { type: 'text/markdown' })

let op = await ai.fileSearchStores.uploadToFileSearchStore({
  file,
  fileSearchStoreName: STORE,
  config: {
    displayName: 'PN Level 1 Nutrition Certification',
    customMetadata: [
      { key: 'page_url', stringValue: PAGE_URL },
      { key: 'page_title', stringValue: 'PN Level 1 Nutrition Certification' },
      { key: 'indexed_at', stringValue: new Date().toISOString() }
    ]
  }
})

console.log('⏳ Waiting...')
while (!op.done) {
  await new Promise(r => setTimeout(r, 3000))
  op = await ai.operations.get({ operation: op })
}

console.log('✅ Uploaded')

await supabase.from('indexed_pages').delete().eq('page_url', PAGE_URL)
await supabase.from('indexed_pages').insert({
  page_url: PAGE_URL,
  page_title: 'PN Level 1 Nutrition Certification',
  document_id: op.name,
  file_search_store_name: STORE,
  markdown_preview: markdown.substring(0, 500),
  scraped_at: new Date().toISOString(),
  status: 'active'
})

console.log('💾 DB updated')

// Verify
const stores = await ai.fileSearchStores.list()
const store = stores.pageInternal?.find(s => s.name === STORE)
console.log('\n📊 Store size:', store?.sizeBytes, 'bytes (expected ~', file.size, ')')

// Test ALL critical queries
console.log('\n🧪 TESTING...\n')
await new Promise(r => setTimeout(r, 5000))

const tests = [
  'How many chapters are in the program?',
  'How many textbooks are included?',
  'Who are the program authors?',
  'What is the exam structure?',
  'What is the passing grade?'
]

let passed = 0
for (const q of tests) {
  const resp = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: q,
    config: { tools: [{ fileSearch: { fileSearchStoreNames: [STORE], metadataFilter: `page_url="${PAGE_URL}"` } }] }
  })
  const a = resp.text
  const success = (
    (q.includes('chapters') && a.includes('20')) ||
    (q.includes('textbooks') && a.includes('3')) ||
    (q.includes('authors') && (a.includes('John Berardi') || a.includes('Krista'))) ||
    (q.includes('exam') && a.includes('10')) ||
    (q.includes('passing') && a.includes('75'))
  )
  console.log(success ? '✅' : '❌', q)
  console.log('   ', a.substring(0, 100))
  if (success) passed++
  await new Promise(r => setTimeout(r, 2000))
}

console.log(`\n${passed}/${tests.length} tests passed`)
console.log(passed === tests.length ? '\n🎉 ALL TESTS PASSED!' : '\n⚠️  Some tests failed')
