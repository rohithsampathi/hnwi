// app/api/users/[userId]/introductions/route.ts
// API route for user introduction history - proxies to FastAPI backend

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logger } from '@/lib/secure-logger';
import { withAuth, withRateLimit } from '@/lib/security/api-auth';
import { safeError } from '@/lib/security/api-response';

// GET /api/users/[userId]/introductions - Fetch user's executor introduction history
async function handleGet(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const { API_BASE_URL } = await import('@/config/api');

    // Forward cookies to backend
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    const backendResponse = await fetch(`${API_BASE_URL}/api/users/${userId}/introductions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      },
      credentials: 'include'
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      logger.warn('Backend introductions fetch failed', {
        userId,
        status: backendResponse.status,
        error: errorText
      });
      return safeError('Failed to fetch introduction history', backendResponse.status);
    }

    const introductionsData = await backendResponse.json();

    logger.info('Introductions fetched successfully', { userId });

    return NextResponse.json(introductionsData);

  } catch (error) {
    logger.error('Error fetching introductions', {
      error: error instanceof Error ? error.message : String(error)
    });
    return safeError('Failed to fetch introduction history', 500);
  }
}

// Export wrapped handler with auth and rate limiting
export const GET = withAuth(withRateLimit('api', handleGet));
