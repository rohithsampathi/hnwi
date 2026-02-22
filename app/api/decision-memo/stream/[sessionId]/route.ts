// app/api/decision-memo/stream/[sessionId]/route.ts
// Server-Sent Events (SSE) stream for real-time Decision Memo updates

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { logger } from '@/lib/secure-logger';

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

  logger.info('Decision Memo SSE Proxy connecting', { sessionId });

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
      logger.info('Proxy connecting to backend SSE', { sessionId });

      try {
        // CRITICAL FIX: Send initial SSE headers immediately to prevent client timeout
        // The backend may take time to send its first chunk, so we send a comment first
        controller.enqueue(encoder.encode(': proxy-starting\n\n'));

        // Fetch from backend SSE endpoint
        logger.info('Fetching from backend SSE');
        const response = await fetch(sseUrl, {
          headers: {
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }).catch(err => {
          logger.error('SSE fetch error', { error: err instanceof Error ? err.message : String(err) });
          throw err;
        });

        logger.info('Backend SSE response received', { status: response.status });

        if (!response.ok) {
          const errorText = await response.text();
          logger.error('Backend SSE failed', { status: response.status });
          throw new Error(`Backend SSE failed: ${response.status} - ${errorText}`);
        }

        if (!response.body) {
          logger.error('No response body from backend SSE');
          throw new Error('No response body from backend');
        }

        logger.info('Backend SSE connection established, streaming');

        // Stream the backend response to the client
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            logger.info('Backend SSE stream closed', { sessionId });
            break;
          }

          // Decode chunk
          const chunk = decoder.decode(value, { stream: true });
          logger.info('Received SSE chunk from backend', { chunkLength: chunk.length });

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
