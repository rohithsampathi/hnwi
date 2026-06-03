// app/api/decision-memo/submit-10q/route.ts
// API route to submit 10Q stress test and generate preview

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { withAuth, withValidation } from '@/lib/security/api-auth';
import { decisionMemo10qSchema } from '@/lib/security/validation-schemas';
import { safeError } from '@/lib/security/api-response';
import { logger } from '@/lib/secure-logger';

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, responses } = body;

    // Validate required fields
    if (!user_id || !responses) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const pythonResponse = await fetch(`${API_BASE_URL}/api/decision-memo/submit-10q`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
        'Authorization': request.headers.get('authorization') || '',
      },
      body: JSON.stringify({ user_id, responses }),
      signal: AbortSignal.timeout(30000),
    });

    const responseText = await pythonResponse.text();
    const data = responseText
      ? (() => {
          try {
            return JSON.parse(responseText);
          } catch {
            return { success: false, error: responseText };
          }
        })()
      : {};

    if (!pythonResponse.ok) {
      logger.error('Decision Memo 10Q backend error:', pythonResponse.status, data);
      return NextResponse.json(data, { status: pythonResponse.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    return safeError(error);
  }
}

export const POST = withAuth(withValidation(decisionMemo10qSchema, handlePost));
