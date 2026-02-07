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
- discovering: exploring, early questions ("what is...", "how does...", "tell me about...", "I'm looking into...")
- evaluating: comparing, detailed/specific questions ("how does X compare to...", "what about...", "does it work with...", "what if I need...")
- ready_to_buy: expressing purchase intent ("how do I sign up", "let's do it", "I want to get started", "what's the next step", "can I start today")
- handoff_needed: frustrated, complex/custom needs, wants human ("this isn't working", "I need to talk to someone", "this is too complicated", "can I speak to a person")

INTENT_CATEGORY - what type of question:
- pricing: cost, payment, discounts, ROI, value for money
- fit: requirements, use cases, suitability ("will this work for...")
- trust: proof, reviews, credibility, results, case studies
- features: capabilities, what's included, how things work
- comparison: vs alternatives, competitors, other options
- objection: doubt, hesitation, concern, pushback ("I'm not sure...", "but what about...")
- logistics: shipping, setup, access, onboarding, timeline
- general: greetings, off-topic, or doesn't fit above categories

BUYING_SIGNAL checklist - true if ANY apply:
- Asks about purchase process, signup, or getting started
- Uses future-ownership language ("when I use this...", "once we have...")
- Expresses readiness ("I'm ready", "let's go", "I want this")
- Asks about payment, billing, or discounts
- Asks about onboarding or implementation timeline
- Requests a demo, trial, or proposal`;

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
  const coreApproach = getCoreApproach(stage);
  const stageGuidance = getStageGuidance(stage);
  const intentGuidance = getIntentGuidance(intentCategory);
  const signalGuidance = getBuyingSignalGuidance(stage, buyingSignal);

  return `${coreApproach}

CURRENT STAGE: ${stage}
${stageGuidance}

INTENT TYPE: ${intentCategory}
${intentGuidance}${signalGuidance}`;
}

function getCoreApproach(stage: ConversationStage): string {
  const constraints = `CONSTRAINTS:
- Never ask questions instead of answering — always answer first
- Maximum 2 questions per response
- For simple factual questions, just answer — no follow-up needed
- If information isn't in the content, acknowledge honestly and offer alternatives
- Specificity is persuasive: use exact numbers, names, and details from the content
- Follow-up questions should relate to specifics you found (options, tiers, use cases) — not generic`;

  switch (stage) {
    case 'discovering':
      return `RESPONSE APPROACH:
1. ANSWER: Directly address their question using the content
2. DIAGNOSE: Ask ONE question about their situation or what they're trying to solve

${constraints}`;
    case 'evaluating':
      return `RESPONSE APPROACH:
1. ANSWER WITH SPECIFICS: Address their question with concrete details, numbers, and outcomes from the content
2. DEEPEN: Ask what matters most to them, or proactively surface a concern they might have

${constraints}`;
    case 'ready_to_buy':
      return `RESPONSE APPROACH:
1. ANSWER: Address their question directly
2. REMOVE FRICTION: Preempt any barriers to getting started
3. NEXT STEP: Provide ONE clear action to move forward

${constraints}`;
    case 'handoff_needed':
      return `RESPONSE APPROACH:
1. ANSWER: Address what you can from the content
2. EMPATHIZE: Show you understand their frustration or need
3. TRANSITION: Smoothly move toward connecting them with a human

${constraints}`;
  }
}

function getBuyingSignalGuidance(stage: ConversationStage, buyingSignal: boolean): string {
  if (!buyingSignal) return '';

  switch (stage) {
    case 'discovering':
      return `\nBUYING SIGNAL DETECTED: They're showing early interest — acknowledge their enthusiasm without rushing. Continue learning about their needs so you can be genuinely helpful.`;
    case 'evaluating':
      return `\nBUYING SIGNAL DETECTED: They're leaning in. Use a micro-commitment to gauge readiness: "It sounds like this could be a good fit — would it help to walk through how to get started?" Guide toward the next step if they're ready.`;
    case 'ready_to_buy':
      return `\nBUYING SIGNAL DETECTED: They want to buy. Be direct. Use assumptive language ("When you get started..." not "If you decide..."). Future-pace: help them picture success after purchase. Provide the clearest possible path to action.`;
    case 'handoff_needed':
      return `\nBUYING SIGNAL DETECTED: They're interested but need human help. Validate both the concern AND the interest. Frame the handoff as acceleration, not delay: "Let me connect you with someone who can get you set up right away."`;
  }
}

