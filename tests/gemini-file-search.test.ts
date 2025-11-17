import { describe, it, expect, beforeAll } from 'vitest'
import { queryPageContent, getIndexedPage } from '../src/lib/gemini-file-search'

const TEST_PAGE_URL = 'https://www.precisionnutrition.com/nutrition-certification-level-1-register-now'

describe('Gemini File Search - Precision Nutrition Page', () => {
  beforeAll(async () => {
    // Verify the page is indexed before running tests
    const indexedPage = await getIndexedPage(TEST_PAGE_URL)
    if (!indexedPage) {
      throw new Error(`Page ${TEST_PAGE_URL} is not indexed. Please index it first.`)
    }
    console.log('✅ Page is indexed:', indexedPage.page_title)
    console.log('📅 Scraped at:', indexedPage.scraped_at)
  })

  describe('Basic Facts - Should Answer Correctly', () => {
    it('should know how many chapters are in the program', async () => {
      const { answer } = await queryPageContent(
        'How many chapters are in the certification program?',
        TEST_PAGE_URL
      )

      console.log('Question: How many chapters?')
      console.log('Answer:', answer)

      // Should mention "20 chapters"
      expect(answer.toLowerCase()).toMatch(/20\s+chapters?/)
    }, 30000)

    it('should know how many textbooks are included', async () => {
      const { answer } = await queryPageContent(
        'How many textbooks are included in the program?',
        TEST_PAGE_URL
      )

      console.log('Question: How many textbooks?')
      console.log('Answer:', answer)

      expect(answer.toLowerCase()).toMatch(/3\s+textbooks?/)
    }, 30000)

    it('should list the program authors', async () => {
      const { answer } = await queryPageContent(
        'Who are the program authors?',
        TEST_PAGE_URL
      )

      console.log('Question: Who are the authors?')
      console.log('Answer:', answer)

      // Should mention at least some of the key authors
      const hasJohnBerardi = answer.toLowerCase().includes('john berardi') ||
                             answer.toLowerCase().includes('berardi')
      const hasKrista = answer.toLowerCase().includes('krista') ||
                       answer.toLowerCase().includes('scott-dixon')

      expect(hasJohnBerardi || hasKrista).toBe(true)
    }, 30000)

    it('should know the certification cost', async () => {
      const { answer } = await queryPageContent(
        'How much does the certification cost?',
        TEST_PAGE_URL
      )

      console.log('Question: How much does it cost?')
      console.log('Answer:', answer)

      // Should mention pricing ($599 single payment or $59/month)
      expect(answer).toMatch(/\$599|\$59/)
    }, 30000)

    it('should know how long it takes to complete', async () => {
      const { answer } = await queryPageContent(
        'How long does it take to complete the certification?',
        TEST_PAGE_URL
      )

      console.log('Question: How long to complete?')
      console.log('Answer:', answer)

      // Should mention 20 weeks or self-paced or 3-5 hours per week
      const mentionsDuration =
        answer.toLowerCase().includes('20 weeks') ||
        answer.toLowerCase().includes('self-paced') ||
        answer.toLowerCase().includes('3-5 hours')

      expect(mentionsDuration).toBe(true)
    }, 30000)
  })

  describe('Detailed Information - Should Find Specific Details', () => {
    it('should know about the money-back guarantee', async () => {
      const { answer } = await queryPageContent(
        'Is there a money-back guarantee?',
        TEST_PAGE_URL
      )

      console.log('Question: Money-back guarantee?')
      console.log('Answer:', answer)

      expect(answer.toLowerCase()).toMatch(/45.day|45 day|money.back/)
    }, 30000)

    it('should know what CEUs are offered', async () => {
      const { answer } = await queryPageContent(
        'What continuing education units does this qualify for?',
        TEST_PAGE_URL
      )

      console.log('Question: What CEUs?')
      console.log('Answer:', answer)

      // Should mention NASM, ACSM, ACE, or other certifying bodies
      const mentionsCEUs =
        answer.includes('NASM') ||
        answer.includes('ACSM') ||
        answer.includes('ACE') ||
        answer.toLowerCase().includes('continuing education')

      expect(mentionsCEUs).toBe(true)
    }, 30000)

    it('should know about the exam structure', async () => {
      const { answer } = await queryPageContent(
        'What are the exams like?',
        TEST_PAGE_URL
      )

      console.log('Question: Exam structure?')
      console.log('Answer:', answer)

      // Should mention 10 questions per chapter or 200 total questions
      expect(answer).toMatch(/10\s+questions?|200\s+questions?/)
    }, 30000)

    it('should know the passing grade', async () => {
      const { answer } = await queryPageContent(
        'What grade do I need to pass?',
        TEST_PAGE_URL
      )

      console.log('Question: Passing grade?')
      console.log('Answer:', answer)

      expect(answer).toMatch(/75%|75 percent/)
    }, 30000)
  })

  describe('Program Structure - Should Explain Course Layout', () => {
    it('should know about the three units', async () => {
      const { answer } = await queryPageContent(
        'What are the main units or sections of the program?',
        TEST_PAGE_URL
      )

      console.log('Question: What are the units?')
      console.log('Answer:', answer)

      // Should mention units or the three main sections
      const mentionsUnits =
        answer.toLowerCase().includes('unit 1') ||
        answer.toLowerCase().includes('unit 2') ||
        answer.toLowerCase().includes('unit 3') ||
        answer.toLowerCase().includes('three unit')

      expect(mentionsUnits).toBe(true)
    }, 30000)

    it('should know what materials are included', async () => {
      const { answer } = await queryPageContent(
        'What materials do I get with the certification?',
        TEST_PAGE_URL
      )

      console.log('Question: What materials?')
      console.log('Answer:', answer)

      // Should mention textbooks, videos, workbook, or community
      const mentionsMaterials =
        answer.toLowerCase().includes('textbook') ||
        answer.toLowerCase().includes('video') ||
        answer.toLowerCase().includes('workbook') ||
        answer.toLowerCase().includes('community')

      expect(mentionsMaterials).toBe(true)
    }, 30000)
  })

  describe('Negative Cases - Should NOT Answer', () => {
    it('should decline to answer questions not on the page', async () => {
      const { answer } = await queryPageContent(
        'What is the weather like today?',
        TEST_PAGE_URL
      )

      console.log('Question: Weather today?')
      console.log('Answer:', answer)

      // Should indicate it cannot answer or doesn't have that information
      const isAppropriateDecline =
        answer.toLowerCase().includes('cannot') ||
        answer.toLowerCase().includes('don\'t have') ||
        answer.toLowerCase().includes('not provide') ||
        answer.toLowerCase().includes('not find') ||
        answer.toLowerCase().includes('sorry')

      expect(isAppropriateDecline).toBe(true)
    }, 30000)

    it('should decline questions about other certification programs', async () => {
      const { answer } = await queryPageContent(
        'How does this compare to the ACE certification?',
        TEST_PAGE_URL
      )

      console.log('Question: Compare to ACE?')
      console.log('Answer:', answer)

      // Either declines or only talks about PN certification
      const isAppropriate =
        !answer.toLowerCase().includes('ace certification program') ||
        answer.toLowerCase().includes('cannot compare') ||
        answer.toLowerCase().includes('don\'t have information about')

      expect(isAppropriate).toBe(true)
    }, 30000)
  })

  describe('Complex Questions - Should Synthesize Information', () => {
    it('should answer about total time investment', async () => {
      const { answer } = await queryPageContent(
        'If I study one chapter per week at 3-5 hours, how long will it take total?',
        TEST_PAGE_URL
      )

      console.log('Question: Total time investment?')
      console.log('Answer:', answer)

      // Should calculate or mention approximately 60-100 hours or 20 weeks
      const mentionsTimeframe =
        answer.includes('20') ||
        answer.toLowerCase().includes('week') ||
        answer.toLowerCase().includes('month')

      expect(mentionsTimeframe).toBe(true)
    }, 30000)

    it('should answer about payment options', async () => {
      const { answer } = await queryPageContent(
        'Can I pay monthly instead of all at once?',
        TEST_PAGE_URL
      )

      console.log('Question: Payment options?')
      console.log('Answer:', answer)

      // Should mention monthly payment option
      expect(answer.toLowerCase()).toMatch(/monthly|payment plan|\$59/)
    }, 30000)

    it('should answer about target audience', async () => {
      const { answer } = await queryPageContent(
        'Who is this certification for?',
        TEST_PAGE_URL
      )

      console.log('Question: Target audience?')
      console.log('Answer:', answer)

      // Should mention coaches, trainers, fitness professionals, or any background
      const mentionsAudience =
        answer.toLowerCase().includes('coach') ||
        answer.toLowerCase().includes('trainer') ||
        answer.toLowerCase().includes('fitness') ||
        answer.toLowerCase().includes('any background') ||
        answer.toLowerCase().includes('anyone')

      expect(mentionsAudience).toBe(true)
    }, 30000)
  })

  describe('Author-Specific Questions', () => {
    it('should know John Berardi\'s credentials', async () => {
      const { answer } = await queryPageContent(
        'What are John Berardi\'s credentials?',
        TEST_PAGE_URL
      )

      console.log('Question: Berardi credentials?')
      console.log('Answer:', answer)

      // Should mention PhD or Exercise Physiology or co-founder
      const mentionsCredentials =
        answer.includes('PhD') ||
        answer.toLowerCase().includes('exercise physiology') ||
        answer.toLowerCase().includes('co-founder')

      expect(mentionsCredentials).toBe(true)
    }, 30000)

    it('should provide information about program developers', async () => {
      const { answer } = await queryPageContent(
        'Who developed this certification program?',
        TEST_PAGE_URL
      )

      console.log('Question: Who developed it?')
      console.log('Answer:', answer)

      // Should mention authors or experts
      const mentionsDevelopers =
        answer.toLowerCase().includes('author') ||
        answer.toLowerCase().includes('expert') ||
        answer.toLowerCase().includes('berardi') ||
        answer.toLowerCase().includes('phd')

      expect(mentionsDevelopers).toBe(true)
    }, 30000)
  })
})
