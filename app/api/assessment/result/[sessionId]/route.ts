// app/api/assessment/result/[sessionId]/route.ts
// Get assessment result by session ID

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/config/api';

interface RouteParams {
  params: {
    sessionId: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { sessionId } = params;

    // Get cookies from server-side (same as session endpoint)
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

    console.log('[Assessment Result] Cookies being forwarded:', allCookies.map(c => c.name).join(', '));

    // Proxy to backend with authentication cookies
    const response = await fetch(`${API_BASE_URL}/api/assessment/result/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('[Assessment Result] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment result' },
      { status: 500 }
    );
  }
}
