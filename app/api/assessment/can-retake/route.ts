// app/api/assessment/can-retake/route.ts
// Check if user can retake assessment (30-day cooldown)

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const email = searchParams.get('email');

    // Build query string
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (email) params.append('email', email);

    // Get cookies from server-side for authentication
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

    console.log('[Can Retake] Forwarding cookies:', allCookies.map(c => c.name).join(', '));

    // Proxy to backend
    const backendUrl = process.env.API_BASE_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/assessment/can-retake?${params.toString()}`, {
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
    console.error('[Can Retake] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check retake eligibility' },
      { status: 500 }
    );
  }
}
