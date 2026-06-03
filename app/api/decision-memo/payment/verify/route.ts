import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const response = await fetch(`${API_BASE_URL}/api/decision-memo/payment/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': request.headers.get('cookie') || '',
      'Authorization': request.headers.get('authorization') || '',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

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

  return NextResponse.json(data, { status: response.status });
}
