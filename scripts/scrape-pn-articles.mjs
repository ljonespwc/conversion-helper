import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const articles = [
  {
    "title": "What will I learn in the Level 1 Nutrition Certification?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/28689797806996-What-will-I-learn-in-the-Level-1-Nutrition-Certification"
  },
  {
    "title": "Are there any prerequisites for Level 1 Certification?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/360062097152-Are-there-any-prerequisites-for-Level-1-Certification"
  },
  {
    "title": "How long does it take to complete the Level 1 Nutrition Certification?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/23759193039124-How-long-does-it-take-to-complete-the-Level-1-Nutrition-Certification"
  },
  {
    "title": "What is included in the latest version of the PN Level 1 Certification? Is it current?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/360062098752-What-is-included-in-the-latest-version-of-the-PN-Level-1-Certification-Is-it-current"
  },
  {
    "title": "Will the Level 1 Nutrition Certification help me write meal plans?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/28529753342484-Will-the-Level-1-Nutrition-Certification-help-me-write-meal-plans"
  },
  {
    "title": "PN Level 1 vs. a degree in nutrition: What's the difference?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/34952186420244-PN-Level-1-vs-a-degree-in-nutrition-What-s-the-difference"
  },
  {
    "title": "What can I expect to earn as a nutrition/health coach?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/4404376613140-What-can-I-expect-to-earn-as-a-nutrition-health-coach"
  },
  {
    "title": "Is the PN Level 1 Certification valid in my country? I don't live in North America...",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/23757168822036-Is-the-PN-Level-1-Certification-valid-in-my-country-I-don-t-live-in-North-America"
  },
  {
    "title": "I'm interested in the PN L1 Nutrition Certification... what's the cost?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/23739386382356-I-m-interested-in-the-PN-L1-Nutrition-Certification-what-s-the-cost"
  },
  {
    "title": "What's the currency for the prices listed for the PN Level 1 Nutrition Certification?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/28533316428308-What-s-the-currency-for-the-prices-listed-for-the-PN-Level-1-Nutrition-Certification"
  },
  {
    "title": "Are textbooks included or is the content digital?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/360062489571-Are-textbooks-included-or-is-the-content-digital"
  },
  {
    "title": "Are there any additional shipping fees for the Level 1 Nutrition Certification textbooks?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/27267151571860-Are-there-any-additional-shipping-fees-for-the-Level-1-Nutrition-Certification-textbooks"
  },
  {
    "title": "What are the exams like / what's required to complete the PN Level 1 Nutrition Certification?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/23759335697428-What-are-the-exams-like-what-s-required-to-complete-the-PN-Level-1-Nutrition-Certification"
  },
  {
    "title": "What if I fail an exam in the Level 1 Nutrition Certification?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/28957801566996-What-if-I-fail-an-exam-in-the-Level-1-Nutrition-Certification"
  },
  {
    "title": "How long do I have access to my online course materials after I graduate from Level 1 Certification?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/4406996601620-How-long-do-I-have-access-to-my-online-course-materials-after-I-graduate-from-Level-1-Certification"
  },
  {
    "title": "What is the difference between PN Level 1 Certification and the PN System Guides?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/4404375691668-What-is-the-difference-between-PN-Level-1-Certification-and-the-PN-System-Guides"
  },
  {
    "title": "If I finish my Level 1 Certification sooner, do I still owe all 12 monthly payments?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/360062098332-If-I-finish-my-Level-1-Certification-sooner-do-I-still-owe-all-12-monthly-payments"
  },
  {
    "title": "What is the money-back guarantee for Level 1 Certification?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/360062097972-What-is-the-money-back-guarantee-for-Level-1-Certification"
  },
  {
    "title": "Do I need to recertify once I've earned my PN Level 1 Nutrition Coach credential?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/31069666644756-Do-I-need-to-recertify-once-I-ve-earned-my-PN-Level-1-Nutrition-Coach-credential"
  },
  {
    "title": "I have questions about the Level 1 Certification. Can I speak to someone about getting certified?",
    "url": "https://precisionnutrition.zendesk.com/hc/en-us/articles/4406796320276-I-have-questions-about-the-Level-1-Certification-Can-I-speak-to-someone-about-getting-certified"
  }
]

function sanitizeFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

async function scrapeArticle(article, index) {
  const { title, url } = article
  const filename = sanitizeFilename(title)
  const outputPath = path.join(__dirname, '..', 'docs', 'pn-level1-articles', `${filename}.md`)

  console.log(`\n[${index + 1}/20] Scraping: ${title}`)
  console.log(`    URL: ${url}`)

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`
      },
      body: JSON.stringify({
        url,
        formats: ['markdown']
      })
    })

    if (!response.ok) {
      throw new Error(`Firecrawl API error: ${response.statusText}`)
    }

    const data = await response.json()
    const markdown = data.markdown || data.content || ''

    if (!markdown) {
      throw new Error('No markdown content returned')
    }

    await fs.writeFile(outputPath, `# ${title}\n\n${markdown}`)
    console.log(`    ✅ Saved: ${filename}.md (${markdown.length} chars)`)

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000))

  } catch (error) {
    console.error(`    ❌ Error: ${error.message}`)
  }
}

async function main() {
  console.log('🔍 Scraping 20 PN Level 1 Articles\n')
  console.log('='.repeat(80))

  // Load env vars
  const dotenv = await import('dotenv')
  dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

  for (let i = 0; i < articles.length; i++) {
    await scrapeArticle(articles[i], i)
  }

  console.log('\n' + '='.repeat(80))
  console.log('✨ Done! Articles saved to docs/pn-level1-articles/')
}

main().catch(console.error)
