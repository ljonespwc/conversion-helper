import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

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
  systemPrompt?: string
): Promise<{ answer: string; citations: any; organization?: string }> {
  try {
    // Get the widget page to find the user's store
    const { data: widgetPageData, error: widgetPageError } = await supabase
      .from('widget_pages')
      .select('user_id, page_title')
      .eq('page_url', pageUrl)
      .single();

    if (widgetPageError || !widgetPageData) {
      throw new Error(`Page not configured: ${pageUrl}`);
    }

    // Get user's File Search store
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('file_search_store_name, organization_name')
      .eq('id', widgetPageData.user_id)
      .single();

    if (userError || !userData?.file_search_store_name) {
      throw new Error(`User store not found for page: ${pageUrl}`);
    }

    // Query File Search with page_url metadata filter
    // Page URLs are stored with indexed keys (page_url_0, page_url_1, ..., page_url_9)
    // to avoid duplicate key errors. Build OR filter to check all slots.
    // Filter syntax: (key = "value" OR key = "value" ...)
    const pageUrlConditions = Array.from({ length: 10 }, (_, i) =>
      `page_url_${i} = "${pageUrl}"`
    ).join(' OR ');

    const metadataFilter = `(${pageUrlConditions})`;

    // Build properly structured contents array with conversation history
    const contents = buildContentsArray(conversationHistory, question)

    // Extract system prompt from conversation history or use provided one
    const systemInstruction = systemPrompt || conversationHistory?.find(m => m.role === 'system')?.content

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        temperature: 0.3,
        maxOutputTokens: 1500,
        ...(systemInstruction && { systemInstruction }),
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [userData.file_search_store_name],
              metadataFilter
            }
          }
        ]
      }
    });

    return {
      answer: response.text || 'No answer generated',
      citations: response.candidates?.[0]?.groundingMetadata || null,
      organization: userData.organization_name
    };
  } catch (error) {
    console.error('Error querying page content:', error);
    throw error;
  }
}

/**
 * Get widget page configuration
 */
export async function getWidgetPage(pageUrl: string) {
  try {
    const { data, error } = await supabase
      .from('widget_pages')
      .select('user_id, page_title, page_url')
      .eq('page_url', pageUrl)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
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

