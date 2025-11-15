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

// Performance timing utility
function logTiming(label: string, startTime: number) {
  const duration = Date.now() - startTime
  console.log(`⏱️ [TIMING] ${label}: ${duration}ms`)
}

// OPTIMIZATION: In-memory cache for widget page and user store data
// Avoids redundant DB queries for the same page during multi-turn conversations
// Cache structure: { pageUrl: { widgetPage, user, timestamp } }
interface CacheEntry {
  widgetPage: { user_id: string; page_title?: string }
  user: { file_search_store_name: string; organization_name?: string }
  timestamp: number
}

const queryCache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCachedData(pageUrl: string): CacheEntry | null {
  const cached = queryCache.get(pageUrl)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached
  }
  // Clean up expired cache
  if (cached) {
    queryCache.delete(pageUrl)
  }
  return null
}

/**
 * Query File Search for content available on a specific page
 * Uses the new page-based architecture with page_urls metadata
 */
export async function queryPageContent(
  question: string,
  pageUrl: string
): Promise<{ answer: string; citations: any; organization?: string }> {
  try {
    // OPTIMIZATION: Check cache first to avoid redundant DB queries
    const cached = getCachedData(pageUrl)
    let widgetPage: { user_id: string; page_title?: string }
    let user: { file_search_store_name: string; organization_name?: string }

    if (cached) {
      console.log('⚡ [CACHE HIT] Using cached widget/user data')
      widgetPage = cached.widgetPage
      user = cached.user
    } else {
      // Get the widget page to find the user's store
      const widgetLookupStart = Date.now()
      const { data: widgetPageData, error: widgetPageError } = await supabase
        .from('widget_pages')
        .select('user_id, page_title') // OPTIMIZATION: Only select needed columns
        .eq('page_url', pageUrl)
        .single();
      logTiming('Widget page lookup', widgetLookupStart)

      if (widgetPageError || !widgetPageData) {
        throw new Error(`Page not configured: ${pageUrl}`);
      }
      widgetPage = widgetPageData

      // Get user's File Search store
      const userLookupStart = Date.now()
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('file_search_store_name, organization_name') // OPTIMIZATION: Only select needed columns
        .eq('id', widgetPage.user_id)
        .single();
      logTiming('User store lookup', userLookupStart)

      if (userError || !userData?.file_search_store_name) {
        throw new Error(`User store not found for page: ${pageUrl}`);
      }
      user = userData

      // OPTIMIZATION: Store in cache for subsequent queries
      queryCache.set(pageUrl, {
        widgetPage,
        user,
        timestamp: Date.now()
      })
    }

    // Query File Search with page_url metadata filter
    // Page URLs are stored with indexed keys (page_url_0, page_url_1, ..., page_url_9)
    // to avoid duplicate key errors. Build OR filter to check all slots.
    // Filter syntax: (key = "value" OR key = "value" ...)
    const pageUrlConditions = Array.from({ length: 10 }, (_, i) =>
      `page_url_${i} = "${pageUrl}"`
    ).join(' OR ');

    const metadataFilter = `(${pageUrlConditions})`;

    const geminiStart = Date.now()
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
      config: {
        // OPTIMIZATION: Add generation config to improve speed and consistency
        temperature: 0.3, // Lower temperature = faster, more deterministic responses
        maxOutputTokens: 300, // Limit response length to reduce generation time (~225 words, ~1.5min voice)
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
    logTiming('Gemini File Search query', geminiStart)

    // DEBUG: Log the full response to diagnose "No answer generated" issues
    console.log('🔍 [DEBUG] Gemini response.text:', response.text || '(empty)')
    console.log('🔍 [DEBUG] Gemini response structure:', JSON.stringify({
      hasText: !!response.text,
      hasCandidates: !!response.candidates,
      candidatesLength: response.candidates?.length,
      firstCandidate: response.candidates?.[0] ? {
        hasContent: !!response.candidates[0].content,
        finishReason: response.candidates[0].finishReason,
        safetyRatings: response.candidates[0].safetyRatings
      } : null
    }, null, 2))

    return {
      answer: response.text || 'No answer generated',
      citations: response.candidates?.[0]?.groundingMetadata || null,
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
    // OPTIMIZATION: Check cache first
    const cached = getCachedData(pageUrl)
    if (cached) {
      console.log('⚡ [CACHE HIT] Using cached widget page')
      return cached.widgetPage
    }

    const { data, error } = await supabase
      .from('widget_pages')
      .select('user_id, page_title, page_url') // OPTIMIZATION: Only select needed columns
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

