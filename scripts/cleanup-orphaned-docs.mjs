import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import https from 'https'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data))
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`))
        }
      })
    }).on('error', reject)
  })
}

async function cleanupOrphanedDocs() {
  console.log('\n🧹 CLEANUP ORPHANED DOCUMENTS\n')
  console.log('='.repeat(80))

  // Get store name from database
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('file_search_store_name, organization_name')
    .limit(1)
    .single()

  if (userError || !user?.file_search_store_name) {
    console.error('❌ Could not find file search store name in database')
    return
  }

  const STORE_NAME = user.file_search_store_name
  console.log(`📦 Store: ${STORE_NAME}`)
  console.log(`🏢 Organization: ${user.organization_name}\n`)

  // Get all documents from Google File Search (page_size max is 20)
  const url = `https://generativelanguage.googleapis.com/v1beta/${STORE_NAME}/documents?pageSize=20&key=${process.env.GEMINI_API_KEY}`
  const googleDocs = await httpsGet(url)
  const googleDocIds = (googleDocs.documents || []).map(doc => doc.name)

  console.log(`📊 Found ${googleDocIds.length} documents in Google File Search`)

  // Get all document IDs from database
  const { data: dbPages, error: dbError } = await supabase
    .from('indexed_pages')
    .select('document_id, page_title, status')
    .eq('status', 'active')

  if (dbError) {
    console.error('❌ Database error:', dbError)
    return
  }

  const dbDocIds = (dbPages || []).map(page => page.document_id)
  console.log(`📊 Found ${dbDocIds.length} documents in database (status=active)`)

  // Find orphaned documents (in Google but not in DB)
  const orphaned = googleDocIds.filter(googleId => !dbDocIds.includes(googleId))

  if (orphaned.length === 0) {
    console.log('\n✅ No orphaned documents found!')
    return
  }

  console.log(`\n⚠️  Found ${orphaned.length} orphaned documents:\n`)
  orphaned.forEach(docId => {
    const docName = docId.split('/').pop()
    console.log(`   - ${docName}`)
  })

  console.log('\n🗑️  Deleting orphaned documents...\n')

  let successCount = 0
  let failureCount = 0

  for (const docId of orphaned) {
    const docName = docId.split('/').pop()
    console.log(`📄 Deleting: ${docName}`)

    try {
      await ai.fileSearchStores.documents.delete({
        name: docId,
        config: { force: true }
      })
      console.log(`   ✅ Deleted successfully`)
      successCount++
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`)
      failureCount++
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('\n📊 RESULTS:\n')
  console.log(`   ✅ Successfully deleted: ${successCount}`)
  console.log(`   ❌ Failed: ${failureCount}`)
  console.log('\n' + '='.repeat(80) + '\n')
}

cleanupOrphanedDocs().catch(console.error)
