// Catch-all API proxy route for backend requests
// This ensures all API calls go through Next.js server, avoiding CORS issues

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE_URL } from '@/config/api'

// Configure route to allow longer execution for large datasets
export const maxDuration = 120 // 120 seconds for development endpoints
export const dynamic = 'force-dynamic'

// Helper to forward cookies - FIXED to use server-side cookies
async function getForwardedCookies(): Promise<string> {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  return allCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
}

// Helper to forward headers
async function getForwardedHeaders(request: NextRequest): Promise<HeadersInit> {
  const cookieHeader = await getForwardedCookies()

  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('content-type') || 'application/json',
    ...(cookieHeader && { 'Cookie': cookieHeader }),
  }

  // Forward other important headers
  const forwardHeaders = ['authorization', 'x-csrf-token', 'user-agent', 'referer']
  forwardHeaders.forEach(header => {
    const value = request.headers.get(header)
    if (value) headers[header] = value
  })

  return headers
}

async function handler(request: NextRequest) {
  let backendUrl = ''
  let pathSegments: string[] = []

  try {
    // Extract the path from the URL
    const url = new URL(request.url)
    pathSegments = url.pathname.split('/').filter(Boolean)

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Proxy] Incoming request: ${url.pathname}${url.search}`)
      console.log(`[Proxy] Path segments before shift:`, pathSegments)
    }

    // Remove 'api' from the beginning if it exists (it should)
    if (pathSegments[0] === 'api') {
      pathSegments.shift()
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Proxy] Path segments after shift:`, pathSegments)
    }

    // Skip if it's an auth route (those have dedicated handlers)
    if (pathSegments[0] === 'auth') {
      return NextResponse.json(
        { error: 'Auth routes should use dedicated handlers' },
        { status: 404 }
      )
    }

    // Reconstruct the backend path
    const backendPath = '/api/' + pathSegments.join('/')
    backendUrl = `${API_BASE_URL}${backendPath}${url.search}`

    // Prepare the request options with server-side cookies
    const options: RequestInit = {
      method: request.method,
      headers: await getForwardedHeaders(request),
      credentials: 'include',
    }

    // Add body for non-GET requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const body = await request.text()
        if (body) {
          options.body = body
        }
      } catch {
        // No body or error reading body
      }
    }

    // Make the request to the backend with timeout and error handling
    // Use longer timeout for development endpoints that might process large datasets
    const timeframe = url.searchParams.get('timeframe')
    const isDevelopments = pathSegments.includes('developments')

    // Determine timeout based on timeframe - larger timeframes need more time
    let timeoutDuration = 120000 // Default: 120 seconds for general endpoints
    if (isDevelopments && timeframe) {
      const tf = timeframe.toUpperCase()
      if (tf === '6M') {
        timeoutDuration = 420000 // 7 minutes for 6M
      } else if (tf === '3M') {
        timeoutDuration = 240000 // 4 minutes for 3M
      } else if (tf === '1M') {
        timeoutDuration = 120000 // 2 minutes for 1M
      } else if (tf === '21D') {
        timeoutDuration = 90000 // 90 seconds for 21D
      }
    }

    if (process.env.NODE_ENV === 'development' && isDevelopments) {
      console.log(`[Proxy] ${backendPath} - timeframe: ${timeframe}, timeout: ${timeoutDuration}ms`)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.error(`[Proxy] Request timeout after ${timeoutDuration}ms for ${backendUrl}`)
      controller.abort()
    }, timeoutDuration + 5000)

    const requestStartTime = Date.now()

    const backendResponse = await fetch(backendUrl, {
      ...options,
      signal: controller.signal,
      // Prevent Node.js fetch default timeouts
      keepalive: true,
      // @ts-ignore - Node.js fetch specific options
      timeout: timeoutDuration + 5000,
    }).finally(() => {
      clearTimeout(timeoutId)
      const requestDuration = Date.now() - requestStartTime
      if (process.env.NODE_ENV === 'development' && isDevelopments) {
        console.log(`[Proxy] Request completed in ${requestDuration}ms`)
      }
    })

    // Get the response body
    let responseBody
    const contentType = backendResponse.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      responseBody = await backendResponse.json()

      // Debug logging for Rohith responses
      if (process.env.NODE_ENV === 'development' && pathSegments.includes('rohith') && pathSegments.includes('message')) {
        console.log('[Proxy] Rohith Response Status:', backendResponse.status)
        console.log('[Proxy] Rohith Response Keys:', Object.keys(responseBody))
        console.log('[Proxy] Rohith Response Sample:', JSON.stringify(responseBody).substring(0, 500))
      }
    } else {
      responseBody = await backendResponse.text()
    }

    // Create the response
    const response = NextResponse.json(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    })

    // Forward important response headers
    const headersToForward = ['x-csrf-token', 'x-ratelimit-limit', 'x-ratelimit-remaining']
    headersToForward.forEach(header => {
      const value = backendResponse.headers.get(header)
      if (value) {
        response.headers.set(header, value)
      }
    })

    // Forward Set-Cookie headers
    const setCookieHeaders = backendResponse.headers.get('set-cookie')
    if (setCookieHeaders) {
      // Parse and set cookies properly
      const cookies = setCookieHeaders.split(',').map(c => c.trim())
      cookies.forEach(cookie => {
        const [nameValue, ...attributes] = cookie.split(';').map(s => s.trim())
        const [name, value] = nameValue.split('=')

        // Set cookie with proper attributes
        response.cookies.set({
          name,
          value,
          httpOnly: cookie.includes('HttpOnly'),
          secure: cookie.includes('Secure'),
          sameSite: cookie.includes('SameSite=Strict') ? 'strict' :
                    cookie.includes('SameSite=Lax') ? 'lax' :
                    cookie.includes('SameSite=None') ? 'none' : 'lax',
          path: '/',
        })
      })
    }

    return response
  } catch (error) {
    // Better error handling for production debugging
    let errorMessage = 'Failed to proxy request to backend'
    let statusCode = 500

    if (error.name === 'AbortError') {
      errorMessage = 'Backend request timeout'
      statusCode = 504
    } else if (error.message?.includes('fetch')) {
      errorMessage = 'Backend service unavailable'
      statusCode = 503
    }

    // Log errors in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Proxy error:', error, 'URL:', backendUrl)
    }

    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
        path: pathSegments.join('/')
      },
      { status: statusCode }
    )
  }
}

// Export all HTTP methods
export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
export const OPTIONS = handler
