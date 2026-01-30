import { NextResponse } from 'next/server'
import { queryPageContent, getWidgetPage } from '@/lib/gemini-file-search'
import { rateLimits, getClientIP } from '@/lib/ratelimit'
import { isValidKeyFormat } from '@/lib/api-keys'
import { isExperimentalPage } from '@/lib/experimental'
import { getRequestOrigin, isAllowedDomain } from '@/lib/domain-validation'
import { createClient } from '@supabase/supabase-js'
import {
  classifyMessage,
  buildSellPrompt,
  type Classification,
  type ConversationStage
} from '@/lib/consultative-selling'

export const dynamic = 'force-dynamic'

// Supabase client with service role for tracking
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// In-memory conversation history (consider Redis for production scale)
const conversationHistory: Record<string, Array<{ role: string; content: string }>> = {}

// Helper function to generate goal-specific instructions
function getGoalInstruction(goal: string | null | undefined): string {
  switch(goal) {
    case 'sell':
      return `confident and benefit-focused. Emphasize value and outcomes in your answers.

CLOSING BEHAVIOR:
- You may ask about readiness to buy ONCE per conversation, after answering 2+ substantive questions
- Once you've asked OR the user expresses buying intent ("yes", "I'm ready", "let's do it", "how do I sign up"), direct them to sign up on this page and shift to "anything else I can help with?" mode
- NEVER ask about readiness again after that point - just be helpful and answer questions
- If they have objections or more questions after expressing intent, answer them without re-asking about readiness`
    case 'lead':
      return 'helpful and generous. After answering their questions, look for opportunities to offer additional value they can access by sharing their email'
    case 'support':
      return 'patient and thorough. Focus on solving their problem with no sales pressure'
    default:
      return 'encouraging'
  }
}

// Build system prompt based on page configuration
function buildSystemPrompt(widgetPage: any, isExperimental: boolean): string {
  const basePrompt = `You are a helpful expert on ${widgetPage.page_title || 'this page'}. When visitors ask questions, they're genuinely interested and looking for your help—give them clear, useful answers.

You have access to stored content via file search. You MUST ONLY use information found in the stored content.
NEVER use your own knowledge, training data, or general information about this company/product.
If file search returns no relevant results, say you don't have that information — do NOT guess or fill in from memory.

CRITICAL RULES:
1. When users ask "what's the price?" they mean THIS PAGE's product - search for pricing and answer directly
2. When users say "that", "it", or "tell me more", they're referring to the PREVIOUS topic in our conversation - use context
3. NEVER ask users to clarify or specify - always search the content and attempt to answer
4. NEVER say "I need more information" or "Could you please specify" - be confident and direct
5. NEVER mention sources, citations, or references - just provide the information naturally

If you can't find the answer in the stored content, say so naturally.`

  if (isExperimental) {
    return `${basePrompt}

Answer based ONLY on stored content. Be concise, natural, and ${getGoalInstruction(widgetPage.page_goal)}.`
  } else {
    return `${basePrompt}

OUTPUT STYLE: Provide thorough, detailed answers:
- Include specific details, numbers, and examples from the content
- Use paragraph breaks for readability
- Don't worry about response length - be comprehensive
- Answer based ONLY on stored content. Be helpful and ${getGoalInstruction(widgetPage.page_goal)}.`
  }
}

// Get current session stage from database
async function getSessionStage(session_id: string): Promise<ConversationStage> {
  try {
    const { data } = await supabase
      .from('conversation_sessions')
      .select('conversation_stage')
      .eq('session_id', session_id)
      .single()

    return (data?.conversation_stage as ConversationStage) || 'discovering'
  } catch {
    return 'discovering'
  }
}

// Update session stage in database
async function updateSessionStage(session_id: string, stage: ConversationStage): Promise<void> {
  try {
    await supabase
      .from('conversation_sessions')
      .update({ conversation_stage: stage })
      .eq('session_id', session_id)
  } catch (error) {
    console.error('Failed to update session stage:', error)
  }
}

// Track conversation to database
// Upsert visitor record and return the visitor row UUID
async function upsertVisitor(visitorId: string, organizationId: string, pageUrl: string | null): Promise<string | null> {
  try {
    // Try to find existing visitor
    const { data: existing } = await supabase
      .from('visitors')
      .select('id')
      .eq('visitor_id', visitorId)
      .single()

    if (existing) {
      // Update last_seen (total_conversations incremented on new session creation)
      await supabase
        .from('visitors')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', existing.id)
      return existing.id
    }

    // Create new visitor
    const { data: newVisitor, error } = await supabase
      .from('visitors')
      .insert({
        visitor_id: visitorId,
        organization_id: organizationId,
        first_page_url: pageUrl
      })
      .select('id')
      .single()

    if (error) {
      // Handle race condition: another request created the visitor concurrently
      if (error.code === '23505') {
        const { data: raced } = await supabase
          .from('visitors')
          .select('id')
          .eq('visitor_id', visitorId)
          .single()
        return raced?.id ?? null
      }
      console.error('Failed to create visitor:', error)
      return null
    }

    return newVisitor?.id ?? null
  } catch (error) {
    console.error('Visitor upsert error:', error)
    return null
  }
}

