import { scrapePage, indexPage } from '../src/lib/gemini-file-search';

const PAGE_URL = 'https://www.precisionnutrition.com/nutrition-certification-level-1-register-now';

async function main() {
  try {
    console.log('🔍 Scraping page:', PAGE_URL);
    const { markdown, title } = await scrapePage(PAGE_URL);

    console.log(`✅ Scraped: "${title}" (${markdown.length} characters)`);
    console.log('\n📤 Indexing to Gemini File Search...');

    const { documentId, storeName } = await indexPage(PAGE_URL, markdown, title);

    console.log('✅ Successfully indexed!');
    console.log('  Document ID:', documentId);
    console.log('  Store Name:', storeName);
    console.log('  Page URL:', PAGE_URL);

    console.log('\n🎉 Done! The page is now ready for queries.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
