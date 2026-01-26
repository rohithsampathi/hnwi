// app/api/decision-memo/start/route.ts
// Initialize Decision Memo session and return intake_id for SSE connection

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, email } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'Missing user_id' },
        { status: 400 }
      );
    }

    console.log('📝 Decision Memo /start called:', { user_id, email, backend: API_BASE_URL });

    try {
      // Call Python backend to create intake session
      const backendUrl = `${API_BASE_URL}/api/decision-memo/start`;
      console.log('🔗 Calling backend:', backendUrl);

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, email }),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      console.log('📡 Backend response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error:', response.status, errorText);
        throw new Error(`Backend returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Backend response:', data);

      // Backend returns: { success: true, intake_id: "dm_abc123", stream_url: "/api/decision-memo/stream/dm_abc123" }
      return NextResponse.json({
        success: true,
        intake_id: data.intake_id,
        stream_url: `/api/decision-memo/stream/${data.intake_id}`, // Use Next.js proxy
      });

    } catch (backendError) {
      console.error('❌ Backend connection failed:', backendError);
      console.error('❌ Backend URL was:', `${API_BASE_URL}/api/decision-memo/start`);
      console.error('❌ Error details:', backendError instanceof Error ? backendError.message : String(backendError));

      // NEVER return a mock ID - always fail fast and show the real error
      throw backendError;
    }

  } catch (error) {
    console.error('💥 Error starting Decision Memo:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to start assessment. Please ensure the backend is running.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
