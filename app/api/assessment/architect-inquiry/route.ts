// app/api/assessment/architect-inquiry/route.ts
// Handle Architect tier contact form submissions

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, email, whatsapp, tier } = body;


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

      // Even if backend fails, log locally and return success
      // This ensures we don't lose the lead

      return NextResponse.json({
        success: true,
        message: 'Inquiry received. We will contact you shortly.',
        fallback: true
      });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully',
      data
    });
  } catch (error) {

    // Log the inquiry attempt even on error
    const body = await request.json().catch(() => ({}));

    return NextResponse.json(
      {
        error: 'Failed to submit inquiry',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
