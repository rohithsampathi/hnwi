// app/api/assessment/answer/route.ts
// Proxy route to submit assessment answers

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/config/api';
import { withAuth, withCSRF } from '@/lib/security/api-auth';
import { safeError } from '@/lib/security/api-response';

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();

    // Get cookies from server-side for authentication
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');


    const backendUrl = `${API_BASE_URL}/api/assessment/answer`;

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
        error = { error: errorText || 'Failed to submit answer' };
      }

      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return safeError(error);
  }
}

export const POST = withAuth(withCSRF(handlePost));
