import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isValidKeyFormat } from '@/lib/api-keys'

export const dynamic = 'force-dynamic'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store'
}

// Public endpoint - requires valid API key
// Used by the widget to restore conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    const apiKey = searchParams.get('api_key')

    if (!sessionId || !isValidKeyFormat(apiKey)) {
      return NextResponse.json(
        { success: false, session_exists: false, messages: [] },
        { headers: NO_CACHE_HEADERS }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify API key belongs to an org
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('publishable_key', apiKey)
      .single()

    if (!org) {
      return NextResponse.json(
        { success: false, session_exists: false, messages: [] },
        { headers: NO_CACHE_HEADERS }
      )
    }

    // Verify session belongs to this org
    const { data: session } = await supabase
      .from('conversation_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .eq('organization_id', org.id)
      .single()

    if (!session) {
      return NextResponse.json(
        { success: true, session_exists: false, messages: [] },
        { headers: NO_CACHE_HEADERS }
      )
    }

    // Fetch messages using direct REST API to bypass all caching
    const messagesUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/conversation_messages?session_id=eq.${encodeURIComponent(sessionId)}&order=timestamp.asc&select=role,message,timestamp`
    const messagesResponse = await fetch(messagesUrl, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache'
      },
      cache: 'no-store'
    })
    const messages = await messagesResponse.json()

    return NextResponse.json(
      {
        success: true,
        session_exists: true,
        messages: (messages || []).map((m: { role: string; message: string; timestamp: number }) => ({
          role: m.role,
          content: m.message,
          timestamp: m.timestamp
        }))
      },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (error) {
    console.error('Error fetching conversation messages:', error)
    return NextResponse.json(
      { success: false, session_exists: false, messages: [] },
      { headers: NO_CACHE_HEADERS }
    )
  }
}
