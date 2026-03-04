// API route to fetch user's decision memo audits — proxies to backend /my-memos
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { logger } from '@/lib/secure-logger';
import { safeError } from '@/lib/security/api-response';

export async function GET(request: NextRequest) {
  try {
    // Forward cookies/auth headers to backend
    const cookieHeader = request.headers.get('cookie') || '';
    const authHeader = request.headers.get('authorization') || '';

    const backendUrl = `${API_BASE_URL}/api/decision-memo/my-memos`;
    logger.info('Fetching user memos from backend:', backendUrl);

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader ? { 'Cookie': cookieHeader } : {}),
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      logger.error(`Backend /my-memos failed: ${backendResponse.status} ${errorText}`);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch memos from backend', audits: [] },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Transform backend response to frontend Audit format
    const audits = (data.memos || []).map((memo: any) => ({
      intake_id: memo.intake_id,
      source_jurisdiction: memo.source || '',
      destination_jurisdiction: memo.destination || '',
      source_country: memo.source || '',
      destination_country: memo.destination || '',
      source_coordinates: memo.source_coordinates || null,
      destination_coordinates: memo.destination_coordinates || null,
      created_at: memo.created_at || '',
      type: memo.type || '',
      value: memo.value || '',
      summary: memo.summary || '',
      status: memo.status || 'pending',
      is_paid: memo.is_paid || false,
      // Rich preview fields from completed audits
      verdict: memo.verdict || '',
      risk_level: memo.risk_level || '',
      total_exposure: memo.total_exposure || '',
      total_savings: memo.total_savings || '',
      annual_value: memo.annual_value || '',
      exposure_class: memo.exposure_class || '',
      transaction_value: memo.transaction_value || '',
      // Access control flag
      has_access: memo.has_access || false,
    }));

    return NextResponse.json({
      success: true,
      audits,
      count: audits.length,
    });
  } catch (error: any) {
    logger.error('Error fetching user audits:', error);
    return safeError(error);
  }
}
