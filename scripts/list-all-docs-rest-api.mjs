import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import https from 'https'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

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

async function listAllDocuments() {
  console.log('\n📊 LISTING ALL DOCUMENTS VIA REST API\n')
  console.log('='.repeat(80))

  // Get store name from database
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('file_search_store_name, organization_name')
    .limit(1)
    .single()

  if (userError || !user?.file_search_store_name) {
    console.error('❌ Could not find file search store name in database')
    console.error('Error:', userError)
    return []
  }

  const STORE_NAME = user.file_search_store_name
  console.log(`📦 Store: ${STORE_NAME}`)
  console.log(`🏢 Organization: ${user.organization_name}\n`)

  const allDocuments = []
  let pageToken = null
  let pageNum = 0

  do {
    pageNum++
    const url = `https://generativelanguage.googleapis.com/v1beta/${STORE_NAME}/documents?pageSize=20${pageToken ? `&pageToken=${pageToken}` : ''}&key=${process.env.GEMINI_API_KEY}`

    console.log(`\n📄 Fetching page ${pageNum}...`)

    try {
      const data = await httpsGet(url)
      const docs = data.documents || []

      console.log(`   ✅ Found ${docs.length} documents on this page`)

      docs.forEach(doc => {
        allDocuments.push(doc)
        const title = doc.customMetadata?.find(m => m.key === 'page_title')?.stringValue || doc.displayName || 'Untitled'
        console.log(`      - ${title}`)
      })

      pageToken = data.nextPageToken
      if (pageToken) {
        console.log(`   📑 Next page token: ${pageToken.substring(0, 30)}...`)
      }

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`)
      break
    }

  } while (pageToken)

  console.log('\n' + '='.repeat(80))
  console.log(`\n✅ TOTAL DOCUMENTS: ${allDocuments.length}`)
  console.log('\n' + '='.repeat(80) + '\n')

  return allDocuments
}

listAllDocuments().catch(console.error)
