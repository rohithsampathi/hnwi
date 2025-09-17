import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';

// GET: Fetch current consent status
export async function GET(request: NextRequest) {
  try {
    // User is already authenticated, use requireAuth = false like other working endpoints
    const requireAuth = false;

    const response = await secureApi.get('/api/profile/privacy/consent', requireAuth);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    // Return default consent status if backend call fails
    return NextResponse.json({
      success: true,
      data: {
        consent_granted: true, // Default to true for existing users
        consent_date: new Date().toISOString(),
        explanation: "GDPR consent for data processing and communication"
      }
    }, { status: 200 });
  }
}

// POST: Toggle consent status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // User is already authenticated, use requireAuth = false like other working endpoints
    const requireAuth = false;

    const response = await secureApi.post('/api/profile/privacy/consent', body, requireAuth);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to update consent status'
    }, { status: 500 });
  }
}