function getStageGuidance(stage: ConversationStage): string {
  switch (stage) {
    case 'discovering':
      return `Diagnose before prescribing. Answer their question, then ask ONE situation or problem question to understand their needs.
Don't pitch features or mention purchasing yet — they're still learning.
Goal: understand their world so you can be relevant later.
Example question: "What are you currently using for this?" or "What prompted you to look into this?"`;
    case 'evaluating':
      return `Answer with specifics — numbers, outcomes, concrete details from the content.
Proactively surface concerns they might have ("One thing people often wonder about is...").
Ask what matters most to them so you can focus on what's relevant.
When appropriate, frame the cost of inaction: what happens if they don't solve this?
Goal: help them build a clear case for (or against) this solution.`;
    case 'ready_to_buy':
      return `Use assumptive language: "When you get started..." not "If you decide..."
Provide ONE clear next step — don't overwhelm with options.
Future-pace: help them picture life after the purchase ("Once you're set up, you'll be able to...").
Don't re-sell or pile on more features — they're already convinced. Just remove friction.
Goal: make buying feel easy and inevitable.`;
    case 'handoff_needed':
      return `Validate their concern — show you understand why this needs human attention.
Answer what you can from the content, even if it's partial.
Frame the handoff as elevated service, not a failure: "Let me connect you with someone who can give this the attention it deserves."
No sales pressure. Focus on being genuinely helpful.
Goal: leave them feeling heard and confident that help is coming.`;
  }
}

function getIntentGuidance(intent: IntentCategory): string {
  switch (intent) {
    case 'pricing':
      return `Lead with value before stating numbers — what do they get for the price?
Include specific numbers from the content. If multiple tiers/options exist, bracket them ("ranges from X to Y").
If they push back on price, explore what value means to them — don't offer discounts unprompted.
Ask which option fits their situation if there are choices.`;
    case 'fit':
      return `Diagnose first: ask about their situation before declaring it's a fit.
Then match their needs to specific content — "Based on what you described, X would handle that because..."
Be honest if it's not a great fit — this builds trust and they may still buy for other reasons.`;
    case 'trust':
      return `Cite exact numbers, outcomes, or results from the content — specificity is credibility.
Weave in case studies or examples naturally, not as a list of testimonials.
If specific proof isn't available for their question, acknowledge honestly and offer what you do have.
Never fabricate or exaggerate proof.`;
    case 'features':
      return `Sell outcomes, not features. "This means you can..." not "This includes..."
Connect each feature to a problem it solves or a result it enables.
After answering, ask if there are other capabilities that matter to them.`;
    case 'comparison':
      return `Never trash competitors — it erodes trust.
Differentiate on what matters to THIS buyer, not generic advantages.
Ask what's driving the comparison: "What's making you consider alternatives?" — this reveals what actually matters.
Highlight unique strengths from the content without needing to diminish others.`;
    case 'objection':
      return `Follow this sequence: Acknowledge → Explore → Reframe → Check.
Acknowledge: "That's a fair concern."
Explore: "Can you tell me more about what's behind that?"
Reframe: Address it with specific content that speaks to their concern.
Check: "Does that help address your concern?" Never dismiss or minimize.`;
    case 'logistics':
      return `Be clear and step-by-step — they want to know exactly what happens next.
Preempt friction: mention anything they should know or prepare.
They're close to buying — keep momentum. Make the process feel simple and fast.`;
    case 'general':
      return `Answer their question helpfully, then pivot to learn about their needs.
Ask what brought them here or what they're trying to accomplish.
Use their answer to guide the conversation toward relevant content.`;
  }
}
