// app/api/decision-memo/submit-answer/route.ts
// Submit individual answer and trigger SSE events (opportunities, mistakes, intelligence)

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { intake_id, question_id, answer } = body;

    // Validate required fields
    if (!intake_id || !question_id || !answer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('📝 Decision Memo /submit-answer called:', { intake_id, question_id, answer: answer.substring(0, 50) + '...', backend: API_BASE_URL });

    try {
      // Call Python backend to process answer
      const backendUrl = `${API_BASE_URL}/api/decision-memo/submit-answer`;
      console.log('🔗 Calling backend:', backendUrl);

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intake_id, question_id, answer }),
        signal: AbortSignal.timeout(30000), // 30 second timeout for analysis
      });

      console.log('📡 Backend response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error:', response.status, errorText);
        throw new Error(`Backend returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Backend response:', data);

      // Backend returns: { success: true, question_id: "q1_move1", discoveries_triggered: 3 }
      // Actual discoveries are sent via SSE events (opportunity_found, mistake_identified, intelligence_match)
      return NextResponse.json(data);

    } catch (backendError) {
      console.error('❌ Backend connection failed:', backendError);

      // For development: Return mock success if backend is unavailable
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 DEV MODE: Using mock answer submission');

        return NextResponse.json({
          success: true,
          question_id,
          discoveries_triggered: 0,
          dev_mode: true,
          message: 'Development mode: Answer recorded, waiting for backend SSE implementation'
        });
      }

      throw backendError;
    }

  } catch (error) {
    console.error('💥 Error submitting answer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit answer. Please ensure the backend is running.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
