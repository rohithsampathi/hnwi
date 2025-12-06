// app/api/assessment/[sessionId]/results/route.ts
// Proxy route to get final assessment results

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;


    // Get cookies from server-side (same as session endpoint)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;
    const allCookies = cookieStore.getAll();

    // Build cookie header with all cookies
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');


    // IMPORTANT: Don't block anonymous users here
    // Anonymous users can take the assessment and view their results
    // The backend will handle authorization based on session ownership
    // We forward all cookies (including csrf_token for anonymous users)

    const backendUrl = `${API_BASE_URL}/api/assessment/result/${sessionId}`;


    const fetchHeaders = {
      'Content-Type': 'application/json',
      ...(cookieHeader && { 'Cookie': cookieHeader }), // Forward authentication cookies
    };


    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: fetchHeaders,
      credentials: 'include',
    });


    if (!response.ok) {
      const errorText = await response.text();

      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: 'Results not found', details: errorText };
      }

      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to get assessment results',
        details: errorMessage,
        api_base_url: API_BASE_URL
      },
      { status: 500 }
    );
  }
}
