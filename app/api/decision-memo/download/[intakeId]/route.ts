import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import {
  encodeDecisionMemoIdForPath,
  resolveCanonicalDecisionMemoId,
} from '@/lib/decision-memo/memo-id-aliases';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ intakeId: string }> }
) {
  const { intakeId } = await params;
  const canonicalIntakeId = resolveCanonicalDecisionMemoId(intakeId);
  const backendHeaders: Record<string, string> = {};
  const cookieHeader = request.headers.get('cookie');
  const authHeader = request.headers.get('authorization');
  if (cookieHeader) {
    backendHeaders.Cookie = cookieHeader;
  }
  if (authHeader) {
    backendHeaders.Authorization = authHeader;
  }

  const response = await fetch(
    `${API_BASE_URL}/api/decision-memo/download/${encodeDecisionMemoIdForPath(canonicalIntakeId)}`,
    {
      method: 'GET',
      headers: backendHeaders,
      signal: AbortSignal.timeout(30000),
    }
  );

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Content-Disposition': response.headers.get('content-disposition') || `attachment; filename="decision-memo-${intakeId}.pdf"`,
      },
    });
  }

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
