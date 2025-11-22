import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy Demo Endpoint
 *
 * Fetches external pages and strips iframe-blocking headers (X-Frame-Options, CSP)
 * to allow iframe embedding in the /demo page.
 *
 * IMPORTANT: Only use with explicit permission from the target site owner.
 *
 * Usage: /api/proxy-demo?url=https://example.com/page
 */

// Whitelist of allowed domains to proxy
const ALLOWED_PROXY_DOMAINS = [
  'hubermanlab.com',
  'www.hubermanlab.com',
  'ai.hubermanlab.com',
  'dexa.ai',
  'www.dexa.ai'
]

export async function GET(request: NextRequest) {
  const targetUrl = request.nextUrl.searchParams.get('url')

  // Validate URL parameter exists
  if (!targetUrl) {
    return NextResponse.json(
      { error: 'Missing url parameter' },
      { status: 400 }
    )
  }

  // Parse and validate URL
  let parsedUrl: URL
  try {
    parsedUrl = new URL(targetUrl)
  } catch (e) {
    return NextResponse.json(
      { error: 'Invalid URL format' },
      { status: 400 }
    )
  }

  // Check if domain is whitelisted
  const isAllowed = ALLOWED_PROXY_DOMAINS.some(domain =>
    parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
  )

  if (!isAllowed) {
    return NextResponse.json(
      {
        error: 'Domain not allowed',
        allowedDomains: ALLOWED_PROXY_DOMAINS
      },
      { status: 403 }
    )
  }

  try {
    // Fetch the target page
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EasyAsk-Proxy/1.0)'
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Target returned ${response.status}` },
        { status: response.status }
      )
    }

    let html = await response.text()

    // Rewrite absolute and relative URLs to go through the proxy
    const origin = parsedUrl.origin

    // Rewrite href and src attributes
    html = html.replace(
      /(href|src)=["']([^"']+)["']/g,
      (match, attr, url) => {
        // Skip if already absolute URL to different domain, or if it's a data: or javascript: URL
        if (url.startsWith('data:') || url.startsWith('javascript:') || url.startsWith('mailto:') || url.startsWith('tel:')) {
          return match
        }

        // Handle protocol-relative URLs
        if (url.startsWith('//')) {
          const absoluteUrl = `https:${url}`
          return `${attr}="/api/proxy-demo?url=${encodeURIComponent(absoluteUrl)}"`
        }

        // Handle absolute URLs
        if (url.startsWith('http://') || url.startsWith('https://')) {
          // If same origin, proxy it
          if (url.startsWith(origin)) {
            return `${attr}="/api/proxy-demo?url=${encodeURIComponent(url)}"`
          }
          // Different origin - leave as-is (external resources)
          return match
        }

        // Handle relative URLs
        const absoluteUrl = url.startsWith('/')
          ? `${origin}${url}`
          : `${origin}/${url}`

        return `${attr}="/api/proxy-demo?url=${encodeURIComponent(absoluteUrl)}"`
      }
    )

    // Inject base tag to handle any URLs we missed
    html = html.replace(
      /<head([^>]*)>/i,
      `<head$1>\n<base href="${origin}/">`
    )

    // Return HTML without iframe-blocking headers
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Deliberately omit X-Frame-Options and Content-Security-Policy
        // to allow iframe embedding
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    })

  } catch (error: any) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch target page', details: error.message },
      { status: 500 }
    )
  }
}
