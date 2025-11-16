import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

export interface ConversationMessage {
  id?: string;
  role: 'user' | 'assistant';
  message: string;
  timestamp?: number;
}

export interface AnalysisResult {
  messageId?: string;
  messageIndex: number;
  needsFollowup: boolean;
  reason: string | null;
}

/**
 * Analyze a conversation to identify messages that need human followup
 * Uses Gemini 2.5-flash-lite for fast, cheap analysis
 */
export async function analyzeConversation(
  messages: ConversationMessage[]
): Promise<AnalysisResult[]> {
  try {
    // Filter to only assistant messages (we're analyzing AI responses, not user questions)
    const assistantMessages = messages.filter(m => m.role === 'assistant');

    if (assistantMessages.length === 0) {
      return [];
    }

    // Build analysis prompt
    const conversationText = messages
      .map((msg, idx) => `${idx + 1}. ${msg.role === 'user' ? 'USER' : 'ASSISTANT'}: ${msg.message}`)
      .join('\n\n');

    const systemPrompt = `You are analyzing a conversation between a user and an AI assistant to identify responses that were incomplete, unhelpful, or incorrect.

IMPORTANT: Only flag messages where the AI CLEARLY failed to provide useful information. Do NOT flag messages just because they're concise or direct.

Flag a response as "needs followup" ONLY if it:
1. Explicitly says "I don't have that information" or similar
2. Completely avoids answering the question
3. Provides obviously incorrect or contradictory information
4. Is extremely vague when specifics were clearly needed

DO NOT flag responses that:
- Are concise but complete
- Provide accurate information (even if brief)
- Redirect to appropriate resources
- Set appropriate boundaries (e.g., medical advice)

For each ASSISTANT message that needs followup, respond with:
- Message number (from the conversation)
- Brief reason (10 words or less)

Format your response as JSON:
{
  "flagged_messages": [
    { "message_number": 2, "reason": "No information available about pricing" },
    { "message_number": 4, "reason": "Failed to answer refund policy question" }
  ]
}

If NO messages need followup, return: { "flagged_messages": [] }`;

    const userPrompt = `Analyze this conversation and identify assistant responses that need human followup:\n\n${conversationText}`;

    // Call Gemini 2.5-flash-lite for fast, cheap analysis
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [{
        role: 'user',
        parts: [{ text: userPrompt }]
      }],
      config: {
        temperature: 0.1, // Low temperature for deterministic classification
        maxOutputTokens: 500,
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json' // Force JSON response
      }
    });

    const analysisText = response.text;

    if (!analysisText) {
      console.warn('No analysis response from Gemini');
      return [];
    }

    // Parse JSON response
    const analysis = JSON.parse(analysisText);
    const flaggedMessages = analysis.flagged_messages || [];

    // Convert message numbers to analysis results
    const results: AnalysisResult[] = messages.map((msg, idx) => {
      const flagged = flaggedMessages.find((f: any) => f.message_number === idx + 1);

      return {
        messageId: msg.id,
        messageIndex: idx,
        needsFollowup: !!flagged,
        reason: flagged ? flagged.reason : null
      };
    });

    // Filter to only flagged messages
    return results.filter(r => r.needsFollowup);

  } catch (error) {
    console.error('Error analyzing conversation:', error);
    throw error;
  }
}

/**
 * Analyze a single session by ID
 * Fetches messages from database and analyzes them
 */
export async function analyzeSessionById(sessionId: string): Promise<AnalysisResult[]> {
  const { createClient } = await import('@supabase/supabase-js');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch messages for this session
  const { data: messages, error } = await supabase
    .from('conversation_messages')
    .select('id, role, message, timestamp')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true });

  if (error || !messages) {
    throw new Error(`Failed to fetch messages for session ${sessionId}: ${error?.message}`);
  }

  // Analyze the conversation
  return analyzeConversation(messages);
}
