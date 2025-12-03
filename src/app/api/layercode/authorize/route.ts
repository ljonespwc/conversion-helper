import { NextResponse } from 'next/server'
import { conversationMetadata } from '@/lib/conversation-metadata'
import { rateLimits, getClientIP } from '@/lib/ratelimit'
import { isValidKeyFormat } from '@/lib/api-keys'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Rate limit: 5 sessions per IP per hour
    try {
      const clientIP = getClientIP(request)
      const { success, limit, remaining, reset } = await rateLimits.layercodeAuthorize.limit(clientIP)

      if (!success) {
        const resetDate = new Date(reset)
        console.warn(`Rate limit exceeded for IP ${clientIP}. Limit: ${limit}, Remaining: ${remaining}, Reset: ${resetDate.toISOString()}`)

        return NextResponse.json(
          { error: 'Too many session requests. Please try again later.' },
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
      // If rate limiting fails, log error but allow request to proceed
      console.error('Rate limiting error (allowing request):', rateLimitError)
    }

    // Parse request body first to check API key
    const requestBody = await request.json()
    const customerApiKey = requestBody.metadata?.api_key

    // Validate customer API key before consuming Layercode credits
    if (!isValidKeyFormat(customerApiKey)) {
      return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
    }

    // Verify key exists in database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('publishable_key', customerApiKey)
      .single()

    if (orgError || !org) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Get environment variables
    const apiKey = process.env.LAYERCODE_API_KEY
    const agentId = process.env.NEXT_PUBLIC_LAYERCODE_PIPELINE_ID

    if (!apiKey) {
      throw new Error('LAYERCODE_API_KEY is not configured')
    }

    if (!agentId) {
      throw new Error('NEXT_PUBLIC_LAYERCODE_PIPELINE_ID is not configured')
    }

    console.log('🔐 Authorize request metadata:', requestBody.metadata)

    // Prepare the authorization request
    const authRequest = {
      agent_id: agentId,
      // Include conversation_id if resuming a conversation
      ...(requestBody.conversation_id && { conversation_id: requestBody.conversation_id }),
      // Include any metadata from the frontend using custom_metadata
      ...(requestBody.metadata && { custom_metadata: requestBody.metadata })
    }

    console.log('🔐 Sending to Layercode:', authRequest)

    // Call Layercode authorization endpoint
    const response = await fetch('https://api.layercode.com/v1/agents/web/authorize_session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(authRequest)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Layercode authorization failed:', errorText)
      throw new Error(errorText || response.statusText)
    }

    const data = await response.json()

    // Store metadata keyed by conversation_id for webhook lookup
    // Since Layercode doesn't forward metadata to webhooks
    const conversationId = data.conversation_id || data.session_id
    if (conversationId && requestBody.metadata) {
      conversationMetadata.set(conversationId, requestBody.metadata)
      console.log('💾 Stored metadata for conversation:', conversationId, requestBody.metadata)
    }

    // Return the session key and conversation ID to the frontend
    return NextResponse.json({
      client_session_key: data.client_session_key,
      conversation_id: conversationId,
      config: data.config
    })
  } catch (error: any) {
    console.error('Layercode authorization error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to authorize Layercode session' },
      { status: 500 }
    )
  }
}