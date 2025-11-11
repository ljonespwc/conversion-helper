import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const USER_ID = '3ebe4500-c38a-49d4-affd-f9e6d42497db'

async function verifySupabaseSyncStatus() {
  console.log('\n📊 VERIFYING SUPABASE SYNC STATUS\n')
  console.log('='.repeat(80))

  const { data: pages, error } = await supabase
    .from('indexed_pages')
    .select('*')
    .eq('user_id', USER_ID)
    .order('page_title')

  if (error) {
    console.error('❌ Error:', error.message)
    throw error
  }

  const synced = pages.filter(p => p.synced_to_file_search)
  const notSynced = pages.filter(p => !p.synced_to_file_search)

  console.log(`\n✅ Synced to File Search: ${synced.length}`)
  console.log('='.repeat(80))
  synced.forEach((page, i) => {
    console.log(`${i + 1}. ${page.page_title}`)
    console.log(`   ID: ${page.document_id.split('/').pop()}`)
  })

  if (notSynced.length > 0) {
    console.log(`\n\n⚠️  NOT Synced: ${notSynced.length}`)
    console.log('='.repeat(80))
    notSynced.forEach((page, i) => {
      console.log(`${i + 1}. ${page.page_title}`)
    })
  }

  console.log('\n' + '='.repeat(80))
  console.log(`\n📊 SUMMARY:`)
  console.log(`   - Total pages in Supabase: ${pages.length}`)
  console.log(`   - Synced to File Search: ${synced.length}`)
  console.log(`   - Not synced: ${notSynced.length}`)
  console.log('\n' + '='.repeat(80) + '\n')

  if (synced.length === 21 && notSynced.length === 0) {
    console.log('✨ PERFECT! All 21 documents are correctly synced.\n')
  } else {
    console.log(`⚠️  Expected 21 synced, got ${synced.length}. Review needed.\n`)
  }
}

verifySupabaseSyncStatus().catch(console.error)
