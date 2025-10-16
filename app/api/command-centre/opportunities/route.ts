// app/api/command-centre/opportunities/route.ts
// Command Centre Opportunities Endpoint - Proxy to Backend
// Forwards authenticated requests to FastAPI backend

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/secure-logger'

export async function GET(request: NextRequest) {
  let accessToken: string | undefined;

  try {
    // Get access token from httpOnly cookie (using request.cookies like the proxy route)
    accessToken = request.cookies.get('access_token')?.value

    if (!accessToken) {
      logger.warn('Command Centre: No access token found')
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get backend URL from environment
    const backendUrl = process.env.API_BASE_URL || 'http://localhost:8000'

    // Get query parameters from request
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const endpoint = `${backendUrl}/api/command-centre/opportunities${queryString ? '?' + queryString : ''}`

    logger.info('Calling backend Command Centre endpoint', {
      endpoint,
      queryParams: queryString,
      hasToken: !!accessToken
    })

    // Call backend with Authorization header
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    logger.info('Backend response received', {
      status: response.status,
      ok: response.ok
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('Backend error', {
        status: response.status,
        error: errorText
      })

      return NextResponse.json(
        {
          success: false,
          error: `Backend error: ${response.status}`,
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
      backendUrl: process.env.API_BASE_URL || 'NOT SET (defaulting to localhost:8000)',
      hasAccessToken: !!accessToken
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
