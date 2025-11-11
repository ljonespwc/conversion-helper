import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const STORE_NAME = 'conversion-helper-pages';
const PAGE_URL = 'https://www.precisionnutrition.com/nutrition-certification-level-1-register-now';
const PAGE_TITLE = 'PN Level 1 Nutrition Certification';

// Shortened markdown for testing (full version is too long for this demo)
const MARKDOWN = `# Transform lives doing what you love with the world's #1 rated Nutrition Certification.

Whether you want to help your clients achieve lasting results, improve your own health, or start a work-from-home career or side business you're passionate about—now is the perfect time to invest in a future that excites you.

## PN Nutrition Certification overview

In the PN Nutrition Certification, you'll gain the knowledge, skills, and tools you need to confidently coach nutrition with anyone.

### Self-paced, community supported
Learn at your own pace. Connect with your peers and PN's experts.

### High earning potential
Our grads charge approximately $65 – $130 USD per hour for their coaching services.

### #1 recommended nutrition certification
According to Business Insider and a recent industry survey.

## Pricing

**Monthly Payment: $59 USD/month for 12 months**
**Single Payment: $599 USD**

Save $200 USD off the regular price of $799 USD.

100% money-back guarantee within 45 days.`;

async function main() {
  try {
    console.log('📦 Getting or creating File Search store...');

    // Get or create store
    const stores = await ai.fileSearchStores.list();
    let store;
    for await (const s of stores) {
      if (s.displayName === STORE_NAME) {
        store = s;
        break;
      }
    }

    if (!store) {
      store = await ai.fileSearchStores.create({
        config: { displayName: STORE_NAME }
      });
      console.log('✅ Created new store:', store.name);
    } else {
      console.log('✅ Found existing store:', store.name);
    }

    console.log('\n📤 Uploading to File Search...');

    // Create file from markdown
    const blob = new Blob([MARKDOWN], { type: 'text/markdown' });
    const file = new File([blob], `${PAGE_TITLE}.md`, { type: 'text/markdown' });

    // Upload to File Search
    let operation = await ai.fileSearchStores.uploadToFileSearchStore({
      file: file,
      fileSearchStoreName: store.name,
      config: {
        displayName: PAGE_TITLE,
        customMetadata: [
          { key: 'page_url', stringValue: PAGE_URL },
          { key: 'page_title', stringValue: PAGE_TITLE },
          { key: 'indexed_at', stringValue: new Date().toISOString() }
        ]
      }
    });

    // Wait for upload
    while (!operation.done) {
      console.log('⏳ Waiting for upload to complete...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.get({ operation });
    }

    const documentId = operation.name || `${store.name}/${PAGE_TITLE}-${Date.now()}`;
    console.log('✅ Uploaded! Document ID:', documentId);

    console.log('\n💾 Saving to Supabase...');

    // Save to Supabase
    const { error } = await supabase
      .from('indexed_pages')
      .upsert({
        page_url: PAGE_URL,
        page_title: PAGE_TITLE,
        document_id: documentId,
        file_search_store_name: store.name,
        markdown_preview: MARKDOWN.substring(0, 500),
        scraped_at: new Date().toISOString(),
        status: 'active',
        metadata: {
          title: PAGE_TITLE,
          url: PAGE_URL,
          indexed_at: new Date().toISOString()
        }
      }, {
        onConflict: 'page_url'
      });

    if (error) {
      throw error;
    }

    console.log('✅ Saved to database!');
    console.log('\n🎉 Success! The page is now indexed and ready for queries.');
    console.log('   Page URL:', PAGE_URL);
    console.log('   Store:', store.name);
    console.log('   Document ID:', documentId);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
