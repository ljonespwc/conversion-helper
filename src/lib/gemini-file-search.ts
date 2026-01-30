import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { EXPERIMENTAL_SETTINGS } from './experimental';
import { findMatchingPattern } from './url-matching';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

// Use service role to bypass RLS (called from webhook without user auth)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Convert conversation history to Gemini API format
 * Maps roles: 'user' -> 'user', 'assistant' -> 'model', 'system' -> skip
 */
function buildContentsArray(
  conversationHistory: Array<{ role: string; content: string }> | undefined,
  currentQuestion: string
) {
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = []

  // Add conversation history (skip system messages as they go in systemInstruction)
  if (conversationHistory) {
    for (const msg of conversationHistory) {
      if (msg.role === 'system') continue // System prompt goes to systemInstruction

      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })
    }
  }

  // Add current question
  contents.push({
    role: 'user',
    parts: [{ text: currentQuestion }]
  })

  return contents
}

/**
 * Fast classification: is this a social/conversational message?
 * Social messages (thanks, greetings, acknowledgments, farewells, simple confirmations)
 * don't need grounding and should get the AI's natural response.
 * Uses Gemini Flash REST API with JSON mode for speed.
 * Returns false on error (fail-safe: fallback still applies).
 */
async function isSocialMessage(message: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Classify whether this user message is social/conversational or a content question.\n\nSocial messages include: greetings (hi, hello), thanks (thank you, thanks so much), acknowledgments (got it, ok, I see), farewells (bye, goodbye), simple confirmations (yes, no, no thanks, sure), and other pleasantries.\n\nContent questions include: anything asking for information, details, pricing, features, comparisons, or any substantive topic.\n\nMessage: "${message}"` }] }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 50,
            responseMimeType: 'application/json',
            responseJsonSchema: {
              type: 'object',
              properties: {
                is_social: { type: 'boolean' }
              },
              required: ['is_social']
            },
            thinkingConfig: {
              thinkingBudget: 0
            }
          }
        })
      }
    );

    if (!response.ok) {
      console.warn('⚠️ isSocialMessage API error:', response.status);
      return false;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    const parsed = JSON.parse(text);
    return parsed.is_social === true;
  } catch (error) {
    console.warn('⚠️ isSocialMessage classification failed, defaulting to false:', error);
    return false;
  }
}

/**
 * Query File Search for content available on a specific page
 * Uses the new page-based architecture with page_urls metadata
 */
export async function queryPageContent(
  question: string,
  pageUrl: string,
  conversationHistory?: Array<{ role: string; content: string }>,
  systemPrompt?: string,
  isExperimental?: boolean
): Promise<{ answer: string; citations: any; organization?: string; grounded: boolean }> {
  try {
    // Normalize page URL for consistent matching
    const normalizedPageUrl = normalizePageUrl(pageUrl)

    // Get the widget page to find the organization's store
    const { data: widgetPageData, error: widgetPageError } = await supabase
      .from('widget_pages')
      .select('organization_id, page_title, page_goal')
      .eq('page_url', normalizedPageUrl)
      .single();

    if (widgetPageError || !widgetPageData) {
      throw new Error(`Page not configured: ${pageUrl}`);
    }

    // Get organization's File Search store
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('file_search_store_name, name')
      .eq('id', widgetPageData.organization_id)
      .single();

    if (orgError || !orgData?.file_search_store_name) {
      throw new Error(`Organization store not found for page: ${pageUrl}`);
    }

    // Query File Search with page_url metadata filter
    // Page URLs are stored with indexed keys (page_url_0, page_url_1, ..., page_url_9)
    // to avoid duplicate key errors. Build OR filter to check all slots.
    // Filter syntax: (key = "value" OR key = "value" ...)
    // Use normalized URL (trailing slash only added to root URLs) for consistent matching
    const pageUrlConditions = Array.from({ length: 10 }, (_, i) =>
      `page_url_${i} = "${normalizedPageUrl}"`
    ).join(' OR ');

    const metadataFilter = `(${pageUrlConditions})`;

    // Build properly structured contents array with conversation history
    const contents = buildContentsArray(conversationHistory, question)

    // Extract system prompt from conversation history or use provided one
    const systemInstruction = systemPrompt || conversationHistory?.find(m => m.role === 'system')?.content

    // Use experimental AI settings if enabled (experimental = concise, default = detailed)
    const temperature = isExperimental ? EXPERIMENTAL_SETTINGS.ai.temperature : 0.4
    const maxOutputTokens = isExperimental ? EXPERIMENTAL_SETTINGS.ai.maxOutputTokens : 2500

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        temperature,
        maxOutputTokens,
        ...(systemInstruction && { systemInstruction }),
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [orgData.file_search_store_name],
              metadataFilter
            }
          }
        ]
      }
    });

    // Log response metadata for debugging
    const finishReason = response.candidates?.[0]?.finishReason
    const hasText = !!response.text
    const hasGrounding = !!response.candidates?.[0]?.groundingMetadata

    console.log('🔍 Gemini File Search Response:', {
      hasText,
      textLength: response.text?.length || 0,
      finishReason,
      hasGrounding,
      groundingChunksCount: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.length || 0,
      groundingSupportsCount: response.candidates?.[0]?.groundingMetadata?.groundingSupports?.length || 0
    })

    // Warn if finish reason indicates an issue
    if (finishReason && finishReason !== 'STOP') {
      console.warn('⚠️ Unusual finish reason:', finishReason, {
        possibleCause:
          finishReason === 'MAX_TOKENS' ? 'Output truncated - increase maxOutputTokens' :
          finishReason === 'SAFETY' ? 'Content blocked by safety filters' :
          finishReason === 'RECITATION' ? 'Content blocked due to recitation' :
          finishReason === 'OTHER' ? 'API quota/rate limit may be exceeded' :
          'Unknown issue'
      })
    }

    // Warn if no text but no clear error
    if (!response.text) {
      console.error('❌ Empty response.text from Gemini API', {
        finishReason,
        candidatesCount: response.candidates?.length || 0,
        hasGrounding
      })
    }

    // Grounding check (two layers):
    // 1. groundingChunks: did file search return any content at all?
    //    If zero, Gemini ignored file search entirely — replace response with fallback.
    // 2. groundingSupports: did the answer actually use the retrieved content?
    //    Maps response segments back to chunks. A low count (0-1) means
    //    file search ran but the answer isn't backed by stored content
    //    (e.g., "I couldn't find info about the CEO" with 5 chunks but 1 tangential support).
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    const groundingSupports = response.candidates?.[0]?.groundingMetadata?.groundingSupports || []
    const hasChunks = groundingChunks.length > 0
    const isGrounded = groundingSupports.length >= 2

    if (!hasChunks && response.text) {
      console.warn('⚠️ Ungrounded response detected — replaced with fallback', {
        question,
        pageUrl,
        originalLength: response.text.length
      })
    }

    if (hasChunks && !isGrounded) {
      console.warn('⚠️ File search used but answer not grounded in content', {
        question,
        pageUrl,
        chunksCount: groundingChunks.length,
        supportsCount: groundingSupports.length
      })
    }

    const fallbackMessage = "I don't have specific information about that in my content. Could you try rephrasing, or is there something else I can help with?"

    // When no grounding chunks, check if this is a social/conversational message
    // before replacing with fallback (e.g. "thank you", "got it", "hello")
    if (!hasChunks) {
      const social = await isSocialMessage(question)
      if (social && response.text) {
        console.log('💬 Social message rescued from fallback:', { question })
        return {
          answer: response.text,
          citations: response.candidates?.[0]?.groundingMetadata || null,
          organization: orgData.name,
          grounded: true
        }
      }
      return {
        answer: fallbackMessage,
        citations: response.candidates?.[0]?.groundingMetadata || null,
        organization: orgData.name,
        grounded: false
      }
    }

    return {
      answer: response.text || fallbackMessage,
      citations: response.candidates?.[0]?.groundingMetadata || null,
      organization: orgData.name,
      grounded: isGrounded
    };
  } catch (error: any) {
    console.error('❌ Error querying Gemini File Search:', {
      error: error.message,
      status: error.status,
      code: error.code,
      isQuotaError: error.message?.includes('RESOURCE_EXHAUSTED') || error.status === 429
    })
    throw error;
  }
}

/**
 * Normalize URL for consistent matching (add trailing slash for root URLs)
 */
export function normalizePageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Add trailing slash if it's a root URL (no path or just "/")
    if (!parsed.pathname || parsed.pathname === '/') {
      return url.endsWith('/') ? url : url + '/';
    }
    return url;
  } catch {
    return url;
  }
}

/**
 * Get widget page configuration with URL pattern matching support
 *
 * @param pageUrl - The visitor's actual URL
 * @param organizationId - Optional org ID to enable pattern matching (recommended)
 * @param groupId - Optional group ID for direct matching (bypasses URL pattern matching)
 * @returns Widget page config with the matched pattern URL, or null if no match
 */
export async function getWidgetPage(pageUrl: string, organizationId?: string, groupId?: string): Promise<{
  organization_id: string;
  page_title: string;
  page_url: string; // The matched pattern URL (canonical identifier)
  page_goal: string | null;
  organization_name: string;
} | null> {
  try {
    // If organization ID is provided, use pattern matching (or group ID direct matching)
    if (organizationId) {
      // Fetch all widget pages for this organization
      const { data: pages, error } = await supabase
        .from('widget_pages')
        .select('organization_id, page_title, page_url, page_goal, organizations(name)')
        .eq('organization_id', organizationId);

      if (error) {
        throw error;
      }

      if (!pages || pages.length === 0) {
        return null;
      }

      let matchedPage;

      if (groupId) {
        // Group ID provided: direct match against page_url
        // This bypasses URL pattern matching entirely
        matchedPage = pages.find(p => p.page_url === groupId);

        if (!matchedPage) {
          return null;
        }
      } else {
        // No group ID: use URL pattern matching
        // Build array of page URLs for pattern matching
        const pageUrls = pages.map(p => p.page_url);

        // Find matching pattern (exact matches take priority over wildcards)
        const matchedPattern = findMatchingPattern(pageUrl, pageUrls);

        if (!matchedPattern) {
          return null;
        }

        // Find the page data for the matched pattern
        matchedPage = pages.find(p => p.page_url === matchedPattern);

        if (!matchedPage) {
          return null;
        }
      }

      // matchedPage found via org ID path
      const organizations = matchedPage.organizations as any;
      return {
        organization_id: matchedPage.organization_id,
        page_title: matchedPage.page_title,
        page_url: matchedPage.page_url,
        page_goal: matchedPage.page_goal,
        organization_name: organizations?.name || ''
      };
    }

    // Fallback: exact match only (legacy behavior when org ID not provided)
    const normalizedUrl = normalizePageUrl(pageUrl);

    const { data, error } = await supabase
      .from('widget_pages')
      .select('organization_id, page_title, page_url, page_goal, organizations(name)')
      .eq('page_url', normalizedUrl)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) {
      return null;
    }

    const organizations = data.organizations as any;
    return {
      organization_id: data.organization_id,
      page_title: data.page_title,
      page_url: data.page_url,
      page_goal: data.page_goal,
      organization_name: organizations?.name || ''
    };
  } catch (error) {
    console.error('Error getting widget page:', error);
    return null;
  }
}

