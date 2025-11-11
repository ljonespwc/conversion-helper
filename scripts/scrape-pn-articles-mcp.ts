/**
 * This script uses the Firecrawl MCP to scrape PN Level 1 articles
 * Run manually by calling the MCP tool for each URL
 */

export const articles = [
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

export function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}
