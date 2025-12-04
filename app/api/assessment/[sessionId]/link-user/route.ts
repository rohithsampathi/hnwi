// app/api/assessment/[sessionId]/link-user/route.ts
// Proxy route to link anonymous session to user account after signup

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const body = await request.json();

    // Get cookies from server-side for authentication
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

    console.log('[Assessment Link User] Forwarding cookies:', allCookies.map(c => c.name).join(', '));

    const response = await fetch(
      `${API_BASE_URL}/api/assessment/${sessionId}/link-user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader && { 'Cookie': cookieHeader }),
        },
        credentials: 'include',
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to link user' }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Assessment link-user error:', error);
    return NextResponse.json(
      { error: 'Failed to link session to user' },
      { status: 500 }
    );
  }
}
