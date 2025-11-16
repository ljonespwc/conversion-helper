import { streamResponse } from '@layercode/node-server-sdk'
import { queryPageContent, getWidgetPage } from '@/lib/gemini-file-search'
import { conversationMetadata } from '@/lib/conversation-metadata'
import { getAIProvider, type AIMessage } from '@/lib/ai-provider'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Supabase client with service role for tracking
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Performance timing utility
function logTiming(label: string, startTime: number) {
  const duration = Date.now() - startTime
  console.log(`⏱️ [TIMING] ${label}: ${duration}ms`)
}

// Track conversation directly to database
async function trackConversation(params: {
  session_id: string
  role: 'user' | 'assistant'
  message: string
  timestamp?: number
  matched: boolean
  category: string | null
  page_url: string | null
}) {
  try {
    // First, ensure the session exists
    const { data: session, error: sessionError } = await supabase
      .from('conversation_sessions')
      .select('id, total_questions, matched_responses, page_url')
      .eq('session_id', params.session_id)
      .single()

    if (sessionError || !session) {
      // Create new session
      const { error: createError } = await supabase
        .from('conversation_sessions')
        .insert({
          session_id: params.session_id,
          total_questions: params.role === 'user' ? 1 : 0,
          matched_responses: params.matched ? 1 : 0,
          page_url: params.page_url || null
        })

      if (createError) {
        console.error('Failed to create session:', createError)
        return
      }
    } else {
      // Update existing session
      const updateData: any = {
        total_questions: (session.total_questions || 0) + (params.role === 'user' ? 1 : 0),
        matched_responses: (session.matched_responses || 0) + (params.matched ? 1 : 0),
        ended_at: new Date().toISOString()
      }

      if (!session.page_url && params.page_url) {
        updateData.page_url = params.page_url
      }

      const { error: updateError } = await supabase
        .from('conversation_sessions')
        .update(updateData)
        .eq('session_id', params.session_id)

      if (updateError) {
        console.error('Failed to update session:', updateError)
        return
      }
    }

    // Insert the message
    const { error: messageError } = await supabase
      .from('conversation_messages')
      .insert({
        session_id: params.session_id,
        role: params.role,
        message: params.message || '',
        timestamp: params.timestamp ?? null,
        matched: params.matched || false,
        category: params.category || null
      })

    if (messageError) {
      console.error('Failed to insert message:', messageError)
    }
  } catch (error) {
    console.error('Tracking error:', error)
  }
}

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
  transcript?: Array<{
    role: 'user' | 'assistant'
    text?: string
    content?: string
    timestamp?: number
    turn_id?: string
  }>
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
          let systemPrompt = ''
          let welcomeMsg = ''

          if (pageUrl) {
            // Page-based session - queries content available for this page
            try {
              const widgetPage = await getWidgetPage(pageUrl)

              if (widgetPage) {
                systemPrompt = `You are a sales assistant for ${widgetPage.page_title || 'this page'}.

CRITICAL RULES:
1. When users ask "what's the price?" they mean THIS PAGE's product - search for pricing and answer directly
2. When users say "that", "it", or "tell me more", they're referring to the PREVIOUS topic in our conversation - use context
3. NEVER ask users to clarify or specify - always search the content and attempt to answer
4. NEVER say "I need more information" or "Could you please specify" - be confident and direct
5. NEVER mention sources, citations, or references - just provide the information naturally

If you truly cannot find relevant information in the indexed content, say "I don't have that information on this page."

Answer based ONLY on indexed content. Be concise, natural, and encouraging.

CRITICAL FOR TTS: When source material contains abbreviations, acronyms, or certification names, rewrite them conversationally. Instead of listing abbreviations (like CPTN, ISSA, NASM), refer to them generically (e.g., "various certifying organizations"). If you must mention credentials, use full names. Never output lists of abbreviations.`
                welcomeMsg = `Hello! I can answer questions about ${widgetPage.page_title || 'this page'}. What would you like to know?`
              } else {
                systemPrompt = "You are a helpful assistant for this page. All questions are about this page's content. Assume ambiguous questions refer to this page's offerings and search the available content to answer them. Be concise, natural, and encouraging in your responses. Never mention sources or citations. CRITICAL FOR TTS: When the source material contains abbreviations or acronyms, rewrite them conversationally or refer to them generically rather than listing abbreviations."
                welcomeMsg = "Hello! How can I help you today?"
              }
            } catch (error) {
              console.error('Error loading widget page for session.start:', error)
              systemPrompt = "You are a helpful assistant. Answer questions based on the available content. Never mention sources or citations."
              welcomeMsg = "Hello! How can I help you today?"
            }
          } else {
            // Demo mode (no page configured)
            systemPrompt = "You are a friendly demo assistant. This is a demonstration of the voice assistant technology. You can answer general questions politely, but remind users that this is just a demo and the real system would be customized with their specific content and knowledge base."
            welcomeMsg = "Hello! This is a demo of the voice assistant technology. The production version would be customized with your specific content. How can I help you understand how this system works?"
          }

          // Store system prompt in conversation history
          conversationMessages[conversationKey] = [
            { role: 'system', content: systemPrompt }
          ]

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
          // Process complete transcript from session.end event
          const transcript = requestBody.transcript || []

          console.log(`📝 Session ended with ${transcript.length} total messages (user + assistant)`)
          console.log('📋 Full transcript:', JSON.stringify(transcript, null, 2))

          // Use conversation_id to match frontend (session_id may be different)
          const sessionIdForLookup = conversation_id || session_id || 'unknown'

          // Save complete transcript to database (both user and assistant messages)
          for (const message of transcript) {
            console.log('💾 Saving message:', {
              role: message.role,
              text: message.text?.substring(0, 50),
              timestamp: message.timestamp
            })

            await trackConversation({
              session_id: sessionIdForLookup,
              role: message.role,
              message: message.text || '',
              timestamp: message.timestamp,
              matched: false,
              category: null,
              page_url: pageUrl || null
            })
          }

          // Trigger escalation analysis if email was submitted (fire-and-forget)
          // This runs asynchronously without blocking the webhook response
          void (async () => {
            try {
              const { data: session } = await supabase
                .from('conversation_sessions')
                .select('user_email, escalation_processed')
                .eq('session_id', sessionIdForLookup)
                .single()

              if (session?.user_email && !session.escalation_processed) {
                console.log(`🔍 Triggering analysis for escalated session: ${sessionIdForLookup}`)

                // Fire-and-forget request to analysis endpoint
                try {
                  await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/conversations/analyze-escalation`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-analysis-secret': process.env.ANALYSIS_ENDPOINT_SECRET || 'internal-only'
                    },
                    body: JSON.stringify({ session_id: sessionIdForLookup })
                  })
                } catch (error) {
                  console.error('Failed to trigger analysis:', error)
                }
              }
            } catch (error) {
              console.error('Failed to check escalation status:', error)
            }
          })()

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

        if (type === 'user.transcript.delta') {
          // Stabilized transcript segments are for real-time display only
          stream.end()
          return
        }

        if (type === 'user.transcript') {
          // Final user transcript (we get complete transcript at session.end)
          stream.end()
          return
        }

        if (type === 'message' && text) {
          const turnStartTime = Date.now()

          // Initialize conversation if not exists (in case session.start was missed)
          if (!conversationMessages[conversationKey]) {
            let fallbackPrompt = ''

            if (pageUrl) {
              const widgetPage = await getWidgetPage(pageUrl)
              fallbackPrompt = `You are a sales assistant for ${widgetPage?.page_title || 'this page'}.

CRITICAL RULES:
1. When users ask "what's the price?" they mean THIS PAGE's product - search for pricing and answer directly
2. When users say "that", "it", or "tell me more", they're referring to the PREVIOUS topic in our conversation - use context
3. NEVER ask users to clarify or specify - always search the content and attempt to answer
4. NEVER say "I need more information" or "Could you please specify" - be confident and direct

If you truly cannot find relevant information in the indexed content, say "I don't have that information on this page."

Answer based ONLY on indexed content. Be concise and encouraging.

CRITICAL FOR TTS: When source material contains abbreviations, acronyms, or certification names, rewrite them conversationally. Instead of listing abbreviations, refer to them generically (e.g., "various certifying organizations"). If you must mention credentials, use full names. Never output lists of abbreviations.`
            } else {
              fallbackPrompt = "You are a friendly demo assistant. This is a demonstration of the voice assistant technology. Remind users that this is just a demo and the production version would be customized with their specific content."
            }

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

          // Routing: Page > Demo
          // Priority: 1) page_url (query content for page), 2) demo mode
          const usePageSearch = !!pageUrl
          let finalResponse = ''
          let matched = false

          console.log('🔀 Routing decision - pageUrl:', pageUrl, 'usePage:', usePageSearch)
          logTiming('Message processing (init to search start)', turnStartTime)

          if (usePageSearch) {
            console.log('🔍 Using Page File Search for page:', pageUrl)
            const fileSearchStart = Date.now()

            try {
              // Get system prompt from conversation history
              const systemPrompt = conversationMessages[conversationKey]?.find(m => m.role === 'system')?.content

              // Query content available for this page using page_urls metadata
              // Pass full conversation history and system prompt for context
              const { answer, citations, organization } = await queryPageContent(
                text,
                pageUrl,
                conversationMessages[conversationKey],
                systemPrompt
              )
              logTiming('File Search total', fileSearchStart)
              finalResponse = answer
              matched = true

              console.log('✅ Page File Search answered:', answer.substring(0, 100))

              // Send the response via TTS
              stream.tts(finalResponse)

              // Send response data (no citations needed in UI)
              stream.data({
                type: 'page_search_match',
                question: text,
                response: finalResponse,
                page_url: pageUrl,
                organization: organization,
                urls: { hasLinks: false, links: [] }
              })
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

            // Note: Conversation tracking moved to session.end event for complete transcripts
            // Update conversation history
            conversationMessages[conversationKey][assistantPlaceholderIndex] = {
              role: 'assistant',
              content: finalResponse,
              turn_id
            }

          } else {
            // FALLBACK: Use AI provider for generic demo responses (no page URL)
            console.log('🤖 Using AI provider for generic demo response')
            const llmStart = Date.now()

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
              logTiming('LLM generation', llmStart)

              matched = false // Generic demo responses are not "matched" content

              console.log(`✅ AI Provider (${aiProvider.getName()}) responded:`, finalResponse.substring(0, 100))

              // Send the response via TTS
              stream.tts(finalResponse)

              // Note: Conversation tracking moved to session.end event for complete transcripts
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

          // Log total turn time
          logTiming('Total turn', turnStartTime)
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