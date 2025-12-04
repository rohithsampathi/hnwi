// app/api/assessment/history/[userId]/route.ts
// Get assessment history for a user

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface RouteParams {
  params: {
    userId: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    // Build query string
    const queryParams = new URLSearchParams();
    if (email) queryParams.append('email', email);

    // Get cookies from server-side for authentication
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

    // Proxy to backend with authentication cookies
    const backendUrl = process.env.API_BASE_URL || 'http://localhost:8000';
    const response = await fetch(
      `${backendUrl}/api/assessment/history/${userId}?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader && { 'Cookie': cookieHeader }),
        },
        credentials: 'include',
      }
    );

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
    console.error('[Assessment History] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment history' },
      { status: 500 }
    );
  }
}
