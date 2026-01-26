// app/api/decision-memo/stream/[sessionId]/route.ts
// Server-Sent Events (SSE) stream for real-time Decision Memo updates

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    sessionId: string;
  };
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  const { sessionId } = await Promise.resolve(context.params);

  console.log('🔌 Decision Memo SSE Proxy: Connecting for session:', sessionId);

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Helper to send SSE event
      const sendEvent = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Backend SSE URL for Decision Memo
      const sseUrl = `${API_BASE_URL}/api/decision-memo/stream/${sessionId}`;
      console.log('🔗 Proxy will connect to backend SSE:', sseUrl);

      try {
        // CRITICAL FIX: Send initial SSE headers immediately to prevent client timeout
        // The backend may take time to send its first chunk, so we send a comment first
        controller.enqueue(encoder.encode(': proxy-starting\n\n'));

        // Fetch from backend SSE endpoint
        console.log('🔗 Fetching from backend SSE...');
        const response = await fetch(sseUrl, {
          headers: {
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }).catch(err => {
          console.error('❌ Fetch error:', err);
          throw err;
        });

        console.log('📡 Backend SSE response status:', response.status, 'headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Backend SSE failed with status:', response.status, 'body:', errorText);
          throw new Error(`Backend SSE failed: ${response.status} - ${errorText}`);
        }

        if (!response.body) {
          console.error('❌ No response body from backend');
          throw new Error('No response body from backend');
        }

        console.log('✅ Backend SSE connection established, starting to stream...');

        // Stream the backend response to the client
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log('📭 Backend stream closed');
            break;
          }

          // Decode chunk
          const chunk = decoder.decode(value, { stream: true });
          console.log('📦 Received chunk from backend:', chunk.substring(0, 200));

          // CRITICAL FIX: Forward the raw chunk directly to client
          // This preserves SSE formatting (event:, data:, id:, retry:, comments)
          // and ensures immediate streaming without buffering delays
          controller.enqueue(value);
        }

        // Stream completed
        controller.close();

      } catch (error) {
        // Send error event
        try {
          sendEvent('error', {
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          });
        } catch (sendError) {
          // Silent fail
        }

        controller.close();
      }
    },

    cancel() {
      // Cleanup if needed
    }
  });

  // Return SSE response
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
