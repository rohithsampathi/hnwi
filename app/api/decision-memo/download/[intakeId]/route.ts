// app/api/decision-memo/download/[intakeId]/route.ts
// Proxy endpoint to fetch decision memo from Python backend

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

interface RouteParams {
  params: {
    intakeId: string;
  };
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  const { intakeId } = await Promise.resolve(context.params);

  try {
    console.log('📥 Fetching decision memo:', intakeId);

    // Call Python backend
    const backendUrl = `${API_BASE_URL}/api/decision-memo/download/${intakeId}`;
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Decision memo fetched successfully');

    return NextResponse.json(data);

  } catch (error) {
    console.error('💥 Error fetching decision memo:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch decision memo',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
