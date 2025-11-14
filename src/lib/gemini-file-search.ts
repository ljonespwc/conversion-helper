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
 * Query File Search for content available on a specific page
 * Uses the new page-based architecture with page_urls metadata
 */
export async function queryPageContent(
  question: string,
  pageUrl: string
): Promise<{ answer: string; citations: any; organization?: string }> {
  try {
    // Get the widget page to find the user's store
    const { data: widgetPage, error: widgetPageError } = await supabase
      .from('widget_pages')
      .select('user_id')
      .eq('page_url', pageUrl)
      .single();

    if (widgetPageError || !widgetPage) {
      throw new Error(`Page not configured: ${pageUrl}`);
    }

    // Get user's File Search store
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('file_search_store_name, organization_name')
      .eq('id', widgetPage.user_id)
      .single();

    if (userError || !user?.file_search_store_name) {
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
    console.log('🔍 Gemini metadataFilter:', metadataFilter);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
      config: {
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [user.file_search_store_name],
              metadataFilter
            }
          }
        ]
      }
    });

    const citations = response.candidates?.[0]?.groundingMetadata || null;
    const groundingChunks = citations?.groundingChunks || [];

    console.log('📚 Retrieved grounding chunks:', groundingChunks.length);
    if (groundingChunks.length > 0) {
      console.log('📄 First chunk preview:', groundingChunks[0]?.retrievedContext?.text?.substring(0, 150));
    }

    return {
      answer: response.text || 'No answer generated',
      citations,
      organization: user.organization_name
    };
  } catch (error) {
    console.error('Error querying page content:', error);
    throw error;
  }
}

/**
 * @deprecated Use queryPageContent() instead
 * Legacy function for backward compatibility
 */
export async function queryPage(
  question: string,
  pageUrl: string
): Promise<{ answer: string; citations: any }> {
  const result = await queryPageContent(question, pageUrl);
  return {
    answer: result.answer,
    citations: result.citations
  };
}


/**
 * Get widget page configuration
 */
export async function getWidgetPage(pageUrl: string) {
  try {
    const { data, error } = await supabase
      .from('widget_pages')
      .select('*')
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

