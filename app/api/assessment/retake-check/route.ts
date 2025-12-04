// app/api/assessment/retake-check/route.ts
// Check if existing user can retake assessment (30-day limit)

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUserId } from '@/lib/secure-api';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from session
    const userId = getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get cookies from server-side for authentication
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

    console.log('[Retake Check] Forwarding cookies:', allCookies.map(c => c.name).join(', '));

    // Call backend to check retake eligibility
    const response = await fetch(
      `${API_BASE_URL}/api/assessment/retake-check?user_id=${userId}`,
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
      const error = await response.json().catch(() => ({ error: 'Failed to check eligibility' }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Assessment retake-check error:', error);
    return NextResponse.json(
      { error: 'Failed to check retake eligibility' },
      { status: 500 }
    );
  }
}
