// app/api/users/[userId]/route.ts
// API route for user profile operations - proxies to FastAPI backend

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logger } from '@/lib/secure-logger';
import { withAuth, withRateLimit } from '@/lib/security/api-auth';
import { safeError } from '@/lib/security/api-response';

// GET /api/users/[userId] - Fetch user profile
async function handleGet(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const { API_BASE_URL } = await import('@/config/api');

    // Forward cookies to backend
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    const backendResponse = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      },
      credentials: 'include'
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      logger.warn('Backend user fetch failed', {
        userId,
        status: backendResponse.status,
        error: errorText
      });
      return safeError(
        backendResponse.status === 404 ? 'User not found' : 'Failed to fetch user profile',
        backendResponse.status
      );
    }

    const userData = await backendResponse.json();

    logger.info('User profile fetched successfully', { userId });

    return NextResponse.json(userData);

  } catch (error) {
    logger.error('Error fetching user profile', {
      error: error instanceof Error ? error.message : String(error)
    });
    return safeError('Failed to fetch user profile', 500);
  }
}

// PUT /api/users/[userId] - Update user profile
async function handlePut(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const { API_BASE_URL } = await import('@/config/api');

    // Get request body
    const body = await request.json();

    // Forward cookies to backend
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    const backendResponse = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
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
      logger.warn('Backend user update failed', {
        userId,
        status: backendResponse.status,
        error: errorText
      });
      return safeError(
        backendResponse.status === 404 ? 'User not found' : 'Failed to update user profile',
        backendResponse.status
      );
    }

    const updatedUser = await backendResponse.json();

    logger.info('User profile updated successfully', { userId });

    return NextResponse.json(updatedUser);

  } catch (error) {
    logger.error('Error updating user profile', {
      error: error instanceof Error ? error.message : String(error)
    });
    return safeError('Failed to update user profile', 500);
  }
}

// Export wrapped handlers with auth and rate limiting
export const GET = withAuth(withRateLimit('api', handleGet));
export const PUT = withAuth(withRateLimit('api', handlePut));
