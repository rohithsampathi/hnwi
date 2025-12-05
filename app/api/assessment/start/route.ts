// app/api/assessment/start/route.ts
// Proxy route to start assessment session

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/config/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get cookies from server-side for authentication
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

    console.log('[Assessment Start] Forwarding cookies:', allCookies.map(c => c.name).join(', '));

    const backendUrl = `${API_BASE_URL}/api/assessment/start`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();

      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText || 'Failed to start assessment', detail: 'Backend returned non-JSON error' };
      }

      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();

    // Log question structure to debug ID field
    if (data.questions && data.questions.length > 0) {
      console.log('[Assessment Start] First question keys:', Object.keys(data.questions[0]));
      console.log('[Assessment Start] First question:', JSON.stringify(data.questions[0], null, 2));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Assessment start error:', error);
    return NextResponse.json(
      {
        error: 'Failed to start assessment session',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
