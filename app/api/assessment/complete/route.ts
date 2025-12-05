// app/api/assessment/complete/route.ts
// Complete assessment and trigger Digital Twin simulation

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/config/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id } = body;

    console.log('[Complete API] Received request:', { session_id });

    if (!session_id) {
      console.error('[Complete API] Missing session_id');
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    // Get cookies from server-side for authentication
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

    console.log('[Complete API] Forwarding cookies:', allCookies.map(c => c.name).join(', '));

    // Proxy to backend
    const backendEndpoint = `${API_BASE_URL}/api/assessment/complete`;

    console.log('[Complete API] Proxying to backend:', backendEndpoint);
    console.log('[Complete API] Payload:', { session_id });

    const response = await fetch(backendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      credentials: 'include',
      body: JSON.stringify({ session_id }),
    });

    console.log('[Complete API] Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Complete API] Backend error response:', errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Backend returned error', status: response.status };
      }

      console.error('[Complete API] Parsed error:', errorData);
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Complete API] Backend success response:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('[Assessment Complete] Error:', error);
    return NextResponse.json(
      { error: 'Failed to complete assessment' },
      { status: 500 }
    );
  }
}
