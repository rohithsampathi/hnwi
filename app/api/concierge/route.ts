// app/api/concierge/route.ts
// Server-side proxy for concierge/interest form submissions
// Keeps Formspree endpoint IDs out of client-side code

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Formspree endpoints — loaded from env vars, never hardcoded
// Fallback to empty string so missing config fails gracefully (400 error)
const FORMSPREE_ENDPOINTS: Record<string, string> = {
  social_hub: process.env.FORMSPREE_EVENTS_ENDPOINT || '',
  prive_exchange: process.env.FORMSPREE_OPPORTUNITIES_ENDPOINT || '',
  calendar: process.env.FORMSPREE_EVENTS_ENDPOINT || '',
};

// Allowed origins — only accept submissions from our own domains
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  'https://hnwichronicles.com',
  'https://www.hnwichronicles.com',
].filter(Boolean) as string[];

// In development, also allow localhost
if (process.env.NODE_ENV === 'development') {
  ALLOWED_ORIGINS.push('http://localhost:3000', 'http://localhost:3001');
}

// Simple in-memory rate limiter (per IP, 3 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Origin validation — reject requests from unknown origins
    const origin = request.headers.get('origin') || request.headers.get('referer') || '';
    const isAllowedOrigin = ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
    if (!isAllowedOrigin && process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 2. Authentication — require logged-in user
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value
      || cookieStore.get('session_token')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 3. Rate limit by IP (tightened to 3/min)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { source, ...formData } = body;

    // 4. Honeypot — if _gotcha field is filled, silently reject (bots fill hidden fields)
    if (formData._gotcha) {
      // Return success to not tip off the bot
      return NextResponse.json({ success: true, data: {} });
    }

    // 5. Validate source
    const endpoint = FORMSPREE_ENDPOINTS[source];
    if (!source || !endpoint) {
      return NextResponse.json(
        { error: 'Invalid form source' },
        { status: 400 }
      );
    }

    // 6. Validate minimum required fields
    if (!formData._subject && !formData.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 7. Forward to Formspree
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to submit', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
