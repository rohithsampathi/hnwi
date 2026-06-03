import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

export async function GET(request: NextRequest) {
  const response = await fetch(`${API_BASE_URL}/api/castle-briefs/public/counts`, {
    method: 'GET',
    headers: {
      'Cookie': request.headers.get('cookie') || '',
      'Authorization': request.headers.get('authorization') || '',
    },
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