async function trackConversation(params: {
  session_id: string
  role: 'user' | 'assistant'
  message: string
  timestamp?: number
  page_url: string | null
  organization_id?: string | null
  intent_category?: string | null
  buying_signal?: boolean | null
  grounded?: boolean | null
  visitor_id?: string | null
}) {
  try {
    // First, ensure the session exists
    const { data: session, error: sessionError } = await supabase
      .from('conversation_sessions')
      .select('id, total_questions, page_url, organization_id, visitor_id')
      .eq('session_id', params.session_id)
      .single()

    if (sessionError || !session) {
      // Upsert visitor on new session only (avoids extra DB call on every message)
      let visitorDbId: string | null = null
      if (params.visitor_id && params.organization_id) {
        visitorDbId = await upsertVisitor(params.visitor_id, params.organization_id, params.page_url)
      }

      // Create new session
      const { error: createError } = await supabase
        .from('conversation_sessions')
        .insert({
          session_id: params.session_id,
          total_questions: params.role === 'user' ? 1 : 0,
          page_url: params.page_url || null,
          organization_id: params.organization_id || null,
          visitor_id: visitorDbId
        })

      if (createError) {
        console.error('Failed to create session:', createError)
        return
      }

      // Atomically increment visitor's total_conversations on new session
      if (visitorDbId) {
        await supabase.rpc('increment_visitor_conversations', {
          visitor_row_id: visitorDbId
        })
      }
    } else {
      // Update existing session
      const updateData: any = {
        total_questions: (session.total_questions || 0) + (params.role === 'user' ? 1 : 0),
        ended_at: new Date().toISOString()
      }

      if (!session.page_url && params.page_url) {
        updateData.page_url = params.page_url
      }

      if (!session.organization_id && params.organization_id) {
        updateData.organization_id = params.organization_id
      }

      if (!session.visitor_id && params.visitor_id && params.organization_id) {
        const backfillVisitorId = await upsertVisitor(params.visitor_id, params.organization_id, params.page_url)
        if (backfillVisitorId) {
          updateData.visitor_id = backfillVisitorId
        }
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
        timestamp: params.timestamp ?? Date.now(),
        matched: params.role === 'assistant',
        category: null,
        intent_category: params.intent_category ?? null,
        buying_signal: params.buying_signal ?? null,
        grounded: params.grounded ?? null
      })

    if (messageError) {
      console.error('Failed to insert message:', messageError)
    }
  } catch (error) {
    console.error('Tracking error:', error)
  }
}

// Request/Response types
interface ChatRequest {
  session_id: string
  message: string
  page_url: string
  api_key: string
  group_id?: string
  visitor_id?: string
}

