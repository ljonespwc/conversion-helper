import { NextRequest, NextResponse } from 'next/server';
import { scrapePage, indexPage, getIndexedPage } from '@/lib/gemini-file-search';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { page_url } = await request.json();

    if (!page_url) {
      return NextResponse.json(
        { error: 'page_url is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(page_url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check if already indexed
    const existingPage = await getIndexedPage(page_url);
    if (existingPage) {
      return NextResponse.json({
        message: 'Page already indexed',
        page: existingPage,
        reindexed: false
      });
    }

    // Scrape the page
    console.log(`Scraping page: ${page_url}`);
    const { markdown, title } = await scrapePage(page_url);

    if (!markdown) {
      return NextResponse.json(
        { error: 'Failed to scrape page content' },
        { status: 500 }
      );
    }

    // Index the page in File Search
    console.log(`Indexing page: ${title}`);
    const { documentId, storeName } = await indexPage(page_url, markdown, title);

    return NextResponse.json({
      success: true,
      message: 'Page successfully scraped and indexed',
      data: {
        page_url,
        page_title: title,
        document_id: documentId,
        store_name: storeName,
        markdown_length: markdown.length,
        markdown_preview: markdown.substring(0, 500)
      }
    });
  } catch (error) {
    console.error('Error in scrape-page endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to scrape and index page',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if a page is indexed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page_url = searchParams.get('page_url');

    if (!page_url) {
      return NextResponse.json(
        { error: 'page_url parameter is required' },
        { status: 400 }
      );
    }

    const indexedPage = await getIndexedPage(page_url);

    if (!indexedPage) {
      return NextResponse.json(
        { indexed: false, message: 'Page not indexed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      indexed: true,
      page: indexedPage
    });
  } catch (error) {
    console.error('Error checking indexed page:', error);
    return NextResponse.json(
      { error: 'Failed to check page status' },
      { status: 500 }
    );
  }
}
