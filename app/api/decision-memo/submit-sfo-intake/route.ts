// =============================================================================
// SUBMIT SFO INTAKE API ROUTE
// Creates a new Pattern Audit session from 3 SFO-grade inputs
// Route: POST /api/decision-memo/submit-sfo-intake
// =============================================================================

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import axios from 'axios';

// Allow longer execution time for MoEv5 audit generation
// Vercel Pro: 300s max | Enterprise: 900s max
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
      // 5 minutes (300000ms) for MoEv5 processing — matches Vercel maxDuration
      const response = await axios.post(backendUrl, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 300000, // 5 minutes
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
