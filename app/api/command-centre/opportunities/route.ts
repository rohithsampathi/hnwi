// app/api/command-centre/opportunities/route.ts
// Command Centre opportunities endpoint - proxies to backend with auth
// SOTA: Forward ALL cookies to backend for proper session handling

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Force dynamic rendering - this route uses request.nextUrl.searchParams
export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

// Helper to extract user ID from session_user cookie or JWT
function extractUserId(cookieStore: Awaited<ReturnType<typeof cookies>>): string | null {
  // Try session_user cookie first (JSON with user data)
  const sessionUser = cookieStore.get('session_user')?.value;
  if (sessionUser) {
    try {
      const userData = JSON.parse(sessionUser);
      return userData.id || userData.user_id || null;
    } catch {
      // Invalid JSON
    }
  }

  // Try to extract from access_token JWT
  const accessToken = cookieStore.get('access_token')?.value;
  if (accessToken && accessToken.includes('.')) {
    try {
      const parts = accessToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return payload.user_id || payload.userId || payload.id || payload.sub || null;
      }
    } catch {
      // Invalid JWT
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters from frontend request
    const searchParams = request.nextUrl.searchParams;
    const view = searchParams.get('view') || 'all';
    const timeframe = searchParams.get('timeframe') || 'LIVE';
    const includeCrownVault = searchParams.get('include_crown_vault') || 'false';

    // Get authentication cookies - SOTA: Use proper cookie names
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    // Extract user ID from session_user or JWT
    const userId = extractUserId(cookieStore);

    // Build backend URL with query parameters
    let backendUrl = `${API_BASE_URL}/api/command-centre/opportunities?view=${view}&timeframe=${timeframe}&include_crown_vault=${includeCrownVault}`;
    if (userId) {
      backendUrl += `&user_id=${userId}`;
    }

    // Log backend request for debugging
    console.log('[Command Centre API] Request:', {
      view,
      timeframe,
      includeCrownVault,
      hasAccessToken: !!accessToken,
      hasUserId: !!userId
    });

    // SOTA: Forward ALL cookies to backend for proper session handling
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

    // Build headers with both cookie forwarding AND Bearer token
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader, // Forward all cookies
    };

    // Also include Authorization header as backup
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
      credentials: 'include',
      cache: 'no-store', // Don't cache - we want fresh data
    });

    if (!response.ok) {
      console.error('[Command Centre API] Backend returned error:', response.status);

      // Return empty opportunities array on error
      return NextResponse.json({
        opportunities: [],
        total_count: 0,
        message: `Backend error: ${response.status}`
      }, { status: response.status });
    }

    const data = await response.json();

    // Log successful response
    console.log('[Command Centre API] Success:', {
      opportunities: data.opportunities?.length || 0,
      view,
      timeframe
    });

    // Return backend data
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Command Centre API] Error:', error);

    // Return empty array on error to prevent frontend crashes
    return NextResponse.json({
      opportunities: [],
      total_count: 0,
      error: 'Failed to fetch opportunities'
    }, { status: 500 });
  }
}
