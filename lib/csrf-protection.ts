// lib/csrf-protection.ts - CSRF Token Implementation

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from './secure-logger';
import { sanitizeLoggingContext } from './security/sanitization';

interface CSRFTokenData {
  token: string;
  timestamp: number;
  userAgent: string;
}

const CSRF_TOKEN_LIFETIME = 60 * 60 * 1000; // 1 hour
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

// Cookie name helper with security prefixes
function getSecureCSRFCookieName(): string {
  if (process.env.NODE_ENV === 'production') {
    // Use __Host- prefix for maximum security in production
    return `__Host-${CSRF_COOKIE_NAME}`;
  } else {
    // Use plain name in development (no __Secure- prefix since secure flag is false)
    return CSRF_COOKIE_NAME;
  }
}

export class CSRFProtection {
  /**
   * Generate a cryptographically secure CSRF token
   */
  static generateToken(userAgent: string = ''): string {
    const timestamp = Date.now();
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const tokenData = `${timestamp}-${userAgent}-${Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('')}`;
    
    // Create a simple hash of the token data
    const encoder = new TextEncoder();
    return btoa(encoder.encode(tokenData).reduce((acc, byte) => acc + String.fromCharCode(byte), ''));
  }

  /**
   * Set CSRF token in cookie
   */
  static setCSRFToken(request: NextRequest): { token: string; cookie: string } {
    const userAgent = request.headers.get('user-agent') || '';
    const token = this.generateToken(userAgent);
    
    const tokenData: CSRFTokenData = {
      token,
      timestamp: Date.now(),
      userAgent
    };
    
    const cookieValue = btoa(JSON.stringify(tokenData));
    
    // Set the cookie with secure prefix
    const cookieStore = cookies();
    const secureCookieName = getSecureCSRFCookieName();
    cookieStore.set(secureCookieName, cookieValue, {
      httpOnly: false, // Must be readable by client-side JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for PWA compatibility
      maxAge: CSRF_TOKEN_LIFETIME / 1000,
      path: '/'
    });
    
    logger.debug('CSRF token generated and set in cookie');
    
    return { token, cookie: cookieValue };
  }

