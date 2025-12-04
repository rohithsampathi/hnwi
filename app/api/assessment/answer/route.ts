// app/api/assessment/answer/route.ts
// Proxy route to submit assessment answers

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Assessment Answer] Request body:', JSON.stringify(body, null, 2));

    // Get cookies from server-side for authentication
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

    console.log('[Assessment Answer] Forwarding cookies:', allCookies.map(c => c.name).join(', '));

    const backendUrl = `${API_BASE_URL}/api/assessment/answer`;
    console.log('[Assessment Answer] Calling backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    console.log('[Assessment Answer] Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Assessment Answer] Backend error response:', errorText);

      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText || 'Failed to submit answer' };
      }

      console.error('[Assessment Answer] Parsed error:', error);
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log('[Assessment Answer] Success response:', JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Assessment answer error:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}
