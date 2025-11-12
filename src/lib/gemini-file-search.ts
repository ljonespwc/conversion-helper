import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Legacy store name - kept for backward compatibility
const STORE_NAME = 'conversion-helper-pages';

// Type definitions
interface DeploymentInfo {
  id: string;
  deployment_id: string;
  deployment_key: string;
  company_name: string;
  file_search_store_name: string;
  config: Record<string, any>;
  status: string;
}

/**
 * Get or create the main File Search store for all pages
 */
export async function getOrCreateStore() {
  try {
    // Try to get existing store
    const stores = await ai.fileSearchStores.list();
    for await (const store of stores) {
      if (store.displayName === STORE_NAME) {
        return store;
      }
    }

    // Create new store if not found
    const newStore = await ai.fileSearchStores.create({
      config: { displayName: STORE_NAME }
    });
    console.log('Created new File Search store:', newStore.name);
    return newStore;
  } catch (error) {
    console.error('Error getting/creating File Search store:', error);
    throw error;
  }
}

/**
 * Scrape a page and return Markdown content using Firecrawl
 */
export async function scrapePage(url: string): Promise<{ markdown: string; title: string }> {
  try {
    // Use Firecrawl to scrape the page
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`
      },
      body: JSON.stringify({
        url,
        formats: ['markdown']
      })
    });

    if (!response.ok) {
      throw new Error(`Firecrawl API error: ${response.statusText}`);
    }

    const data = await response.json();
    const markdown = data.markdown || data.content || '';
    const title = data.metadata?.title || new URL(url).pathname;

    return { markdown, title };
  } catch (error) {
    console.error('Error scraping page:', error);
    throw error;
  }
}

/**
 * Index a page by uploading its Markdown content to File Search
 */
export async function indexPage(
  url: string,
  markdown: string,
  title: string
): Promise<{ documentId: string; storeName: string }> {
  try {
    // Get or create the store
    const store = await getOrCreateStore();

    if (!store.name) {
      throw new Error('File Search store name is undefined');
    }

    // Create a temporary file from the markdown content
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const file = new File([blob], `${title}.md`, { type: 'text/markdown' });

    // Upload to File Search with metadata
    let operation = await ai.fileSearchStores.uploadToFileSearchStore({
      file: file as any,
      fileSearchStoreName: store.name,
      config: {
        displayName: title,
        customMetadata: [
          { key: 'page_url', stringValue: url },
          { key: 'page_title', stringValue: title },
          { key: 'indexed_at', stringValue: new Date().toISOString() }
        ]
      }
    });

    // Wait for upload to complete
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.get({ operation });
    }

    // Extract document ID from operation response
    // The operation.name contains the full resource name of the uploaded file
    const documentId = (operation as any).name || `${store.name}/${title}-${Date.now()}`;

    // Save to Supabase
    const { error: dbError } = await supabase
      .from('indexed_pages')
      .upsert({
        page_url: url,
        page_title: title,
        document_id: documentId,
        file_search_store_name: store.name,
        markdown_preview: markdown.substring(0, 500),
        scraped_at: new Date().toISOString(),
        status: 'active',
        metadata: {
          title,
          url,
          indexed_at: new Date().toISOString()
        }
      }, {
        onConflict: 'page_url'
      });

    if (dbError) {
      console.error('Error saving to database:', dbError);
      throw dbError;
    }

    return {
      documentId,
      storeName: store.name
    };
  } catch (error) {
    console.error('Error indexing page:', error);
    throw error;
  }
}

/**
 * Query File Search for a specific page
 */
export async function queryPage(
  question: string,
  pageUrl: string
): Promise<{ answer: string; citations: any }> {
  try {
    // Get the indexed page from database
    const { data: indexedPage, error: dbError } = await supabase
      .from('indexed_pages')
      .select('*')
      .eq('page_url', pageUrl)
      .eq('status', 'active')
      .single();

    if (dbError || !indexedPage) {
      throw new Error(`Page not indexed: ${pageUrl}`);
    }

    // Query File Search with metadata filter
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
      config: {
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [indexedPage.file_search_store_name],
              metadataFilter: `page_url="${pageUrl}"`
            }
          }
        ]
      }
    });

    return {
      answer: response.text || 'No answer generated',
      citations: response.candidates?.[0]?.groundingMetadata || null
    };
  } catch (error) {
    console.error('Error querying page:', error);
    throw error;
  }
}

/**
 * Get deployment by deployment key (e.g., 'precision-nutrition-prod')
 */
export async function getDeploymentByKey(deploymentKey: string): Promise<DeploymentInfo | null> {
  try {
    const { data, error } = await supabase
      .from('widget_deployments')
      .select('*')
      .eq('deployment_key', deploymentKey)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data as DeploymentInfo | null;
  } catch (error) {
    console.error('Error getting deployment by key:', error);
    return null;
  }
}

/**
 * Get deployment by UUID (deployment_id)
 */
export async function getDeploymentById(deploymentId: string): Promise<DeploymentInfo | null> {
  try {
    const { data, error } = await supabase
      .from('widget_deployments')
      .select('*')
      .eq('deployment_id', deploymentId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data as DeploymentInfo | null;
  } catch (error) {
    console.error('Error getting deployment by ID:', error);
    return null;
  }
}

/**
 * Query all content for a deployment (multi-tenant aware)
 * This queries the entire File Search store associated with a deployment
 * without filtering by page_url - perfect for testing and widget usage
 */
export async function queryDeploymentContent(
  question: string,
  deploymentId: string
): Promise<{ answer: string; citations: any; deployment?: DeploymentInfo }> {
  try {
    // Get deployment info
    const deployment = await getDeploymentById(deploymentId);

    if (!deployment) {
      throw new Error(`Deployment not found: ${deploymentId}`);
    }

    if (deployment.status !== 'active') {
      throw new Error(`Deployment is ${deployment.status}, cannot query`);
    }

    // Query File Search with deployment's store
    // Note: For now, we query without metadata filter since existing documents
    // don't have deployment_id metadata yet. In production, re-upload documents
    // with deployment_id metadata and then add the filter back:
    // metadataFilter: `deployment_id="${deploymentId}"`
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
      config: {
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [deployment.file_search_store_name]
              // TODO: Add metadata filter once documents are re-uploaded with deployment_id
              // metadataFilter: `deployment_id="${deploymentId}"`
            }
          }
        ]
      }
    });

    return {
      answer: response.text || 'No answer generated',
      citations: response.candidates?.[0]?.groundingMetadata || null,
      deployment
    };
  } catch (error) {
    console.error('Error querying deployment content:', error);
    throw error;
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

/**
 * List all active deployments for the current user
 */
export async function listDeployments(): Promise<DeploymentInfo[]> {
  try {
    const { data, error } = await supabase
      .from('widget_deployments')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as DeploymentInfo[];
  } catch (error) {
    console.error('Error listing deployments:', error);
    return [];
  }
}
