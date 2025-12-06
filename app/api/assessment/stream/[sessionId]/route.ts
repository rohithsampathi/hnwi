// app/api/assessment/stream/[sessionId]/route.ts
// Server-Sent Events (SSE) stream for real-time assessment updates

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
  { params }: RouteParams
) {
  const { sessionId } = params;


  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Helper to send SSE event
      const sendEvent = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send initial connection event
      sendEvent('connected', {
        session_id: sessionId,
        timestamp: new Date().toISOString()
      });

      // Backend SSE URL
      const sseUrl = `${API_BASE_URL}/api/assessment/stream/${sessionId}`;


      try {
        // Fetch from backend SSE endpoint
        const response = await fetch(sseUrl, {
          headers: {
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          throw new Error(`Backend SSE failed: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body from backend');
        }

        // Stream the backend response to the client
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // Decode chunk
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Process complete messages (separated by double newline)
          const messages = buffer.split('\n\n');
          buffer = messages.pop() || ''; // Keep incomplete message in buffer

          for (const message of messages) {
            if (message.trim()) {
              // Parse event and data
              const lines = message.split('\n');
              let eventType = 'message';
              let eventData = '';

              for (const line of lines) {
                if (line.startsWith('event:')) {
                  eventType = line.substring(6).trim();
                } else if (line.startsWith('data:')) {
                  eventData = line.substring(5).trim();
                  const dataPreview = eventData.length > 100 ? eventData.substring(0, 100) + '...' : eventData;
                }
              }

              // Forward to client
              if (eventData) {
                const dataPreview = eventData.length > 100 ? eventData.substring(0, 100) + '...' : eventData;
                const forwardMessage = `event: ${eventType}\ndata: ${eventData}\n\n`;
                controller.enqueue(encoder.encode(forwardMessage));
              }
            }
          }
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
        }

        controller.close();
      }
    },

    cancel() {
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
