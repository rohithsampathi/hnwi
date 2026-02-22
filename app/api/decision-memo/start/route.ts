// app/api/decision-memo/start/route.ts
// Initialize Decision Memo session and return intake_id for SSE connection

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { withAuth, withValidation } from '@/lib/security/api-auth';
import { decisionMemoStartSchema } from '@/lib/security/validation-schemas';
import { safeError } from '@/lib/security/api-response';
import { logger } from '@/lib/secure-logger';

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, email } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'Missing user_id' },
        { status: 400 }
      );
    }

    logger.info('📝 Decision Memo /start called:', { user_id, email, backend: API_BASE_URL });

    try {
      // Call Python backend to create intake session
      const backendUrl = `${API_BASE_URL}/api/decision-memo/start`;
      logger.info('🔗 Calling backend:', backendUrl);

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, email }),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      logger.info('📡 Backend response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('❌ Backend error:', response.status, errorText);
        throw new Error(`Backend returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      logger.info('✅ Backend response:', data);

      // Backend returns: { success: true, intake_id: "dm_abc123", stream_url: "/api/decision-memo/stream/dm_abc123" }
      return NextResponse.json({
        success: true,
        intake_id: data.intake_id,
        stream_url: `/api/decision-memo/stream/${data.intake_id}`, // Use Next.js proxy
      });

    } catch (backendError) {
      logger.error('❌ Backend connection failed:', backendError);
      logger.error('❌ Backend URL was:', `${API_BASE_URL}/api/decision-memo/start`);
      logger.error('❌ Error details:', backendError instanceof Error ? backendError.message : String(backendError));

      // NEVER return a mock ID - always fail fast and show the real error
      throw backendError;
    }

  } catch (error) {
    return safeError(error);
  }
}

export const POST = withAuth(withValidation(decisionMemoStartSchema, handlePost));
