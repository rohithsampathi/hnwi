// =============================================================================
// SUBMIT SFO INTAKE API ROUTE
// Creates a new Pattern Audit session from 3 SFO-grade inputs
// Route: POST /api/decision-memo/submit-sfo-intake
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { withAuth, withValidation } from '@/lib/security/api-auth';
import { sfoIntakeSchema } from '@/lib/security/validation-schemas';
import { safeError } from '@/lib/security/api-response';
import { logger } from '@/lib/secure-logger';

// Allow longer execution time for MoEv5 audit generation
// Vercel Pro: 300s max | Enterprise: 900s max
export const maxDuration = 300;

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();
    const { thesis, constraints, control_and_rails, urgency } = body;

    // Validate required fields
    if (!thesis?.move_description || !thesis?.expected_outcome) {
      return NextResponse.json(
        { success: false, error: 'Missing required thesis fields' },
        { status: 400 }
      );
    }

    logger.info('📝 SFO Intake submission received:', {
      moveDescription: thesis.move_description.substring(0, 50) + '...',
      hasConstraints: !!constraints,
      hasRails: !!control_and_rails,
      urgency
    });

    const backendUrl = `${API_BASE_URL}/api/decision-memo/submit-sfo-intake`;
    logger.info('🔗 Calling backend:', backendUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status >= 400) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('❌ Backend error:', response.status, errorData);
        return NextResponse.json(
          { success: false, error: `Backend returned ${response.status}`, details: errorData },
          { status: response.status }
        );
      }

      const data = await response.json();
      logger.info('✅ Backend response:', data);
      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }

  } catch (error) {
    return safeError(error);
  }
}

export const POST = withAuth(withValidation(sfoIntakeSchema, handlePost));
