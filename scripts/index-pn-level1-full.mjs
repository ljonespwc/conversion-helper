import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, readdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const STORE_NAME = 'fileSearchStores/conversionhelperpages-kk1562zy76aq'
const PAGE_URL = 'https://www.precisionnutrition.com/nutrition-certification-level-1-register-now'

async function indexPNLevel1KnowledgeBase() {
  console.log('\n📚 Indexing PN Level 1 Complete Knowledge Base\n')
  console.log('='.repeat(80))

  const documentIds = []

  // 1. Upload main sales page
  console.log('\n1️⃣  Uploading main sales page...')
  const salesPagePath = join(__dirname, '..', 'docs', 'pn-level1-sales-page-FULL.md')
  const salesPageContent = readFileSync(salesPagePath, 'utf-8')

  const salesPageId = await uploadToFileSearch({
    content: salesPageContent,
    title: 'PN Level 1 Nutrition Certification - Full Sales Page',
    sourceType: 'sales-page',
    sourceUrl: PAGE_URL
  })

  documentIds.push({
    id: salesPageId,
    title: 'PN Level 1 Nutrition Certification - Full Sales Page',
    type: 'sales-page'
  })

  console.log(`   ✅ Uploaded: ${salesPageId}`)

  // 2. Upload all support articles
  console.log('\n2️⃣  Uploading 20 support articles...')
  const articlesDir = join(__dirname, '..', 'docs', 'pn-level1-articles')
  const articleFiles = readdirSync(articlesDir).filter(f => f.endsWith('.md'))

  console.log(`   Found ${articleFiles.length} article files\n`)

  for (let i = 0; i < articleFiles.length; i++) {
    const file = articleFiles[i]
    const filePath = join(articlesDir, file)
    const content = readFileSync(filePath, 'utf-8')

    // Extract title from first H1
    const titleMatch = content.match(/^# (.+)$/m)
    const title = titleMatch ? titleMatch[1] : file.replace('.md', '')

    // Extract Zendesk URL from content
    const urlMatch = content.match(/https:\/\/precisionnutrition\.zendesk\.com[^\s)]+/)
    const sourceUrl = urlMatch ? urlMatch[0] : PAGE_URL

    console.log(`   [${i + 1}/${articleFiles.length}] ${title.substring(0, 60)}...`)

    const docId = await uploadToFileSearch({
      content,
      title,
      sourceType: 'support-article',
      sourceUrl
    })

    documentIds.push({
      id: docId,
      title,
      type: 'support-article',
      sourceUrl
    })

    console.log(`       ✅ Uploaded: ${docId}`)

    // Rate limiting - wait between uploads
    if (i < articleFiles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  // 3. Update Supabase database
  console.log('\n3️⃣  Updating Supabase database...')

  const { error: dbError } = await supabase
    .from('indexed_pages')
    .update({
      page_title: 'PN Level 1 Nutrition Certification - Complete Knowledge Base',
      markdown_preview: `Complete knowledge base with ${documentIds.length} documents: 1 main sales page + 20 support articles. Covers all aspects of PN Level 1 Certification including pricing, curriculum, FAQs, CEUs, job interviews, recertification, and more.`,
      scraped_at: new Date().toISOString(),
      status: 'active',
      metadata: {
        total_documents: documentIds.length,
        document_ids: documentIds,
        last_indexed: new Date().toISOString(),
        indexed_by: 'index-pn-level1-full.mjs'
      }
    })
    .eq('page_url', PAGE_URL)

  if (dbError) {
    console.error('   ❌ Database error:', dbError.message)
    throw dbError
  }

  console.log('   ✅ Database updated successfully')

  // 4. Summary
  console.log('\n' + '='.repeat(80))
  console.log('✅ INDEXING COMPLETE\n')
  console.log(`📊 Total documents indexed: ${documentIds.length}`)
  console.log(`   - Sales page: 1`)
  console.log(`   - Support articles: ${documentIds.length - 1}`)
  console.log(`\n🗄️  File Search Store: ${STORE_NAME}`)
  console.log(`🔗 Page URL: ${PAGE_URL}`)
  console.log('\n' + '='.repeat(80) + '\n')
}

async function uploadToFileSearch({ content, title, sourceType, sourceUrl }) {
  try {
    // Create a file from the markdown content
    const blob = new Blob([content], { type: 'text/markdown' })
    const file = new File([blob], `${sanitizeFilename(title)}.md`, { type: 'text/markdown' })

    // Upload to File Search with metadata
    let operation = await ai.fileSearchStores.uploadToFileSearchStore({
      file: file,
      fileSearchStoreName: STORE_NAME,
      config: {
        displayName: title,
        customMetadata: [
          { key: 'page_url', stringValue: PAGE_URL },
          { key: 'source_type', stringValue: sourceType },
          { key: 'source_url', stringValue: sourceUrl },
          { key: 'article_title', stringValue: title },
          { key: 'indexed_at', stringValue: new Date().toISOString() }
        ]
      }
    })

    // Wait for upload to complete
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 3000))
      operation = await ai.operations.get({ operation })
    }

    // Extract document ID from operation response
    const documentId = operation.name || `${STORE_NAME}/${sanitizeFilename(title)}-${Date.now()}`

    return documentId
  } catch (error) {
    console.error(`   ❌ Upload error for "${title}":`, error.message)
    throw error
  }
}

function sanitizeFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

indexPNLevel1KnowledgeBase().catch(console.error)
