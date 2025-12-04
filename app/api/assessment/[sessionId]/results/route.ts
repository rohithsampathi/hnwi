// app/api/assessment/[sessionId]/results/route.ts
// Proxy route to get final assessment results

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    console.log('[API Results] ===== FETCHING ASSESSMENT RESULTS =====');
    console.log('[API Results] Session ID:', sessionId);
    console.log('[API Results] API_BASE_URL:', API_BASE_URL);
    console.log('[API Results] Full backend URL:', `${API_BASE_URL}/api/assessment/result/${sessionId}`);

    // Get cookies from server-side (same as session endpoint)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;
    const allCookies = cookieStore.getAll();

    // Build cookie header with all cookies
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

    console.log('[API Results] Forwarding cookies:', cookieHeader ? 'Yes' : 'No');
    console.log('[API Results] Number of cookies:', allCookies.length);
    console.log('[API Results] Cookie names:', allCookies.map(c => c.name).join(', '));
    console.log('[API Results] Has access_token:', !!accessToken);
    console.log('[API Results] Has refresh_token:', !!refreshToken);
    console.log('[API Results] Is anonymous request:', !accessToken);

    // IMPORTANT: Don't block anonymous users here
    // Anonymous users can take the assessment and view their results
    // The backend will handle authorization based on session ownership
    // We forward all cookies (including csrf_token for anonymous users)

    const backendUrl = `${API_BASE_URL}/api/assessment/result/${sessionId}`;

    console.log('[API Results] Making fetch request...');
    console.log('[API Results] Full cookie header being sent:', cookieHeader);

    const fetchHeaders = {
      'Content-Type': 'application/json',
      ...(cookieHeader && { 'Cookie': cookieHeader }), // Forward authentication cookies
    };

    console.log('[API Results] Request headers:', JSON.stringify(fetchHeaders, null, 2));

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: fetchHeaders,
      credentials: 'include',
    });

    console.log('[API Results] Backend response status:', response.status);
    console.log('[API Results] Backend response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Results] ===== BACKEND ERROR =====');
      console.error('[API Results] Status:', response.status);
      console.error('[API Results] Error body:', errorText);
      console.error('[API Results] ========================');

      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: 'Results not found', details: errorText };
      }

      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log('[API Results] ===== SUCCESS =====');
    console.log('[API Results] Data keys:', Object.keys(data));
    console.log('[API Results] Has personalized_opportunities:', !!data.personalized_opportunities);
    console.log('[API Results] ==================');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Results] ===== EXCEPTION =====');
    console.error('[API Results] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[API Results] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[API Results] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[API Results] ====================');

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to get assessment results',
        details: errorMessage,
        api_base_url: API_BASE_URL
      },
      { status: 500 }
    );
  }
}
