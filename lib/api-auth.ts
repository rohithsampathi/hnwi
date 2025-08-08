// lib/api-auth.ts - API Authentication Middleware

import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from './session-manager';
import { logger } from './secure-logger';
import { RateLimiter } from './rate-limiter';

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

interface ApiAuthOptions {
  requireAuth?: boolean;
  requiredRole?: string;
  rateLimit?: 'standard' | 'strict' | 'none';
  auditLog?: boolean;
}

// Default authentication options
const DEFAULT_OPTIONS: ApiAuthOptions = {
  requireAuth: true,
  rateLimit: 'standard',
  auditLog: true
};

export class ApiAuth {
  /**
   * Middleware to authenticate and authorize API requests
   */
  static async validateRequest(
    request: NextRequest,
    options: ApiAuthOptions = {}
  ): Promise<{
    success: boolean;
    user?: { id: string; email: string; role: string };
    error?: string;
    status?: number;
  }> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const startTime = Date.now();
    const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
    
    try {
      // Rate limiting check
      if (opts.rateLimit !== 'none') {
        const rateLimitResult = await RateLimiter.checkLimit(
          request,
          opts.rateLimit === 'strict' ? 'SENSITIVE' : 'API'
        );
        
        if (!rateLimitResult.allowed) {
          logger.warn('API rate limit exceeded', {
            requestId,
            ip: request.ip,
            userAgent: request.headers.get('user-agent'),
            endpoint: new URL(request.url).pathname
          });
          
          return {
            success: false,
            error: 'Rate limit exceeded',
            status: 429
          };
        }
      }

      // Authentication check
      if (opts.requireAuth) {
        const sessionData = await SessionManager.validateSession();
        
        if (!sessionData) {
          logger.warn('API authentication failed - no valid session', {
            requestId,
            endpoint: new URL(request.url).pathname,
            userAgent: request.headers.get('user-agent')
          });
          
          return {
            success: false,
            error: 'Authentication required',
            status: 401
          };
        }

        const user = {
          id: sessionData.userId,
          email: sessionData.email,
          role: sessionData.role
        };

        // Role-based authorization
        if (opts.requiredRole) {
          if (sessionData.role !== opts.requiredRole && sessionData.role !== 'admin') {
            logger.warn('API authorization failed - insufficient permissions', {
              requestId,
              userId: sessionData.userId,
              userRole: sessionData.role,
              requiredRole: opts.requiredRole,
              endpoint: new URL(request.url).pathname
            });
            
            return {
              success: false,
              error: 'Insufficient permissions',
              status: 403
            };
          }
        }

        // Audit logging for authenticated requests
        if (opts.auditLog) {
          logger.info('API request authenticated', {
            requestId,
            userId: sessionData.userId,
            endpoint: new URL(request.url).pathname,
            method: request.method,
            userAgent: request.headers.get('user-agent'),
            duration: Date.now() - startTime
          });
        }

        return {
          success: true,
          user
        };
      }

      // No authentication required
      return { success: true };
      
    } catch (error) {
      logger.error('API authentication error', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
        endpoint: new URL(request.url).pathname,
        method: request.method
      });
      
      return {
        success: false,
        error: 'Authentication error',
        status: 500
      };
    }
  }

  /**
   * Helper to create authenticated API route handler
   */
  static withAuth<T extends any[]>(
    handler: (request: NextRequest, user: { id: string; email: string; role: string }, ...args: T) => Promise<NextResponse>,
    options: ApiAuthOptions = {}
  ) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      const authResult = await this.validateRequest(request, options);
      
      if (!authResult.success) {
        return NextResponse.json(
          { 
            error: authResult.error,
            timestamp: new Date().toISOString(),
            requestId: request.headers.get('x-request-id') || crypto.randomUUID()
          },
          { status: authResult.status || 500 }
        );
      }
      
      return handler(request, authResult.user!, ...args);
    };
  }

  /**
   * Helper for protecting routes that require specific user ownership
   */
  static async validateOwnership(
    userId: string,
    resourceOwnerId: string
  ): Promise<boolean> {
    // Allow if user owns the resource or is admin
    const sessionData = await SessionManager.validateSession();
    
    if (!sessionData) {
      return false;
    }
    
    return (
      sessionData.userId === resourceOwnerId ||
      sessionData.role === 'admin'
    );
  }

  /**
   * Validate request size to prevent DoS attacks
   */
  static validateRequestSize(request: NextRequest, maxSize: number = 1024 * 1024): boolean {
    const contentLength = request.headers.get('content-length');
    
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > maxSize) {
        logger.warn('Request size too large', {
          size,
          maxSize,
          endpoint: new URL(request.url).pathname
        });
        return false;
      }
    }
    
    return true;
  }

  /**
   * Extract and validate IP address for security logging
   */
  static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (real) {
      return real.trim();
    }
    
    return 'unknown';
  }

  /**
   * Security headers for API responses
   */
  static addSecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Add request ID for tracing
    const requestId = crypto.randomUUID();
    response.headers.set('X-Request-ID', requestId);
    
    return response;
  }
}