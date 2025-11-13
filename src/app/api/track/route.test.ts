import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { POST } from './route'

// Test with actual Supabase connection
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('Conversation Tracking', () => {
  const testSessionId = `test-session-${Date.now()}`

  afterAll(async () => {
    // Clean up test data
    await supabase
      .from('conversation_messages')
      .delete()
      .eq('session_id', testSessionId)

    await supabase
      .from('conversation_sessions')
      .delete()
      .eq('session_id', testSessionId)
  })

  it('should create a new session and insert a message', async () => {
    // Create mock request
    const request = new Request('http://localhost:3000/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: testSessionId,
        question: 'Test question',
        matched: true,
        category: 'file_search',
        page_url: 'https://example.com/test'
      })
    })

    // Call the tracking endpoint
    const response = await POST(request)
    const result = await response.json()

    expect(result.success).toBe(true)

    // Verify session was created
    const { data: session } = await supabase
      .from('conversation_sessions')
      .select('*')
      .eq('session_id', testSessionId)
      .single()

    expect(session).toBeTruthy()
    expect(session.total_questions).toBe(1)
    expect(session.matched_questions).toBe(1)
    expect(session.page_url).toBe('https://example.com/test')

    // Verify message was inserted
    const { data: messages } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('session_id', testSessionId)

    expect(messages).toHaveLength(1)
    expect(messages[0].question).toBe('Test question')
    expect(messages[0].matched).toBe(true)
    expect(messages[0].category).toBe('file_search')
  })

  it('should update existing session and add another message', async () => {
    // Send a second message to the same session
    const request = new Request('http://localhost:3000/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: testSessionId,
        question: 'Second question',
        matched: false,
        category: 'demo'
      })
    })

    const response = await POST(request)
    const result = await response.json()

    expect(result.success).toBe(true)

    // Verify session was updated
    const { data: session } = await supabase
      .from('conversation_sessions')
      .select('*')
      .eq('session_id', testSessionId)
      .single()

    expect(session.total_questions).toBe(2)
    expect(session.matched_questions).toBe(1) // Still 1, second was not matched
    expect(session.page_url).toBe('https://example.com/test') // Should keep original

    // Verify second message was inserted
    const { data: messages } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('session_id', testSessionId)
      .order('created_at', { ascending: true })

    expect(messages).toHaveLength(2)
    expect(messages[1].question).toBe('Second question')
    expect(messages[1].matched).toBe(false)
    expect(messages[1].category).toBe('demo')
  })

  it('should handle missing optional fields', async () => {
    const minimalSessionId = `minimal-${Date.now()}`

    const request = new Request('http://localhost:3000/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: minimalSessionId,
        question: 'Minimal test'
      })
    })

    const response = await POST(request)
    const result = await response.json()

    expect(result.success).toBe(true)

    // Verify session was created with defaults
    const { data: session } = await supabase
      .from('conversation_sessions')
      .select('*')
      .eq('session_id', minimalSessionId)
      .single()

    expect(session.matched_questions).toBe(0)
    expect(session.page_url).toBeNull()

    // Clean up
    await supabase
      .from('conversation_messages')
      .delete()
      .eq('session_id', minimalSessionId)

    await supabase
      .from('conversation_sessions')
      .delete()
      .eq('session_id', minimalSessionId)
  })
})
