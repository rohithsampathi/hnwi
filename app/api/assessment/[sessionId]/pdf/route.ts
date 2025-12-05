// app/api/assessment/[sessionId]/pdf/route.ts
// Proxy route to download assessment PDF

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const { searchParams } = new URL(request.url);
    const dynamic = searchParams.get('dynamic') || 'true';

    // Get cookies from server-side for authentication
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

    console.log('[Assessment PDF] Forwarding cookies:', allCookies.map(c => c.name).join(', '));

    const response = await fetch(
      `${API_BASE_URL}/api/assessment/${sessionId}/pdf?dynamic=${dynamic}`,
      {
        method: 'GET',
        headers: {
          ...(cookieHeader && { 'Cookie': cookieHeader }),
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'PDF not found' }));
      return NextResponse.json(error, { status: response.status });
    }

    // Stream the PDF response
    const contentType = response.headers.get('content-type') || 'application/pdf';
    const contentDisposition = response.headers.get('content-disposition') ||
      `attachment; filename=assessment_${sessionId}_dynamic.pdf`;

    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
      },
    });
  } catch (error) {
    console.error('[API] Assessment PDF error:', error);
    return NextResponse.json(
      { error: 'Failed to download PDF' },
      { status: 500 }
    );
  }
}

// Support HEAD request for PDF existence check (used in polling)
export async function HEAD(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    // Get cookies from server-side for authentication
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

    const response = await fetch(
      `${API_BASE_URL}/api/assessment/${sessionId}/pdf`,
      {
        method: 'HEAD',
        headers: {
          ...(cookieHeader && { 'Cookie': cookieHeader }),
        },
        credentials: 'include',
      }
    );

    return new NextResponse(null, { status: response.status });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
