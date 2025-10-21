// API route to debug meta tags for a given URL
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 })
  }

  try {
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
      }
    })

    const html = await response.text()

    // Extract meta tags
    const metaTags = {
      title: html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || null,
      description: html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1] || null,
      ogTitle: html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)?.[1] || null,
      ogDescription: html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)?.[1] || null,
      ogImage: html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1] || null,
      ogUrl: html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/i)?.[1] || null,
      twitterCard: html.match(/<meta\s+name="twitter:card"\s+content="([^"]+)"/i)?.[1] || null,
      twitterTitle: html.match(/<meta\s+name="twitter:title"\s+content="([^"]+)"/i)?.[1] || null,
      twitterDescription: html.match(/<meta\s+name="twitter:description"\s+content="([^"]+)"/i)?.[1] || null,
      twitterImage: html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i)?.[1] || null,
    }

    return NextResponse.json({
      success: true,
      url,
      metaTags,
      rawHtmlPreview: html.substring(0, 2000) // First 2000 chars for debugging
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch URL',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
