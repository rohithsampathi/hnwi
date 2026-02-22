// app/api/assessment/complete/route.ts
// Complete assessment and trigger Digital Twin simulation

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/config/api';
import { withAuth, withCSRF } from '@/lib/security/api-auth';
import { safeError } from '@/lib/security/api-response';

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id } = body;


    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    // Get cookies from server-side for authentication
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');


    // Proxy to backend
    const backendEndpoint = `${API_BASE_URL}/api/assessment/complete`;


    const response = await fetch(backendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      credentials: 'include',
      body: JSON.stringify({ session_id }),
    });


    if (!response.ok) {
      const errorText = await response.text();

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Backend returned error', status: response.status };
      }

      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return safeError(error);
  }
}

export const POST = withAuth(withCSRF(handlePost));
