import { describe, it, expect, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('Webhook Tracking Integration', () => {
  const testSessionId = `webhook-test-${Date.now()}`

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

  it('should track a file_search conversation', async () => {
    // Simulate what the webhook does
    const { data: session, error: sessionError } = await supabase
      .from('conversation_sessions')
      .select('id')
      .eq('session_id', testSessionId)
      .single()

    if (sessionError || !session) {
      const { error: createError } = await supabase
        .from('conversation_sessions')
        .insert({
          session_id: testSessionId,
          total_questions: 1,
          matched_questions: 1,
          page_url: 'https://example.com/test'
        })

      expect(createError).toBeNull()
    }

    const { error: messageError } = await supabase
      .from('conversation_messages')
      .insert({
        session_id: testSessionId,
        question: 'Webhook test question',
        matched: true,
        category: 'file_search'
      })

    expect(messageError).toBeNull()

    // Verify session was created
    const { data: verifySession } = await supabase
      .from('conversation_sessions')
      .select('*')
      .eq('session_id', testSessionId)
      .single()

    expect(verifySession).toBeTruthy()
    expect(verifySession.page_url).toBe('https://example.com/test')
    expect(verifySession.matched_questions).toBe(1)

    // Verify message was inserted
    const { data: messages } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('session_id', testSessionId)

    expect(messages).toHaveLength(1)
    expect(messages[0].question).toBe('Webhook test question')
    expect(messages[0].matched).toBe(true)
  })
})
