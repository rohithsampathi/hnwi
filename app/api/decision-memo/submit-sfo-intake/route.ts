// =============================================================================
// SUBMIT SFO INTAKE API ROUTE
// Creates a new Pattern Audit session from 3 SFO-grade inputs
// Route: POST /api/decision-memo/submit-sfo-intake
// =============================================================================

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import axios from 'axios';

// Allow longer execution time for audit generation (5 minutes max for Vercel hobby plan)
// Note: Backend handles long-running MoEv5 processing; this just needs to wait for response
export const maxDuration = 300;

export async function POST(request: Request) {
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

    console.log('📝 SFO Intake submission received:', {
      moveDescription: thesis.move_description.substring(0, 50) + '...',
      hasConstraints: !!constraints,
      hasRails: !!control_and_rails,
      urgency
    });

    const backendUrl = `${API_BASE_URL}/api/decision-memo/submit-sfo-intake`;
    console.log('🔗 Calling backend:', backendUrl);

    try {
      // Use axios instead of fetch to avoid undici's default timeout
      // Set timeout to 5 minutes (300000ms) - Vercel hobby plan max
      const response = await axios.post(backendUrl, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 300000, // 5 minutes (Vercel hobby plan limit)
        validateStatus: () => true, // Don't throw on non-2xx status
      });

      if (response.status >= 400) {
        console.error('❌ Backend error:', response.status, response.data);
        return NextResponse.json(
          { success: false, error: `Backend returned ${response.status}`, details: response.data },
          { status: response.status }
        );
      }

      console.log('✅ Backend response:', response.data);
      return NextResponse.json(response.data);
    } catch (axiosError) {
      // Re-throw to be caught by outer catch
      throw axiosError;
    }

  } catch (error) {
    console.error('💥 Error submitting SFO intake:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit intake',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
