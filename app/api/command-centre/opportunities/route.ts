// app/api/command-centre/opportunities/route.ts
// Command Centre Opportunities Endpoint - Proxy to Backend
// Forwards authenticated requests to FastAPI backend

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/secure-logger'

export async function GET(request: NextRequest) {
  try {
    // Get backend URL from environment
    const backendUrl = process.env.API_BASE_URL || 'http://localhost:8000'

    // Get query parameters from request
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const endpoint = `${backendUrl}/api/command-centre/opportunities${queryString ? '?' + queryString : ''}`

    // Forward cookies (same as proxy route pattern)
    const cookies = request.cookies.getAll()
    const cookieHeader = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')

    logger.info('Calling backend Command Centre endpoint', {
      endpoint,
      queryParams: queryString,
      hasCookies: !!cookieHeader
    })

    // Call backend with forwarded cookies (matching proxy route pattern)
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      }
    })

    logger.info('Backend response received', {
      status: response.status,
      ok: response.ok
    })

    if (!response.ok) {
      const errorText = await response.text()

      // Log detailed error information
      logger.error('Backend error from command-centre', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        endpoint: endpoint
      })

      // Also console.log for immediate visibility
      console.error('❌ Command Centre Backend Error:', {
        status: response.status,
        endpoint: endpoint,
        error: errorText
      })

      return NextResponse.json(
        {
          success: false,
          error: `Backend error: ${response.status}`,
          detail: errorText,
          opportunities: [],
          total_count: 0
        },
        { status: response.status }
      )
    }

    // Parse and return backend response
    const data = await response.json()

    logger.info('Command Centre opportunities fetched', {
      total_count: data.total_count || data.opportunities?.length || 0,
      moev4_count: data.metadata?.sources?.moev4 || 0,
      prive_count: data.metadata?.sources?.prive_exchange || 0,
      crown_vault_count: data.metadata?.sources?.crown_vault || 0,
      response_structure: {
        has_opportunities: !!data.opportunities,
        has_metadata: !!data.metadata,
        has_success: data.success
      }
    })

    // Log warning if count seems too high
    if (data.opportunities && data.opportunities.length > 100) {
      logger.warn('Unusually high opportunity count - possible backend issue', {
        count: data.opportunities.length,
        expected_range: '20-50 for typical user'
      })
    }

    return NextResponse.json(data)

  } catch (error) {
    logger.error('Error fetching Command Centre opportunities', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      backendUrl: process.env.API_BASE_URL || 'NOT SET (defaulting to localhost:8000)'
    })

    // Return detailed error for debugging (in production, you may want to hide details)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch opportunities',
        debug: {
          message: error instanceof Error ? error.message : String(error),
          backendConfigured: !!process.env.API_BASE_URL,
          backendUrl: process.env.API_BASE_URL || 'NOT SET',
          environment: process.env.NODE_ENV
        },
        opportunities: [],
        total_count: 0
      },
      { status: 500 }
    )
  }
}
