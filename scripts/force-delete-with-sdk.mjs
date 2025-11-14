import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 4 old duplicates + 21 untitled
const OLD_DUPLICATES = [
  'barsea1u8y1i-xi7czxc154fn',
  '7az9rr8v4zjw-43x6pnnk1lqu',
  'sde1x01iop8y-38ryds5upnoz',
  '7e41iszd6vjz-zergr4z0xpge'
]

const docsToDelete = JSON.parse(
  fs.readFileSync(join(__dirname, 'docs-to-delete.json'), 'utf-8')
)

const allToDelete = [...OLD_DUPLICATES, ...docsToDelete]

async function forceDeleteAllDocs() {
  console.log('\n🗑️  FORCE DELETING WITH SDK (force: true)\n')
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
    return
  }

  const STORE_NAME = user.file_search_store_name
  console.log(`📦 Store: ${STORE_NAME}`)
  console.log(`🏢 Organization: ${user.organization_name}`)
  console.log(`\nDeleting ${allToDelete.length} documents...\n`)

  let successCount = 0
  let failureCount = 0

  for (const docId of allToDelete) {
    const fullDocPath = `${STORE_NAME}/documents/${docId}`
    console.log(`\n📄 Deleting: ${docId}`)

    try {
      await ai.fileSearchStores.documents.delete({
        name: fullDocPath,
        config: { force: true }
      })
      console.log(`   ✅ Deleted successfully (with chunks)`)
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

forceDeleteAllDocs().catch(console.error)
