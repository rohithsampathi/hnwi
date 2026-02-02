// =============================================================================
// REPORT AUTH PROXY — Catch-all for /api/decision-memo/auth/* endpoints
// Proxies login, MFA verify, MFA resend to the FastAPI backend
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

interface RouteParams {
  params: {
    path: string[];
  };
}

export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  const { path } = await Promise.resolve(context.params);
  const subPath = path.join('/');
  const backendUrl = `${API_BASE_URL}/api/decision-memo/auth/${subPath}`;

  try {
    const body = await request.json();

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`[Report Auth] Error proxying /auth/${subPath}:`, error);
    return NextResponse.json(
      { detail: 'Failed to connect to authentication service' },
      { status: 502 }
    );
  }
}
