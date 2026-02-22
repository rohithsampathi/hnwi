// app/api/gdpr/route.ts
// Handle Data Subject Requests (DSR): access, erasure, portability
// Protected by withAuth + withCSRF

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withCSRF, withValidation } from '@/lib/security/api-auth';
import { gdprRequestSchema } from '@/lib/security/validation-schemas';
import { safeError } from '@/lib/security/api-response';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

const VALID_REQUEST_TYPES = ['ACCESS', 'PORTABILITY', 'ERASURE', 'RECTIFICATION', 'RESTRICTION'] as const;

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, user_id } = body;

    if (!type || !VALID_REQUEST_TYPES.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid request type', valid_types: VALID_REQUEST_TYPES },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing user_id' },
        { status: 400 }
      );
    }

    // Forward DSR to backend
    const backendResponse = await fetch(`${API_BASE_URL}/api/gdpr/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, user_id }),
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to process data request' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json({
      success: true,
      request_id: data.request_id || `dsr_${Date.now()}`,
      type,
      status: 'PENDING',
      message: `Your ${type.toLowerCase()} request has been received and will be processed within 30 days.`,
    });
  } catch (error) {
    return safeError(error);
  }
}

export const POST = withAuth(withCSRF(withValidation(gdprRequestSchema, handlePost)));
