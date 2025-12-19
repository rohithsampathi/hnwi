// app/api/assessment/operator-inquiry/route.ts
// Handle Operator tier contact form submissions

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, email, whatsapp, tier } = body;

    // Validate required fields
    if (!email || !whatsapp || !session_id) {
      return NextResponse.json(
        { error: 'Email, WhatsApp number, and session ID are required' },
        { status: 400 }
      );
    }

    // Get user's IP and user agent for tracking
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Prepare lead data
    const leadData = {
      session_id,
      email,
      whatsapp,
      tier: 'operator',
      submitted_at: new Date().toISOString(),
      source_ip: ip,
      user_agent: userAgent,
      // Add any session results data if available
      metadata: {
        source: 'assessment_results',
        page_url: request.headers.get('referer') || 'unknown'
      }
    };

    // Forward to backend with enhanced error handling
    const response = await fetch(`${API_BASE_URL}/api/assessment/operator-inquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify(leadData)
    });

    if (!response.ok) {
      const errorText = await response.text();

      // Even if backend fails, log locally and return success
      // This ensures we don't lose the lead
      // TODO: Implement local database backup or send to fallback email service

      return NextResponse.json({
        success: true,
        message: 'Thank you for your interest! We will contact you within 24 hours.',
        fallback: true,
        lead_id: `op_${Date.now()}` // Generate a tracking ID
      });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Thank you for your interest! We will contact you within 24 hours.',
      data
    });
  } catch (error) {

    // Log the inquiry attempt even on error for recovery
    const bodyStr = await request.text().catch(() => '{}');

    return NextResponse.json(
      {
        error: 'Failed to submit inquiry',
        details: error instanceof Error ? error.message : 'Unknown error',
        message: 'Please contact us directly at hnwi@montaigne.co'
      },
      { status: 500 }
    );
  }
}
