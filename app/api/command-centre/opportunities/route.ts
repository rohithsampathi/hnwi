// app/api/command-centre/opportunities/route.ts
// Command Centre opportunities endpoint - proxies to backend with auth
// SOTA: Forward ALL cookies to backend for proper session handling

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/config/api';
import { logger } from '@/lib/secure-logger';
import { resolveCanonicalUserId } from '@/lib/auth-user-normalization';
import { sanitizeCommandCentreOpportunityDisplaySource } from '@/lib/opportunity-display-fields';

// Force dynamic rendering - this route uses request.nextUrl.searchParams
export const dynamic = 'force-dynamic';

// Helper to extract user ID from session_user cookie or JWT
function extractUserId(cookieStore: Awaited<ReturnType<typeof cookies>>): string | null {
  // Try session_user cookie first (JSON with user data)
  const sessionUser = cookieStore.get('session_user')?.value;
  if (sessionUser) {
    try {
      const userData = JSON.parse(sessionUser);
      return resolveCanonicalUserId(userData) || null;
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
        return resolveCanonicalUserId(payload) || null;
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
    const requestedIncludeCrownVault = searchParams.get('include_crown_vault') === 'true';
    const includeStaleMap = searchParams.get('include_stale_map') === 'true';

    // Get authentication cookies - SOTA: Use proper cookie names
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    // Extract user ID from session_user or JWT. Some private app views already
    // pass the canonical user id after profile hydration, so keep that as a
    // fallback when cookies are still settling after login.
    const requestedUserId = resolveCanonicalUserId({
      user_id: searchParams.get('user_id') || searchParams.get('owner_id') || '',
    });
    const userId = extractUserId(cookieStore) || requestedUserId || null;
    const includeCrownVault = requestedIncludeCrownVault && !!userId;

    // Build backend URL with query parameters
    let backendUrl = `${API_BASE_URL}/api/command-centre/opportunities?view=${view}&timeframe=${timeframe}&include_crown_vault=${includeCrownVault}&include_stale_map=${includeStaleMap}`;
    if (userId) {
      backendUrl += `&user_id=${userId}`;
    }

    // Log backend request for debugging
    logger.info('Command Centre API request', { view, timeframe, hasUserId: !!userId, includeCrownVault, includeStaleMap });

    // SOTA: Forward ALL cookies to backend for proper session handling
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

    // Build headers with both cookie forwarding AND Bearer token
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader, // Forward all cookies
    };

    if (accessToken) {
      // Platform session: use access_token cookie as Bearer
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
      // Viewer accounts pass their report Bearer token directly from the client
      const incomingAuth = request.headers.get('authorization');
      if (incomingAuth) headers['Authorization'] = incomingAuth;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
      credentials: 'include',
      cache: 'no-store', // Don't cache - we want fresh data
    });

    if (!response.ok) {
      logger.error('Command Centre API backend error', { status: response.status });

      // Return empty opportunities array on error
      return NextResponse.json({
        opportunities: [],
        total_count: 0,
        message: `Backend error: ${response.status}`
      }, { status: response.status });
    }

    const data = await response.json();
    const opportunities = Array.isArray(data.opportunities)
      ? data.opportunities.map((opportunity: any) => sanitizeCommandCentreOpportunityDisplaySource(opportunity))
      : [];
    const filteredOpportunities = opportunities.filter((opportunity: any) => {
      if (opportunity?.source !== 'User Crown Vault' && !opportunity?.isCrownVault) {
        return true;
      }
      return !!userId && opportunity?.user_id === userId;
    });

    if (filteredOpportunities.length !== opportunities.length) {
      data.opportunities = filteredOpportunities;
      data.count = filteredOpportunities.length;
      data.total_count = filteredOpportunities.length;
      data.metadata = {
        ...(data.metadata || {}),
        include_crown_vault: includeCrownVault,
        crown_vault_count: filteredOpportunities.filter((opportunity: any) => opportunity?.source === 'User Crown Vault' || opportunity?.isCrownVault).length,
      };
    }

    // Log successful response
    logger.info('Command Centre API success', { count: data.opportunities?.length || 0, view, includeCrownVault });

    // Return backend data
    return NextResponse.json(data);
  } catch (error) {
    logger.error('Command Centre API error', { error: error instanceof Error ? error.message : String(error) });

    // Return empty array on error to prevent frontend crashes
    return NextResponse.json({
      opportunities: [],
      total_count: 0,
      error: 'Failed to fetch opportunities'
    }, { status: 500 });
  }
}
