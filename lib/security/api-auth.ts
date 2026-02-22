// lib/security/api-auth.ts - Composable API route guards
// Usage: export const POST = withAuth(withCSRF(withRateLimit('payment', handler)));

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { RateLimiter, RateLimiters } from './rate-limiter';
import { CSRFProtection } from '../csrf-protection';
import { logger } from '../secure-logger';
import { sanitizeLoggingContext } from './sanitization';
import { safeError } from './api-response';

// Ensure rate limiters are initialized server-side (singleton-safe)
let _initialized = false;
function ensureRateLimiters() {
  if (!_initialized) {
    RateLimiters.initialize();
    // Add payment limiter: 10 requests/min
    RateLimiter.getInstance('payment', {
      windowMs: 60 * 1000,
      maxRequests: 10,
    });
    // Add inquiry limiter: 5 requests/min (spam protection for public forms)
    RateLimiter.getInstance('inquiry', {
      windowMs: 60 * 1000,
      maxRequests: 5,
    });
    _initialized = true;
  }
}

type RouteHandler = (request: NextRequest, ...args: any[]) => Promise<NextResponse>;

/**
 * Extract client IP from request headers
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

/**
 * withAuth — validates session cookie server-side.
 * Returns 401 if no valid session token found.
 * Injects X-User-Id header for downstream handlers.
 */
export function withAuth(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get('access_token')?.value
        || cookieStore.get('session_token')?.value;

      if (!accessToken) {
        const context = sanitizeLoggingContext({
          endpoint: new URL(request.url).pathname,
          method: request.method,
          ip: getClientIP(request),
        });
        logger.warn('Auth guard: no session token', context);

        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Extract user ID from session_user cookie if available
      const sessionUser = cookieStore.get('session_user')?.value;
      if (sessionUser) {
        request.headers.set('X-User-Id', sessionUser);
      }

      return handler(request, ...args);
    } catch (error) {
      return safeError(error, 401);
    }
  };
}

/**
 * withRateLimit — server-side rate limiting by client IP.
 * Returns 429 with Retry-After header when limit exceeded.
 *
 * @param limiterName - Key from RateLimiters (e.g. 'api', 'payment', 'inquiry')
 */
export function withRateLimit(limiterName: string, handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, ...args: any[]) => {
    ensureRateLimiters();

    const ip = getClientIP(request);

    try {
      const limiter = RateLimiter.getInstance(limiterName);
      const result = await limiter.checkLimit(ip);

      if (!result.allowed) {
        const context = sanitizeLoggingContext({
          endpoint: new URL(request.url).pathname,
          method: request.method,
          ip,
        });
        logger.warn(`Rate limit exceeded: ${limiterName}`, context);

        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(result.retryAfter || 60),
              'X-RateLimit-Limit': String(result.limit),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(result.resetTime),
            },
          }
        );
      }

      return handler(request, ...args);
    } catch (error) {
      // If rate limiter fails, allow the request through (fail open)
      logger.error('Rate limiter error', {
        limiter: limiterName,
        error: error instanceof Error ? error.message : String(error),
      });
      return handler(request, ...args);
    }
  };
}

/**
 * withValidation — validates request body against a Zod schema.
 * Returns 400 with sanitized details if validation fails.
 * Attaches validated body to X-Validated-Body header for downstream handlers.
 */
export function withValidation(schema: import('zod').ZodSchema, handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      const body = await request.json();
      const result = schema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Invalid input',
            details: result.error.issues.map(i => i.message),
          },
          { status: 400 }
        );
      }
      // Attach validated & sanitized body so handler doesn't re-parse
      request.headers.set('X-Validated-Body', JSON.stringify(result.data));
      return handler(request, ...args);
    } catch (error) {
      return safeError(error, 400);
    }
  };
}

/**
 * withCSRF — validates CSRF token on state-changing requests.
 * Thin composable wrapper around CSRFProtection.withCSRFProtection.
 */
export function withCSRF(handler: RouteHandler): RouteHandler {
  return CSRFProtection.withCSRFProtection(handler);
}
