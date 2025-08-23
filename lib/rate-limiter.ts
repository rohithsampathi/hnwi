// lib/rate-limiter.ts - Rate limiting implementation for API security

import { NextRequest } from 'next/server';
import { logger } from './secure-logger';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator: (request: NextRequest, userId?: string) => string;
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configurations - Production-grade security for HNWI platform
const RATE_LIMITS = {
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: process.env.NODE_ENV === 'production' ? 5 : 10, // Banking-standard security
    keyGenerator: (req) => `login:${getClientIP(req)}`,
    message: 'Too many login attempts. Please try again in 15 minutes for security.'
  },
  API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: process.env.NODE_ENV === 'production' ? 30 : 50, // Balanced security/UX
    keyGenerator: (req) => `api:${getClientIP(req)}`,
    message: 'API rate limit exceeded. Please slow down your requests.'
  },
  SENSITIVE: {
    windowMs: 60 * 1000, // 1 minute  
    maxRequests: process.env.NODE_ENV === 'production' ? 3 : 5, // Enhanced security for critical ops
    keyGenerator: (req) => `sensitive:${getClientIP(req)}`,
    message: 'Sensitive operation limit reached. Please wait before trying again.'
  },
  CROWN_VAULT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: process.env.NODE_ENV === 'production' ? 15 : 20, // Financial data protection
    keyGenerator: (req) => `crown:${getClientIP(req)}`,
    message: 'Crown Vault access limit reached. Please wait a moment before continuing.'
  },
  // New: User-based rate limiting (more restrictive)
  USER_LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 3, // Even more restrictive per user account
    keyGenerator: (req, userId) => `user_login:${userId}`,
    message: 'Account temporarily locked due to multiple failed attempts. Contact support if needed.'
  },
  // New: Progressive penalties for repeated violations
  PROGRESSIVE: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1, // One strike per hour for progressive penalties
    keyGenerator: (req) => `progressive:${getClientIP(req)}`,
    message: 'IP temporarily blocked due to repeated violations. Access will be restored automatically.'
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
  
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  });
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

    const key = config.keyGenerator(request, undefined);
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

    // Log rate limit violations and implement progressive penalties
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

      // Implement progressive penalties for repeated violations
      await RateLimiter.recordViolation(request, limitType);
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
    const key = config.keyGenerator(request, undefined);
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

  /**
   * User-based rate limiting (more restrictive than IP-based)
   */
  static async checkUserLimit(
    request: NextRequest,
    userId: string,
    limitType: 'USER_LOGIN'
  ): Promise<{
    allowed: boolean;
    remainingRequests: number;
    resetTime: number;
    totalHits: number;
    message?: string;
  }> {
    const config = RATE_LIMITS[limitType];
    if (!config) {
      return { allowed: true, remainingRequests: 0, resetTime: 0, totalHits: 0 };
    }

    const key = config.keyGenerator(request, userId);
    const now = Date.now();
    const resetTime = now + config.windowMs;

    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      entry = { count: 1, resetTime };
      rateLimitStore.set(key, entry);
      return {
        allowed: true,
        remainingRequests: config.maxRequests - 1,
        resetTime: entry.resetTime,
        totalHits: 1
      };
    }

    entry.count++;
    rateLimitStore.set(key, entry);

    const allowed = entry.count <= config.maxRequests;
    const remainingRequests = Math.max(0, config.maxRequests - entry.count);

    if (!allowed) {
      logger.warn('User rate limit exceeded', {
        limitType,
        userId: userId.substring(0, 8) + '***', // Partial masking for privacy
        count: entry.count,
        maxRequests: config.maxRequests,
        resetTime: new Date(entry.resetTime).toISOString()
      });
    }

    return {
      allowed,
      remainingRequests,
      resetTime: entry.resetTime,
      totalHits: entry.count,
      message: !allowed ? config.message : undefined
    };
  }

  /**
   * Record rate limit violation for progressive penalties
   */
  static async recordViolation(
    request: NextRequest,
    limitType: keyof typeof RATE_LIMITS
  ): Promise<void> {
    const ip = getClientIP(request);
    const violationKey = `violations:${ip}`;
    const now = Date.now();
    const resetTime = now + (24 * 60 * 60 * 1000); // 24 hours

    let violationEntry = rateLimitStore.get(violationKey);

    if (!violationEntry || now > violationEntry.resetTime) {
      violationEntry = { count: 1, resetTime };
    } else {
      violationEntry.count++;
    }

    rateLimitStore.set(violationKey, violationEntry);

    // Progressive penalties based on violation count
    if (violationEntry.count >= 5) {
      // Block IP for 1 hour after 5 violations in 24 hours
      this.blockIP(ip, 60 * 60 * 1000); // 1 hour
      
      logger.error('IP blocked due to repeated violations', {
        ip: ip.replace(/\d+\.\d+\.\d+\.\d+/, '***'),
        violationCount: violationEntry.count,
        limitType,
        blockDuration: '1 hour'
      });
    } else if (violationEntry.count >= 3) {
      // Temporary penalty after 3 violations
      const penaltyKey = `penalty:${ip}`;
      rateLimitStore.set(penaltyKey, {
        count: 1,
        resetTime: now + (15 * 60 * 1000) // 15 minutes penalty
      });
      
      logger.warn('IP penalty applied', {
        ip: ip.replace(/\d+\.\d+\.\d+\.\d+/, '***'),
        violationCount: violationEntry.count,
        penaltyDuration: '15 minutes'
      });
    }
  }

  /**
   * Check if IP has active penalty
   */
  static hasPenalty(request: NextRequest): boolean {
    const ip = getClientIP(request);
    const penaltyKey = `penalty:${ip}`;
    const entry = rateLimitStore.get(penaltyKey);
    
    if (!entry) return false;
    
    const now = Date.now();
    if (now > entry.resetTime) {
      rateLimitStore.delete(penaltyKey);
      return false;
    }
    
    return true;
  }

  /**
   * Get user-friendly error response
   */
  static getRateLimitError(
    limitType: keyof typeof RATE_LIMITS,
    retryAfter?: number
  ): {
    error: string;
    message: string;
    retryAfter?: number;
    code: string;
  } {
    const config = RATE_LIMITS[limitType];
    
    return {
      error: 'Rate limit exceeded',
      message: config?.message || 'Too many requests. Please try again later.',
      retryAfter,
      code: `RATE_LIMIT_${limitType}`
    };
  }

  /**
   * Get client IP address (expose getClientIP as static method)
   */
  static getClientIP(request: NextRequest): string {
    return getClientIP(request);
  }
}