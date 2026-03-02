// app/api/users/[userId]/password/route.ts
// API route for changing user password - proxies to FastAPI backend

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logger } from '@/lib/secure-logger';
import { withAuth, withRateLimit, withCSRF } from '@/lib/security/api-auth';
import { safeError } from '@/lib/security/api-response';

// PUT /api/users/[userId]/password - Change user password
async function handlePut(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const { API_BASE_URL } = await import('@/config/api');

    // Get request body
    const body = await request.json();

    // Validate required fields
    if (!body.current_password || !body.new_password) {
      return safeError('Current password and new password are required', 400);
    }

    // Forward cookies to backend
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    const backendResponse = await fetch(`${API_BASE_URL}/api/users/${userId}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      },
      credentials: 'include',
      body: JSON.stringify(body)
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      logger.warn('Backend password change failed', {
        userId,
        status: backendResponse.status,
        error: errorText
      });

      // Return specific error messages
      if (backendResponse.status === 401) {
        return safeError('Current password is incorrect', 401);
      }
      if (backendResponse.status === 400) {
        return safeError('Invalid password format', 400);
      }
      return safeError('Failed to change password', backendResponse.status);
    }

    const result = await backendResponse.json();

    logger.info('Password changed successfully', { userId });

    return NextResponse.json(result);

  } catch (error) {
    logger.error('Error changing password', {
      error: error instanceof Error ? error.message : String(error)
    });
    return safeError('Failed to change password', 500);
  }
}

// Export wrapped handler with auth, CSRF, and rate limiting (password change is sensitive)
export const PUT = withAuth(withCSRF(withRateLimit('api', handlePut)));
