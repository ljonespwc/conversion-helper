import { streamResponse } from '@layercode/node-server-sdk'
import { queryPage, getIndexedPage } from '@/lib/gemini-file-search'
import { conversationMetadata } from '@/lib/conversation-metadata'
import { getAIProvider, type AIMessage } from '@/lib/ai-provider'

export const dynamic = 'force-dynamic'

// Message type with turn_id tracking
type MessageWithTurnId = {
  role: 'system' | 'user' | 'assistant'
  content: string
  turn_id?: string
}

// Store conversation messages in memory (consider Redis for production)
const conversationMessages: Record<string, MessageWithTurnId[]> = {}

// Webhook request type
type WebhookRequest = {
  conversation_id: string
  session_id?: string
  text?: string
  turn_id?: string
  interruption_context?: {
    previous_turn_interrupted: boolean
    words_heard: number
    text_heard: string
    assistant_turn_id?: string
  }
  metadata?: {
    source?: string
    page_url?: string
    timestamp?: string
  }
  custom_metadata?: {
    source?: string
    page_url?: string
    timestamp?: string
  }
  type: 'message' | 'session.start' | 'session.update' | 'session.end' | 'user.transcript.interim_delta' | string
  content?: string
  delta_counter?: number
}

export async function POST(request: Request) {
  try {
    const requestBody = await request.json() as WebhookRequest

    // Verify webhook secret if configured
    const webhookSecret = process.env.LAYERCODE_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get('x-layercode-signature')
      // TODO: Implement signature verification if needed
    }

    // Handle different webhook event types
    const { type, text, turn_id, session_id, conversation_id, interruption_context, custom_metadata } = requestBody

    // Use conversation_id as the primary key for message storage
    const conversationKey = conversation_id || session_id || 'unknown'

    // Extract page URL from custom_metadata (forwarded by Layercode)
    const pageUrl = custom_metadata?.page_url || ''

    // Debug logging
    console.log('📋 Webhook received:', { type, conversation_id, custom_metadata, pageUrl })

    return streamResponse(requestBody, async ({ stream }) => {
      try {
        if (type === 'session.start') {
          console.log('🎬 Session start - pageUrl:', pageUrl, 'Will use File Search:', !!pageUrl)

          // Initialize conversation history with system prompt
          const systemPrompt = pageUrl
            ? `You are a helpful assistant for the page at ${pageUrl}. Answer questions based ONLY on the content of this specific page. If asked about something not on this page, politely decline and suggest they ask about the page content.`
            : "You are a friendly demo assistant. This is a demonstration of the voice assistant technology. You can answer general questions politely, but remind users that this is just a demo and the real system would be customized with their specific content and knowledge base."

          conversationMessages[conversationKey] = [
            { role: 'system', content: systemPrompt }
          ]

          // Send welcome message and store it in history
          const welcomeMsg = pageUrl
            ? "Hello! I can answer questions about this page. What would you like to know?"
            : "Hello! This is a demo of the voice assistant technology. The production version would be customized with your specific content. How can I help you understand how this system works?"
          stream.tts(welcomeMsg)

          conversationMessages[conversationKey].push({
            role: 'assistant',
            content: welcomeMsg,
            turn_id
          })

          stream.end()
          return
        }

        if (type === 'session.end') {
          // Clean up conversation history after session ends
          delete conversationMessages[conversationKey]
          stream.end()
          return
        }

        if (type === 'session.update') {
          // Just acknowledge session update events
          stream.end()
          return
        }

        if (type === 'user.transcript.interim_delta') {
          // Interim transcripts are for real-time display only, no action needed
          stream.end()
          return
        }

        if (type === 'message' && text) {
          // Initialize conversation if not exists (in case session.start was missed)
          if (!conversationMessages[conversationKey]) {
            const fallbackPrompt = pageUrl
              ? `You are a helpful assistant for the page at ${pageUrl}. Answer questions based ONLY on the content of this specific page.`
              : "You are a friendly demo assistant. This is a demonstration of the voice assistant technology. Remind users that this is just a demo and the production version would be customized with their specific content."
            conversationMessages[conversationKey] = [
              { role: 'system', content: fallbackPrompt }
            ]
          }

          // Handle interruption context (skip for welcome message interruptions)
          if (interruption_context?.previous_turn_interrupted) {
            console.log('Handling interruption:', interruption_context)

            // Find and update the interrupted assistant message by turn_id
            const interruptedMsg = conversationMessages[conversationKey].findLast(
              m => m.role === 'assistant' && m.turn_id === interruption_context.assistant_turn_id
            )

            if (interruptedMsg) {
              // Update with what was actually heard
              interruptedMsg.content = interruption_context.text_heard || ''
              console.log(`Updated interrupted message: "${interruption_context.text_heard?.substring(0, 50)}..."`)
            }
            // Skip handling if we can't find the message (likely the welcome message)
          }

          // Store user message after handling interruption
          conversationMessages[conversationKey].push({
            role: 'user',
            content: text,
            turn_id
          })

          // Debug: Log conversation history
          console.log(`Conversation ${conversationKey} history:`,
            conversationMessages[conversationKey].map(m => `${m.role}: ${m.content.substring(0, 50)}...`)
          )

          // Create placeholder for assistant response
          const assistantPlaceholderIndex = conversationMessages[conversationKey].length
          conversationMessages[conversationKey].push({
            role: 'assistant',
            content: '',
            turn_id
          })

          // Use File Search if page URL is available, otherwise fall back to FAQ matching
          const useFileSearch = !!pageUrl
          let finalResponse = ''
          let matched = false

          console.log('🔀 Routing decision - pageUrl:', pageUrl, 'useFileSearch:', useFileSearch)

          if (useFileSearch) {
            console.log('🔍 Using File Search for page:', pageUrl)

            try {
              // Check if page is indexed
              const indexedPage = await getIndexedPage(pageUrl)

              if (indexedPage) {
                // Query the File Search store
                const { answer, citations } = await queryPage(text, pageUrl)
                finalResponse = answer
                matched = true

                console.log('✅ File Search answered:', answer.substring(0, 100))

                // Send the response via TTS
                stream.tts(finalResponse)

                // Send citations data
                stream.data({
                  type: 'file_search_match',
                  question: text,
                  response: finalResponse,
                  citations,
                  page_url: pageUrl,
                  urls: { hasLinks: false, links: [] }
                })
              } else {
                // Page not indexed - send error message
                finalResponse = "I'm sorry, but this page hasn't been indexed yet. Please contact support to enable the assistant for this page."
                matched = false

                stream.tts(finalResponse)

                stream.data({
                  type: 'page_not_indexed',
                  question: text,
                  response: finalResponse,
                  page_url: pageUrl,
                  urls: { hasLinks: false, links: [] }
                })
              }
            } catch (error) {
              console.error('File Search error:', error)
              finalResponse = "I'm having trouble accessing information about this page right now. Please try again later."
              matched = false

              stream.tts(finalResponse)

              stream.data({
                type: 'error',
                question: text,
                response: finalResponse,
                error: error instanceof Error ? error.message : 'Unknown error',
                urls: { hasLinks: false, links: [] }
              })
            }

            // Track conversation
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://conversion-helper.vercel.app'
            fetch(`${appUrl}/api/track`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                session_id: session_id || conversation_id || 'unknown',
                question: text,
                matched,
                category: pageUrl ? 'file_search' : null,
                page_url: pageUrl
              })
            }).catch(() => {})

            // Update conversation history
            conversationMessages[conversationKey][assistantPlaceholderIndex] = {
              role: 'assistant',
              content: finalResponse,
              turn_id
            }

          } else {
            // FALLBACK: Use AI provider for generic demo responses (no page URL)
            console.log('🤖 Using AI provider for generic demo response')

            try {
              // Use conversation history for context-aware responses
              const aiMessages: AIMessage[] = conversationMessages[conversationKey].map(msg => ({
                role: msg.role,
                content: msg.content
              }))

              // Get AI provider and generate response
              const aiProvider = getAIProvider()
              finalResponse = await aiProvider.generateCompletion(aiMessages, {
                temperature: 0.7,
                maxTokens: 300
              })

              matched = false // Generic demo responses are not "matched" content

              console.log(`✅ AI Provider (${aiProvider.getName()}) responded:`, finalResponse.substring(0, 100))

              // Send the response via TTS
              stream.tts(finalResponse)

              // Track conversation
              const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://conversion-helper.vercel.app'
              fetch(`${appUrl}/api/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  session_id: session_id || conversation_id || 'unknown',
                  question: text,
                  matched: false,
                  category: 'demo',
                  page_url: `${appUrl}/widget`
                })
              }).catch(() => {})

              // Update conversation history
              conversationMessages[conversationKey][assistantPlaceholderIndex] = {
                role: 'assistant',
                content: finalResponse,
                turn_id
              }

              // Send metadata
              stream.data({
                type: 'demo_response',
                question: text,
                response: finalResponse,
                category: 'demo',
                urls: { hasLinks: false, links: [] }
              })
            } catch (error) {
              console.error('AI Provider error:', error)
              finalResponse = "I'm having trouble generating a response right now. Please try again."

              stream.tts(finalResponse)

              stream.data({
                type: 'error',
                question: text,
                response: finalResponse,
                error: error instanceof Error ? error.message : 'Unknown error',
                urls: { hasLinks: false, links: [] }
              })
            }
          }

          // Clean up old conversations to prevent memory leak (keep last 50 active conversations)
          const conversationKeys = Object.keys(conversationMessages)
          if (conversationKeys.length > 50) {
            const oldestKey = conversationKeys[0]
            delete conversationMessages[oldestKey]
            console.log(`Cleaned up old conversation: ${oldestKey}`)
          }
        }

        stream.end()
      } catch (error) {
        console.error('Error in webhook handler:', error)
        stream.tts("I apologize, but I encountered an error processing your request. Please try again.")
        stream.end()
      }
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}