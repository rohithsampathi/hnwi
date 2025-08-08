// lib/rate-limiter.ts - Rate limiting implementation for API security

import { NextRequest } from 'next/server';
import { logger } from './secure-logger';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator: (request: NextRequest) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configurations
const RATE_LIMITS = {
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    keyGenerator: (req) => `login:${getClientIP(req)}`
  },
  API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    keyGenerator: (req) => `api:${getClientIP(req)}`
  },
  SENSITIVE: {
    windowMs: 60 * 1000, // 1 minute  
    maxRequests: 10, // 10 requests per minute for sensitive operations
    keyGenerator: (req) => `sensitive:${getClientIP(req)}`
  },
  CROWN_VAULT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50, // 50 requests per minute for Crown Vault operations
    keyGenerator: (req) => `crown:${getClientIP(req)}`
  }
};

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const remoteAddr = request.ip;
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (real) {
    return real.trim();
  }
  
  return remoteAddr || 'unknown';
}

// Clean up expired entries periodically
function cleanupExpired() {
  const now = Date.now();
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpired, 5 * 60 * 1000);

export class RateLimiter {
  /**
   * Check if request is within rate limit
   */
  static async checkLimit(
    request: NextRequest,
    limitType: keyof typeof RATE_LIMITS
  ): Promise<{
    allowed: boolean;
    remainingRequests: number;
    resetTime: number;
    totalHits: number;
  }> {
    const config = RATE_LIMITS[limitType];
    if (!config) {
      logger.error('Invalid rate limit type', { limitType });
      return { allowed: true, remainingRequests: 0, resetTime: 0, totalHits: 0 };
    }

    const key = config.keyGenerator(request);
    const now = Date.now();
    const resetTime = now + config.windowMs;

    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      entry = {
        count: 1,
        resetTime
      };
      rateLimitStore.set(key, entry);

      return {
        allowed: true,
        remainingRequests: config.maxRequests - 1,
        resetTime: entry.resetTime,
        totalHits: 1
      };
    }

    // Increment counter
    entry.count++;
    rateLimitStore.set(key, entry);

    const allowed = entry.count <= config.maxRequests;
    const remainingRequests = Math.max(0, config.maxRequests - entry.count);

    // Log rate limit violations
    if (!allowed) {
      logger.warn('Rate limit exceeded', {
        limitType,
        key: key.replace(/:\d+\.\d+\.\d+\.\d+/, ':***'), // Mask IP for privacy
        count: entry.count,
        maxRequests: config.maxRequests,
        resetTime: new Date(entry.resetTime).toISOString(),
        userAgent: request.headers.get('user-agent'),
        endpoint: new URL(request.url).pathname
      });
    }

    return {
      allowed,
      remainingRequests,
      resetTime: entry.resetTime,
      totalHits: entry.count
    };
  }

  /**
   * Custom rate limiter for specific operations
   */
  static async checkCustomLimit(
    key: string,
    windowMs: number,
    maxRequests: number
  ): Promise<boolean> {
    const now = Date.now();
    const resetTime = now + windowMs;
    
    let entry = rateLimitStore.get(key);
    
    if (!entry || now > entry.resetTime) {
      entry = { count: 1, resetTime };
      rateLimitStore.set(key, entry);
      return true;
    }
    
    entry.count++;
    rateLimitStore.set(key, entry);
    
    return entry.count <= maxRequests;
  }

  /**
   * Block IP address temporarily (security measure)
   */
  static blockIP(ip: string, durationMs: number = 60 * 60 * 1000) { // 1 hour default
    const key = `blocked:${ip}`;
    const resetTime = Date.now() + durationMs;
    
    rateLimitStore.set(key, {
      count: Number.MAX_SAFE_INTEGER, // Effectively infinite
      resetTime
    });
    
    logger.warn('IP address blocked', {
      ip: ip.replace(/\d+\.\d+\.\d+\.\d+/, '***'),
      duration: durationMs,
      until: new Date(resetTime).toISOString()
    });
  }

  /**
   * Check if IP is blocked
   */
  static isBlocked(request: NextRequest): boolean {
    const ip = getClientIP(request);
    const key = `blocked:${ip}`;
    const entry = rateLimitStore.get(key);
    
    if (!entry) return false;
    
    const now = Date.now();
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Get rate limit status for client
   */
  static getStatus(
    request: NextRequest,
    limitType: keyof typeof RATE_LIMITS
  ): {
    limit: number;
    remaining: number;
    reset: number;
    retryAfter?: number;
  } {
    const config = RATE_LIMITS[limitType];
    const key = config.keyGenerator(request);
    const entry = rateLimitStore.get(key);
    
    if (!entry) {
      return {
        limit: config.maxRequests,
        remaining: config.maxRequests,
        reset: Date.now() + config.windowMs
      };
    }
    
    const remaining = Math.max(0, config.maxRequests - entry.count);
    const retryAfter = remaining === 0 ? Math.ceil((entry.resetTime - Date.now()) / 1000) : undefined;
    
    return {
      limit: config.maxRequests,
      remaining,
      reset: entry.resetTime,
      retryAfter
    };
  }

  /**
   * Add rate limit headers to response
   */
  static addHeaders(
    request: NextRequest,
    response: Response,
    limitType: keyof typeof RATE_LIMITS
  ): Response {
    const status = this.getStatus(request, limitType);
    
    const headers = new Headers(response.headers);
    headers.set('X-RateLimit-Limit', status.limit.toString());
    headers.set('X-RateLimit-Remaining', status.remaining.toString());
    headers.set('X-RateLimit-Reset', Math.ceil(status.reset / 1000).toString());
    
    if (status.retryAfter) {
      headers.set('Retry-After', status.retryAfter.toString());
    }
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  /**
   * Clear all rate limit data (for testing)
   */
  static clear(): void {
    rateLimitStore.clear();
  }

  /**
   * Get current store size (for monitoring)
   */
  static getStoreSize(): number {
    return rateLimitStore.size;
  }
}