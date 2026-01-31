import type { QuestionTheme } from '@/components/admin/types'

/**
 * Analyze user questions and group them into themes using Gemini 2.5 Flash.
 * Returns themes sorted by frequency (most common first).
 */
export async function generateThemes(messages: string[]): Promise<QuestionTheme[]> {
  if (messages.length === 0) return []

  const prompt = `Analyze these user questions from a website chat widget and group them into 3-8 themes, ordered by frequency (most common first).

Each theme should have:
- name: a short descriptive name (2-4 words)
- description: one sentence explaining what visitors are asking about
- count: how many questions fall into this theme
- examples: 2-3 real example questions from the input (exact quotes)

Questions to analyze:
${messages.map((m, i) => `${i + 1}. ${m}`).join('\n')}

Return themes ordered by count descending.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2000,
            responseMimeType: 'application/json',
            responseJsonSchema: {
              type: 'object',
              properties: {
                themes: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      description: { type: 'string' },
                      count: { type: 'integer' },
                      examples: { type: 'array', items: { type: 'string' } }
                    },
                    required: ['name', 'description', 'count', 'examples']
                  }
                }
              },
              required: ['themes']
            },
            thinkingConfig: {
              thinkingBudget: 0
            }
          }
        })
      }
    )

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status}`)
      return []
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''

    if (!text) {
      console.error('generateThemes: empty response from Gemini')
      return []
    }

    const parsed = JSON.parse(text)
    const themes: QuestionTheme[] = (parsed.themes || []).map((t: QuestionTheme) => ({
      name: t.name || 'Unknown',
      description: t.description || '',
      count: typeof t.count === 'number' ? t.count : 0,
      examples: Array.isArray(t.examples) ? t.examples.slice(0, 3) : []
    }))

    return themes.sort((a, b) => b.count - a.count)
  } catch (error) {
    console.error('generateThemes error:', error)
    return []
  }
}