  /**
   * Validate CSRF token from request
   */
  static validateCSRFToken(request: NextRequest): { valid: boolean; error?: string } {
    try {
      // Skip CSRF validation for GET, HEAD, OPTIONS requests
      if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        return { valid: true };
      }

      const secureCookieName = getSecureCSRFCookieName();

      const requestCookies = typeof request.cookies?.get === 'function' ? request.cookies : undefined;

      // Try secure cookie first, fallback to legacy for compatibility
      let csrfCookie = requestCookies?.get(secureCookieName)?.value || requestCookies?.get(CSRF_COOKIE_NAME)?.value;

      if (!csrfCookie) {
        try {
          const headerCookieStore = cookies();
          csrfCookie = headerCookieStore.get(secureCookieName)?.value || headerCookieStore.get(CSRF_COOKIE_NAME)?.value;
        } catch {
          // cookies() is unavailable in edge middleware - ignore
        }
      }
      const csrfHeader = request.headers.get(CSRF_HEADER_NAME);
      
      if (!csrfCookie) {
        const context = sanitizeLoggingContext({
          endpoint: new URL(request.url).pathname,
          method: request.method,
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
        });
        logger.warn('CSRF validation failed - no cookie found', context);
        return { valid: false, error: 'CSRF cookie missing' };
      }
      
      if (!csrfHeader) {
        const context = sanitizeLoggingContext({
          endpoint: new URL(request.url).pathname,
          method: request.method,
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
        });
        logger.warn('CSRF validation failed - no header found', context);
        return { valid: false, error: 'CSRF token missing in header' };
      }

      // Decode and validate cookie data
      let tokenData: CSRFTokenData;
      let isLegacyFormat = false;
      try {
        tokenData = JSON.parse(atob(csrfCookie));
      } catch (e) {
        // Handle legacy format: raw token string (backwards compatibility)
        try {
          // Try to use cookie value as raw token
          isLegacyFormat = true;
          tokenData = {
            token: csrfCookie,
            timestamp: Date.now(), // Assume recent for legacy tokens
            userAgent: request.headers.get('user-agent') || ''
          };
        } catch {
          logger.warn('CSRF validation failed - invalid cookie format');
          return { valid: false, error: 'Invalid CSRF cookie format' };
        }
      }

      // Check token expiry (skip for legacy format since timestamp is synthetic)
      const now = Date.now();
      if (!isLegacyFormat && now - tokenData.timestamp > CSRF_TOKEN_LIFETIME) {
        logger.warn('CSRF validation failed - token expired', {
          tokenAge: now - tokenData.timestamp,
          maxAge: CSRF_TOKEN_LIFETIME
        });
        return { valid: false, error: 'CSRF token expired' };
      }

      // Validate User-Agent hasn't changed (basic anti-hijacking)
      // Skip for legacy format since we don't have original userAgent
      const currentUserAgent = request.headers.get('user-agent') || '';
      if (!isLegacyFormat && tokenData.userAgent !== currentUserAgent) {
        const context = sanitizeLoggingContext({
          endpoint: new URL(request.url).pathname,
          userAgent: currentUserAgent,
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
        });
        logger.warn('CSRF validation failed - user agent mismatch', {
          ...context,
          tokenUserAgent: tokenData.userAgent?.substring(0, 20) + '...'
        });
        return { valid: false, error: 'CSRF token invalid - security check failed' };
      }

      // Validate the token matches
      if (tokenData.token !== csrfHeader) {
        logger.warn('CSRF validation failed - token mismatch');
        return { valid: false, error: 'CSRF token mismatch' };
      }

      if (isLegacyFormat) {
        logger.info('CSRF validation successful (legacy format - consider refreshing token)');
      } else {
        logger.debug('CSRF validation successful');
      }
      return { valid: true };
      
    } catch (error) {
      logger.error('CSRF validation error', {
        error: error instanceof Error ? error.message : String(error)
      });
      return { valid: false, error: 'CSRF validation error' };
    }
  }

  /**
   * Middleware wrapper for CSRF protection
   */
  static withCSRFProtection<T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      // For state-changing operations (POST, PUT, DELETE, PATCH)
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        const validation = this.validateCSRFToken(request);
        
        if (!validation.valid) {
          const context = sanitizeLoggingContext({
            method: request.method,
            endpoint: new URL(request.url).pathname,
            error: validation.error,
            userAgent: request.headers.get('user-agent'),
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
          });
          logger.warn('CSRF protection blocked request', context);
          
          return NextResponse.json(
            { 
              error: 'CSRF validation failed',
              code: 'CSRF_TOKEN_INVALID',
              timestamp: new Date().toISOString()
            },
            { status: 403 }
          );
        }
      }
      
      return handler(request, ...args);
    };
  }

  /**
   * Get CSRF token for client-side usage
   */
  static getCSRFTokenForClient(request: NextRequest): string | null {
    try {
      const cookieStore = cookies();
      const secureCookieName = getSecureCSRFCookieName();
      // Try secure cookie first, fallback to legacy for compatibility
      const csrfCookie = cookieStore.get(secureCookieName)?.value || cookieStore.get(CSRF_COOKIE_NAME)?.value;
      
      if (!csrfCookie) {
        return null;
      }
      
      const tokenData: CSRFTokenData = JSON.parse(atob(csrfCookie));
      
      // Check if token is still valid
      const now = Date.now();
      if (now - tokenData.timestamp > CSRF_TOKEN_LIFETIME) {
        return null;
      }
      
      return tokenData.token;
    } catch (error) {
      logger.error('Error retrieving CSRF token for client', {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Generate new CSRF token for API response
   */
  static refreshCSRFToken(request: NextRequest): { token: string; expires: number } {
    const { token } = this.setCSRFToken(request);
    const expires = Date.now() + CSRF_TOKEN_LIFETIME;
    
    return { token, expires };
  }

  /**
   * Clear CSRF token (on logout)
   */
  static clearCSRFToken(): void {
    try {
      const cookieStore = cookies();
      const secureCookieName = getSecureCSRFCookieName();
      // Clear both secure and legacy cookies
      cookieStore.delete(secureCookieName);
      cookieStore.delete(CSRF_COOKIE_NAME);
      logger.debug('CSRF token cleared');
    } catch (error) {
      logger.error('Error clearing CSRF token', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Add CSRF token to response headers for client-side access
   */
  static addCSRFHeaders(request: NextRequest, response: NextResponse): NextResponse {
    const token = this.getCSRFTokenForClient(request);
    
    if (token) {
      response.headers.set('X-CSRF-Token', token);
      response.headers.set('X-CSRF-Token-Expires', (Date.now() + CSRF_TOKEN_LIFETIME).toString());
    }
    
    return response;
  }
}
