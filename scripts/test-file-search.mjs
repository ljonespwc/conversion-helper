// Test queries for Nutrition Certification page
const nutritionPageUrl = 'https://www.precisionnutrition.com/nutrition-certification-level-1-register-now';
const nutritionQuestions = [
  "What's included in the Level 1 Nutrition Certification?",
  "How much does the certification cost?",
  "What is the money-back guarantee?",
  "Can I write meal plans after this certification?",
  "What's the difference between PN Level 1 and a nutrition degree?"
];

// Test queries for Sleep/Stress page
const sleepPageUrl = 'https://www.precisionnutrition.com/sleep-stress-management-recovery-certification-level-1-half-price';
const sleepQuestions = [
  "What does the Sleep, Stress Management & Recovery certification cover?",
  "Is this certification half price right now?",
  "What will I learn in this course?",
  "How is this different from the regular nutrition certification?",
  "What are the main topics covered?"
];

async function queryAPI(question, pageUrl) {
  const apiUrl = process.env.API_URL || 'https://conversion-helper.vercel.app';

  const response = await fetch(`${apiUrl}/api/page-assistant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, page_url: pageUrl })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error (${response.status}): ${error || 'No error message'}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`API returned error: ${data.error}`);
  }

  return data;
}

async function testPage(pageUrl, questions, pageName) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${pageName}`);
  console.log(`Page URL: ${pageUrl}`);
  console.log('='.repeat(80));

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    console.log(`\n[Q${i + 1}] ${question}`);

    try {
      const result = await queryAPI(question, pageUrl);
      console.log(`[A${i + 1}] ${result.answer}`);

      if (result.citations) {
        console.log(`\n📚 Citations:`, JSON.stringify(result.citations, null, 2));
      }

      // Rate limit: wait 4 seconds between requests (15 per minute = 1 per 4 seconds)
      if (i < questions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
    } catch (error) {
      console.error(`[ERROR] ${error.message}`);
    }
  }
}

async function runTests() {
  try {
    // Test Nutrition Certification page
    await testPage(nutritionPageUrl, nutritionQuestions, 'Nutrition Certification');

    // Wait before testing second page
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test Sleep/Stress page
    await testPage(sleepPageUrl, sleepQuestions, 'Sleep, Stress & Recovery Certification');

    console.log('\n\n✅ All tests completed!');
  } catch (error) {
    console.error('Test suite error:', error);
  }
}

runTests();
