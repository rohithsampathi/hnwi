// app/api/assessment/architect-inquiry/route.ts
// Handle Architect tier contact form submissions

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, email, whatsapp, tier } = body;

    console.log('[Architect Inquiry] Submitting inquiry:', { session_id, email, tier });

    // Forward to backend
    const response = await fetch(`${API_BASE_URL}/api/assessment/architect-inquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify({
        session_id,
        email,
        whatsapp,
        tier,
        submitted_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Architect Inquiry] Backend error:', errorText);

      // Even if backend fails, log locally and return success
      // This ensures we don't lose the lead
      console.log('[Architect Inquiry] FALLBACK - Logging locally:', body);

      return NextResponse.json({
        success: true,
        message: 'Inquiry received. We will contact you shortly.',
        fallback: true
      });
    }

    const data = await response.json();
    console.log('[Architect Inquiry] Success:', data);

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully',
      data
    });
  } catch (error) {
    console.error('[Architect Inquiry] Error:', error);

    // Log the inquiry attempt even on error
    const body = await request.json().catch(() => ({}));
    console.log('[Architect Inquiry] CRITICAL - Failed submission:', body);

    return NextResponse.json(
      {
        error: 'Failed to submit inquiry',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
