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

async function inspectDocMetadata() {
  console.log('\n🔍 INSPECT DOCUMENT METADATA IN GOOGLE FILE SEARCH\n')
  console.log('='.repeat(80))

  // Get store name from database
  const { data: user } = await supabase
    .from('users')
    .select('file_search_store_name')
    .limit(1)
    .single()

  const STORE_NAME = user.file_search_store_name
  console.log(`📦 Store: ${STORE_NAME}\n`)

  // Get all documents from Google
  const url = `https://generativelanguage.googleapis.com/v1beta/${STORE_NAME}/documents?pageSize=20&key=${process.env.GEMINI_API_KEY}`
  const result = await httpsGet(url)
  const docs = result.documents || []

  console.log(`Found ${docs.length} documents\n`)

  for (const doc of docs) {
    console.log('='.repeat(80))
    console.log(`📄 Document: ${doc.displayName}`)
    console.log(`   ID: ${doc.name.split('/').pop()}`)
    console.log(`\n   📋 Metadata:`)

    if (!doc.customMetadata || doc.customMetadata.length === 0) {
      console.log('      ❌ NO METADATA!')
    } else {
      doc.customMetadata.forEach(m => {
        const value = m.stringValue || m.numericValue || m.boolValue || 'null'
        console.log(`      ${m.key} = ${value}`)
      })
    }
    console.log('')
  }

  console.log('='.repeat(80) + '\n')
}

inspectDocMetadata().catch(console.error)
