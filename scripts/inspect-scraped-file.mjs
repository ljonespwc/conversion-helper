import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const filePath = '3ebe4500-c38a-49d4-affd-f9e6d42497db/1762914370626-precisionnutrition.com-sleep-stress-management-recovery-certification-level-1-half-price-1762914370626.md'

// List files in user's folder to verify it exists
const { data: files, error: listError } = await supabase.storage
  .from('uploaded-docs')
  .list('3ebe4500-c38a-49d4-affd-f9e6d42497db', { limit: 10 })

if (listError) {
  console.error('List error:', listError)
} else {
  console.log('Files in folder:', files.map(f => `${f.name} (${f.metadata.size} bytes)`))
}

// Download the file
const { data, error } = await supabase.storage
  .from('uploaded-docs')
  .download(filePath)

if (error) {
  console.error('Download error:', error)
} else {
  const text = await data.text()
  console.log('\n=== First 1000 characters of scraped markdown ===')
  console.log(text.substring(0, 1000))
  console.log('\n=== File stats ===')
  console.log(`Total size: ${text.length} bytes`)
  console.log(`Word count: ${text.split(/\s+/).length}`)
}
