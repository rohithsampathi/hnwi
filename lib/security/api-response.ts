// lib/security/api-response.ts - Sanitized error responses for API routes
// Usage: return safeError(error);  or  return safeError(error, 400);

import { NextResponse } from 'next/server';
import { sanitizeErrorMessage } from './sanitization';
import { logger } from '../secure-logger';

/**
 * Return a sanitized error response.
 * ALWAYS returns a generic message to the client (both dev and prod).
 * Full error details are logged server-side for debugging.
 */
export function safeError(error: unknown, status: number = 500): NextResponse {
  const trackingId = crypto.randomUUID();

  // Log full error server-side (visible in console/logs, never sent to client)
  logger.error('API error', {
    trackingId,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    status,
  });

  const message = sanitizeErrorMessage(error);

  return NextResponse.json(
    {
      error: message,
      trackingId,
    },
    { status }
  );
}
