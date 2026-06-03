// app/api/decision-memo/submit-answer/route.ts
// Submit individual answer and trigger SSE events (opportunities, mistakes, intelligence)

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { withAuth, withValidation } from '@/lib/security/api-auth';
import { decisionMemoAnswerSchema } from '@/lib/security/validation-schemas';
import { safeError } from '@/lib/security/api-response';
import { logger } from '@/lib/secure-logger';

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();
    const { intake_id, question_id, answer } = body;

    // Validate required fields
    if (!intake_id || !question_id || !answer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    logger.info('📝 Decision Memo /submit-answer called:', { intake_id, question_id, answer: answer.substring(0, 50) + '...', backend: API_BASE_URL });

    const backendUrl = `${API_BASE_URL}/api/decision-memo/submit-answer`;
    logger.info('🔗 Calling backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
        'Authorization': request.headers.get('authorization') || '',
      },
      body: JSON.stringify({ intake_id, question_id, answer }),
      signal: AbortSignal.timeout(30000),
    });

    logger.info('📡 Backend response status:', response.status);

    const responseText = await response.text();
    const data = responseText
      ? (() => {
          try {
            return JSON.parse(responseText);
          } catch {
            return { success: false, error: responseText };
          }
        })()
      : {};

    if (!response.ok) {
      logger.error('❌ Backend error:', response.status, data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    return safeError(error);
  }
}

export const POST = withAuth(withValidation(decisionMemoAnswerSchema, handlePost));
