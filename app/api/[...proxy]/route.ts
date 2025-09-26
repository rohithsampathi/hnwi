// Catch-all API proxy route for backend requests
// This ensures all API calls go through Next.js server, avoiding CORS issues

import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/config/api'

// Helper to forward cookies
function getForwardedCookies(request: NextRequest): string {
  const cookies = request.cookies.getAll()
  return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
}

// Helper to forward headers
function getForwardedHeaders(request: NextRequest): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('content-type') || 'application/json',
    'Cookie': getForwardedCookies(request),
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
  try {
    // Extract the path from the URL
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)

    // Remove 'api' from the beginning if it exists (it should)
    if (pathSegments[0] === 'api') {
      pathSegments.shift()
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
    const backendUrl = `${API_BASE_URL}${backendPath}${url.search}`

    // Prepare the request options
    const options: RequestInit = {
      method: request.method,
      headers: getForwardedHeaders(request),
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
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const backendResponse = await fetch(backendUrl, {
      ...options,
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId))

    // Get the response body
    let responseBody
    const contentType = backendResponse.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      responseBody = await backendResponse.json()
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