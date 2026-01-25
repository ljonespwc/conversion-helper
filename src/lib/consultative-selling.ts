// Direct Gemini REST API (more reliable for JSON mode than SDK)

// Types
export type ConversationStage = 'discovering' | 'evaluating' | 'ready_to_buy' | 'handoff_needed';
export type IntentCategory = 'pricing' | 'fit' | 'trust' | 'features' |
                             'comparison' | 'objection' | 'logistics' | 'general';

export interface Classification {
  stage: ConversationStage;
  buying_signal: boolean;
  intent_category: IntentCategory;
}

/**
 * Summarize recent conversation for classification context
 */
export function summarizeConversation(
  history: Array<{ role: string; content: string }>,
  maxExchanges: number = 3
): string {
  // Filter out system messages and get recent exchanges
  const nonSystemMessages = history.filter(m => m.role !== 'system');
  const recentMessages = nonSystemMessages.slice(-maxExchanges * 2);

  if (recentMessages.length === 0) {
    return 'No prior conversation';
  }

  return recentMessages.map(m => {
    const role = m.role === 'assistant' ? 'Assistant' : 'Visitor';
    // Truncate long messages
    const content = m.content.length > 150
      ? m.content.substring(0, 150) + '...'
      : m.content;
    return `${role}: ${content}`;
  }).join('\n');
}

/**
 * Classification call - analyze visitor's message to determine stage and intent
 * Uses Gemini Flash without File Search for speed
 */
export async function classifyMessage(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  pageTitle: string
): Promise<Classification> {
  const conversationSummary = summarizeConversation(conversationHistory);

  const systemPrompt = `Classify a sales page visitor's message.

STAGE - where they are in the buying journey:
- discovering: exploring, general questions
- evaluating: comparing options, detailed questions
- ready_to_buy: expressing intent, asking how to proceed
- handoff_needed: frustrated, complex issue

INTENT_CATEGORY - what type of question:
- pricing: cost, payment, discounts
- fit: requirements, use cases
- trust: proof, reviews, credibility
- features: capabilities, what's included
- comparison: vs alternatives
- objection: doubt, hesitation
- logistics: shipping, setup, access
- general: other

BUYING_SIGNAL: true if showing purchase intent`;

  const userPrompt = `Page: ${pageTitle}
Conversation: ${conversationSummary}
Message: "${userMessage}"`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 200,
            responseMimeType: 'application/json',
            responseJsonSchema: {
              type: 'object',
              properties: {
                stage: { type: 'string', enum: ['discovering', 'evaluating', 'ready_to_buy', 'handoff_needed'] },
                buying_signal: { type: 'boolean' },
                intent_category: { type: 'string', enum: ['pricing', 'fit', 'trust', 'features', 'comparison', 'objection', 'logistics', 'general'] }
              },
              required: ['stage', 'buying_signal', 'intent_category']
            },
            thinkingConfig: {
              thinkingBudget: 0
            }
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!text) {
      console.error('Classification: empty response from Gemini');
      throw new Error('Empty response');
    }

    const parsed = JSON.parse(text);

    // Validate and return with defaults for any missing/invalid fields
    return {
      stage: isValidStage(parsed.stage) ? parsed.stage : 'discovering',
      buying_signal: typeof parsed.buying_signal === 'boolean' ? parsed.buying_signal : false,
      intent_category: isValidIntent(parsed.intent_category) ? parsed.intent_category : 'general'
    };
  } catch (error) {
    console.error('Classification error:', error);
    // Return safe defaults on failure
    return {
      stage: 'discovering',
      buying_signal: false,
      intent_category: 'general'
    };
  }
}

function isValidStage(stage: any): stage is ConversationStage {
  return ['discovering', 'evaluating', 'ready_to_buy', 'handoff_needed'].includes(stage);
}

function isValidIntent(intent: any): intent is IntentCategory {
  return ['pricing', 'fit', 'trust', 'features', 'comparison', 'objection', 'logistics', 'general'].includes(intent);
}

/**
 * Build stage-aware system prompt addition for sell pages
 * This gets appended to the base system prompt before the File Search call
 */
export function buildSellPrompt(
  stage: ConversationStage,
  intentCategory: IntentCategory,
  buyingSignal: boolean
): string {
  // Core response approach (always included)
  const coreApproach = `RESPONSE APPROACH:
1. ANSWER FIRST: Directly address their question using the content you find
2. FOLLOW-UP (optional): Ask ONE question about their needs - base it on options/details you found in the content
3. NEXT STEP (optional): Suggest ONE action they could take

CONSTRAINTS:
- Never ask questions instead of answering
- Maximum 2 questions per response
- For simple factual questions, just answer - no follow-up needed
- If information isn't in the content, acknowledge honestly and offer alternatives
- Follow-up questions should relate to specifics you found (options, tiers, use cases) - not generic`;

  // Stage-specific behavior
  const stageGuidance = getStageGuidance(stage);

  // Intent-specific guidance
  const intentGuidance = getIntentGuidance(intentCategory);

  // Buying signal context
  const signalContext = buyingSignal
    ? '\nBUYING SIGNAL DETECTED: This visitor is showing purchase intent. Be direct about next steps while still being helpful.'
    : '';

  return `${coreApproach}

CURRENT STAGE: ${stage}
${stageGuidance}

INTENT TYPE: ${intentCategory}
${intentGuidance}${signalContext}`;
}

function getStageGuidance(stage: ConversationStage): string {
  switch (stage) {
    case 'discovering':
      return `Focus on understanding them. After answering, ask about their situation or goals. Don't push toward purchase yet.`;
    case 'evaluating':
      return `Go deeper. Address concerns proactively. Ask what's most important to them based on the options available.`;
    case 'ready_to_buy':
      return `Be direct about next steps. After answering, offer to help them get started. If they confirm, direct them to sign up.`;
    case 'handoff_needed':
      return `Be helpful without sales pressure. Reassure them a human will follow up. Focus on their immediate question.`;
  }
}

function getIntentGuidance(intent: IntentCategory): string {
  switch (intent) {
    case 'pricing':
      return `Include specific numbers from content. If multiple options exist, ask which fits their situation.`;
    case 'fit':
      return `Be encouraging but honest about requirements. Ask about their specific use case to guide them.`;
    case 'trust':
      return `Only cite proof that exists in the content. If specific proof isn't available, acknowledge and offer alternatives.`;
    case 'features':
      return `Be thorough about what's included. If they ask about one feature, ask if there are others they're curious about.`;
    case 'comparison':
      return `Help them understand differences. Ask what matters most to guide your recommendation.`;
    case 'objection':
      return `Acknowledge the concern directly. Address it with specifics from content. Ask what would help them feel confident.`;
    case 'logistics':
      return `Be clear and step-by-step. Ask if they need help with anything else to get started.`;
    case 'general':
      return `Answer helpfully and look for an opportunity to learn more about what they're looking for.`;
  }
}
