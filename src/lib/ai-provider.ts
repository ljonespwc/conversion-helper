import { OpenAI } from 'openai'
import { GoogleGenAI } from '@google/genai'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIProvider {
  generateCompletion(
    messages: AIMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
    }
  ): Promise<string>
  getName(): string
}

class OpenAIProvider implements AIProvider {
  private client: OpenAI

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  async generateCompletion(
    messages: AIMessage[],
    options: { temperature?: number; maxTokens?: number } = {}
  ): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: 'gpt-4-1106-preview', // gpt-4.1-mini
      messages: messages as any,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 200
    })

    return completion.choices[0].message.content?.trim() || ''
  }

  getName(): string {
    return 'OpenAI (GPT-4.1-mini)'
  }
}

class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set')
    }
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    })
  }

  async generateCompletion(
    messages: AIMessage[],
    options: { temperature?: number; maxTokens?: number } = {}
  ): Promise<string> {
    // Extract system message for systemInstruction (new SDK supports it)
    const systemMessage = messages.find(m => m.role === 'system')

    // Build contents array (user/assistant messages only)
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = []

    for (const msg of messages) {
      if (msg.role === 'system') continue // System goes to systemInstruction

      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })
    }

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxTokens ?? 200,
        ...(systemMessage && { systemInstruction: systemMessage.content })
      }
    })

    return response.text || ''
  }

  getName(): string {
    return 'Gemini (2.5-flash)'
  }
}

// Singleton instances
let openaiProvider: OpenAIProvider | null = null
let geminiProvider: GeminiProvider | null = null

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase() || 'openai'

  console.log(`🤖 Using AI Provider: ${provider}`)

  switch(provider) {
    case 'gemini':
      if (!geminiProvider) {
        geminiProvider = new GeminiProvider()
      }
      return geminiProvider

    case 'openai':
    default:
      if (!openaiProvider) {
        openaiProvider = new OpenAIProvider()
      }
      return openaiProvider
  }
}

// Helper to get provider name for logging
export function getCurrentProviderName(): string {
  return getAIProvider().getName()
}