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
      groundingChunksCount: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.length || 0
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

    // Grounding check: if Gemini answered with zero grounding chunks,
    // it used its own knowledge instead of stored content — replace with fallback
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    const isGrounded = groundingChunks.length > 0

    if (!isGrounded && response.text) {
      console.warn('⚠️ Ungrounded response detected — replaced with fallback', {
        question,
        pageUrl,
        originalLength: response.text.length
      })
    }

    const fallbackMessage = "I don't have specific information about that in my content. Could you try rephrasing, or is there something else I can help with?"

    return {
      answer: isGrounded
        ? (response.text || fallbackMessage)
        : fallbackMessage,
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

      const organizations = matchedPage.organizations as any;
      return {
        organization_id: matchedPage.organization_id,
        page_title: matchedPage.page_title,
        page_url: matchedPage.page_url, // Return the pattern URL or group ID
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

    // Flatten the organization name from nested structure
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

/**
 * Check if a page is already indexed
 */
export async function getIndexedPage(pageUrl: string) {
  try {
    const { data, error } = await supabase
      .from('indexed_pages')
      .select('*')
      .eq('page_url', pageUrl)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting indexed page:', error);
    return null;
  }
}

/**
 * List all indexed pages
 */
export async function listIndexedPages() {
  try {
    const { data, error } = await supabase
      .from('indexed_pages')
      .select('*')
      .eq('status', 'active')
      .order('scraped_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error listing indexed pages:', error);
    return [];
  }
}

