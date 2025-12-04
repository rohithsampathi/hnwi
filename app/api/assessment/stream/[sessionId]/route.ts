// app/api/assessment/stream/[sessionId]/route.ts
// Server-Sent Events (SSE) stream for real-time assessment updates

import { NextRequest, NextResponse } from 'next/server';

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

  console.log('[SSE] Client connecting for session:', sessionId);

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
      const backendUrl = process.env.API_BASE_URL || 'http://localhost:8000';
      const sseUrl = `${backendUrl}/api/assessment/stream/${sessionId}`;

      console.log('[SSE] Connecting to backend:', sseUrl);

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
            console.log('[SSE] ⚠️ Backend stream closed unexpectedly');
            console.log('[SSE] ⚠️ Stream ended for session:', sessionId);
            break;
          }

          // Decode chunk
          const chunk = decoder.decode(value, { stream: true });
          console.log('[SSE Proxy] 📦 Received chunk from backend:', chunk.substring(0, 200) + (chunk.length > 200 ? '...' : ''));
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
                  console.log('[SSE Proxy] 📥 Event type received from backend:', eventType);
                } else if (line.startsWith('data:')) {
                  eventData = line.substring(5).trim();
                  const dataPreview = eventData.length > 100 ? eventData.substring(0, 100) + '...' : eventData;
                  console.log('[SSE Proxy] 📥 Event data received from backend:', dataPreview);
                }
              }

              // Forward to client
              if (eventData) {
                console.log('[SSE Proxy] 📤 Forwarding event type:', eventType);
                const dataPreview = eventData.length > 100 ? eventData.substring(0, 100) + '...' : eventData;
                console.log('[SSE Proxy] 📤 Event data being forwarded:', dataPreview);
                const forwardMessage = `event: ${eventType}\ndata: ${eventData}\n\n`;
                controller.enqueue(encoder.encode(forwardMessage));
                console.log('[SSE Proxy] ✅ Event forwarded successfully to browser');
              }
            }
          }
        }

        // Stream completed
        controller.close();

      } catch (error) {
        console.error('[SSE] ❌ Stream error:', error);
        console.error('[SSE] ❌ Error details:', error instanceof Error ? error.stack : error);

        // Send error event
        try {
          sendEvent('error', {
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          });
        } catch (sendError) {
          console.error('[SSE] ❌ Could not send error event:', sendError);
        }

        controller.close();
      }
    },

    cancel() {
      console.log('[SSE] Client disconnected');
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
