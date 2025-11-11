import { NextRequest, NextResponse } from 'next/server';
import { queryPage, getIndexedPage } from '@/lib/gemini-file-search';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { question, page_url } = await request.json();

    if (!question || !page_url) {
      return NextResponse.json(
        { error: 'question and page_url are required' },
        { status: 400 }
      );
    }

    // Check if the page is indexed
    const indexedPage = await getIndexedPage(page_url);
    if (!indexedPage) {
      return NextResponse.json(
        {
          error: 'Page not indexed',
          message: `The page at ${page_url} has not been indexed yet. Please contact an administrator to index this page.`,
          indexed: false
        },
        { status: 404 }
      );
    }

    // Query the File Search store
    console.log(`Querying page: ${page_url} with question: ${question}`);
    const { answer, citations } = await queryPage(question, page_url);

    // Track the query (optional - for analytics)
    // Could save to conversation_messages table here

    return NextResponse.json({
      success: true,
      answer,
      citations,
      page_info: {
        title: indexedPage.page_title,
        url: indexedPage.page_url,
        last_indexed: indexedPage.scraped_at
      }
    });
  } catch (error) {
    console.error('Error in page-assistant endpoint:', error);

    // Check if it's a "page not indexed" error
    if (error instanceof Error && error.message.includes('Page not indexed')) {
      return NextResponse.json(
        {
          error: 'Page not indexed',
          message: error.message,
          indexed: false
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to query page assistant',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