interface ChatResponse {
  success: boolean
  response: string
  session_id: string
  organization?: string
  error?: string
}

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json()
    const { session_id, message, page_url, api_key, group_id, visitor_id } = body

    // Validate required fields
    if (!session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
    }

    if (!page_url) {
      return NextResponse.json({ error: 'page_url is required' }, { status: 400 })
    }

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    // Validate API key format
    if (!isValidKeyFormat(api_key)) {
      return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
    }

    // Verify key exists in database
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, website_url')
      .eq('publishable_key', api_key)
      .single()

    if (orgError || !org) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Security: When using group_id, validate that the request comes from
    // a domain that matches the organization's website_url
    if (group_id) {
      const requestOrigin = getRequestOrigin(request)
      if (requestOrigin && !isAllowedDomain(requestOrigin, org.website_url)) {
        return NextResponse.json({ error: 'Domain not authorized' }, { status: 403 })
      }
    }

    // Rate limit: 50 requests per IP per hour
    const clientIP = getClientIP(request)
    try {
      const { success, limit, remaining, reset } = await rateLimits.chat.limit(clientIP)

      if (!success) {
        console.warn(`Rate limit exceeded for chat IP ${clientIP}`)
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
              'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString()
            }
          }
        )
      }
    } catch (rateLimitError) {
      console.error('Rate limiting error (allowing request):', rateLimitError)
    }

    // Get widget page configuration with pattern matching support
    // Pass org.id to enable URL pattern matching (e.g., https://example.com/blog/*)
    // Pass group_id to use direct matching (bypasses URL pattern matching)
    const widgetPage = await getWidgetPage(page_url, org.id, group_id)
    if (!widgetPage) {
      return NextResponse.json({ error: 'Page not configured' }, { status: 404 })
    }

    // Use the matched pattern URL (canonical identifier) for content queries
    // This ensures content assigned to a pattern like "blog/*" is used for "blog/my-post"
    // For group_id matching, this will be the group_id value itself
    const contentPageUrl = widgetPage.page_url

    // Check if experimental mode - use org name first, then contentPageUrl as fallback
    const isExperimental = isExperimentalPage(contentPageUrl, org.name)

    // Initialize conversation history if needed
    if (!conversationHistory[session_id]) {
      const systemPrompt = buildSystemPrompt(widgetPage, isExperimental)
      conversationHistory[session_id] = [
        { role: 'system', content: systemPrompt }
      ]

      // Check if session has existing messages in DB (for restored sessions)
      const { data: existingMessages } = await supabase
        .from('conversation_messages')
        .select('role, message')
        .eq('session_id', session_id)
        .order('timestamp', { ascending: true })

      // Restore previous messages for LLM context
      if (existingMessages && existingMessages.length > 0) {
        for (const msg of existingMessages) {
          conversationHistory[session_id].push({
            role: msg.role,
            content: msg.message
          })
        }
        console.log(`Restored ${existingMessages.length} messages for session ${session_id}`)
      }
    }

    // Check message limit (50 messages per session)
    const messageCount = conversationHistory[session_id].filter(m => m.role !== 'system').length
    if (messageCount >= 50) {
      const limitMsg = "This conversation has reached the maximum length. Please start a new conversation if you have more questions."
      return NextResponse.json({
        success: true,
        response: limitMsg,
        session_id,
        organization: widgetPage.organization_name
      })
    }

    // Add user message to history
    conversationHistory[session_id].push({
      role: 'user',
      content: message
    })

    let answer: string
    let organization: string | undefined
    let classification: Classification | null = null
    let grounded: boolean = false

    // Sell page: use consultative selling with classification
    if (widgetPage.page_goal === 'sell') {
      // 1. Classification call (fast, no File Search)
      classification = await classifyMessage(
        message,
        conversationHistory[session_id],
        widgetPage.page_title
      )

      console.log('🎯 Classification:', {
        stage: classification.stage,
        intent: classification.intent_category,
        buyingSignal: classification.buying_signal
      })

      // 2. Update session stage if changed
      const currentStage = await getSessionStage(session_id)
      if (classification.stage !== currentStage) {
        await updateSessionStage(session_id, classification.stage)
      }

      // 3. Track user message with classification
      await trackConversation({
        session_id,
        role: 'user',
        message,
        page_url: contentPageUrl,
        organization_id: org.id,
        intent_category: classification.intent_category,
        buying_signal: classification.buying_signal,
        visitor_id
      })

      // 4. Build stage-aware prompt
      const sellPrompt = buildSellPrompt(
        classification.stage,
        classification.intent_category,
        classification.buying_signal
      )

      // 5. Generate response with File Search
      // Combine base system prompt with sell guidance
      const baseSystemPrompt = conversationHistory[session_id].find(m => m.role === 'system')?.content || ''
      const enhancedSystemPrompt = `${baseSystemPrompt}\n\n${sellPrompt}`

      const result = await queryPageContent(
        message,
        contentPageUrl,
        conversationHistory[session_id],
        enhancedSystemPrompt,
        isExperimental
      )

      answer = result.answer
      organization = result.organization
      grounded = result.grounded
    } else {
      // Lead/support pages: existing logic (no classification)
      await trackConversation({
        session_id,
        role: 'user',
        message,
        page_url: contentPageUrl,
        organization_id: org.id,
        visitor_id
      })

      const systemPrompt = conversationHistory[session_id].find(m => m.role === 'system')?.content
      const result = await queryPageContent(
        message,
        contentPageUrl,
        conversationHistory[session_id],
        systemPrompt,
        isExperimental
      )

      answer = result.answer
      organization = result.organization
      grounded = result.grounded
    }

    // Add assistant response to history
    conversationHistory[session_id].push({
      role: 'assistant',
      content: answer
    })

    // Track assistant response to database
    await trackConversation({
      session_id,
      role: 'assistant',
      message: answer,
      page_url: contentPageUrl,
      organization_id: org.id,
      grounded,
      visitor_id
    })

    // Clean up old conversations to prevent memory leak
    const conversationKeys = Object.keys(conversationHistory)
    if (conversationKeys.length > 100) {
      const oldestKey = conversationKeys[0]
      delete conversationHistory[oldestKey]
      console.log(`Cleaned up old conversation: ${oldestKey}`)
    }

    return NextResponse.json({
      success: true,
      response: answer,
      session_id,
      organization: organization || widgetPage.organization_name
    })

  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process message' },
      { status: 500 }
    )
  }
}
