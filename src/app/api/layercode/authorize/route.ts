import { NextResponse } from 'next/server'
import { conversationMetadata } from '@/lib/conversation-metadata'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Get environment variables
    const apiKey = process.env.LAYERCODE_API_KEY
    const agentId = process.env.NEXT_PUBLIC_LAYERCODE_PIPELINE_ID

    if (!apiKey) {
      throw new Error('LAYERCODE_API_KEY is not configured')
    }

    if (!agentId) {
      throw new Error('NEXT_PUBLIC_LAYERCODE_PIPELINE_ID is not configured')
    }

    // Parse request body
    const requestBody = await request.json()

    console.log('🔐 Authorize request metadata:', requestBody.metadata)

    // Prepare the authorization request
    const authRequest = {
      agent_id: agentId,
      // Include conversation_id if resuming a conversation
      ...(requestBody.conversation_id && { conversation_id: requestBody.conversation_id }),
      // Include any metadata from the frontend
      ...(requestBody.metadata && { metadata: requestBody.metadata })
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