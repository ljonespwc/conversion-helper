import { GoogleGenAI } from '@google/genai'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

const STORE_NAME = 'fileSearchStores/conversionhelperpages-kk1562zy76aq'

async function checkDocumentCount() {
  console.log('\n📊 Checking Google File Search document count...\n')
  console.log('Store:', STORE_NAME)
  console.log('='.repeat(80))

  try {
    const documents = []
    const documentPager = await ai.fileSearchStores.documents.list({
      parent: STORE_NAME
    })

    let count = 0
    for await (const doc of documentPager) {
      count++
      documents.push({
        displayName: doc.displayName,
        name: doc.name,
        metadata: doc.customMetadata
      })
    }

    console.log(`\n✅ Total documents in File Search: ${count}`)
    console.log('\nDocument List:')
    console.log('='.repeat(80))

    documents.forEach((doc, i) => {
      const title = doc.metadata?.find(m => m.key === 'article_title')?.stringValue ||
                   doc.metadata?.find(m => m.key === 'page_title')?.stringValue ||
                   doc.displayName
      const sourceUrl = doc.metadata?.find(m => m.key === 'source_url')?.stringValue
      console.log(`\n${i + 1}. ${title}`)
      if (sourceUrl) {
        console.log(`   URL: ${sourceUrl}`)
      }
      console.log(`   ID: ${doc.name.split('/').pop()}`)
    })

    console.log('\n' + '='.repeat(80))
    console.log(`\n📊 Summary: ${count} documents found`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkDocumentCount()
