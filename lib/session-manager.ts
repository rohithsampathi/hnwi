// lib/session-manager.ts - Enhanced session management with security features

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { logger } from './secure-logger';

interface SessionData {
  userId: string;
  email: string;
  role: string;
  iat: number; // issued at
  exp: number; // expires at
  sessionId: string; // unique session identifier
}

interface SessionConfig {
  maxAge: number; // in seconds
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  httpOnly: boolean;
  path: string;
}

const SESSION_CONFIG: SessionConfig = {
  maxAge: 24 * 60 * 60, // 24 hours
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  httpOnly: true,
  path: '/'
};

// Cookie name helper with security prefixes
function getSecureCookieName(baseName: string): string {
  if (process.env.NODE_ENV === 'production') {
    // Use __Host- prefix for maximum security in production
    // Requires secure, path=/, no domain, httpOnly
    return `__Host-${baseName}`;
  } else {
    // Use __Secure- prefix for development (allows localhost)
    // Requires secure flag (even though it's false in dev, the name provides intent)
    return `__Secure-${baseName}`;
  }
}

// Get JWT secret with validation
function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  
  return new TextEncoder().encode(secret);
}

// Generate cryptographically secure session ID
function generateSessionId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export class SessionManager {
  // Create a new session
  static async createSession(user: { 
    id: string; 
    email: string; 
    role: string;
    firstName?: string;
    lastName?: string;
  }): Promise<string> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const sessionId = generateSessionId();
      
      const sessionData: SessionData = {
        userId: user.id,
        email: user.email,
        role: user.role,
        iat: now,
        exp: now + SESSION_CONFIG.maxAge,
        sessionId
      };

      const token = await new SignJWT(sessionData)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_CONFIG.maxAge}s`)
        .sign(getJWTSecret());

      // Set secure session cookie with security prefix
      const cookieStore = cookies();
      const sessionCookieName = getSecureCookieName('session');
      cookieStore.set(sessionCookieName, token, SESSION_CONFIG);

      // Store user display data in separate cookie (non-sensitive)
      const userDisplay = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        role: user.role
      };

      const userCookieName = getSecureCookieName('session_user');
      cookieStore.set(userCookieName, JSON.stringify(userDisplay), {
        ...SESSION_CONFIG,
        httpOnly: false // Allow client-side access for display data
      });

      logger.info('Session created', { 
        userId: user.id, 
        email: user.email,
        sessionId: sessionId.substring(0, 8) + '...' // Log partial session ID
      });

      return token;
    } catch (error) {
      logger.error('Failed to create session', { 
        error: error instanceof Error ? error.message : String(error),
        userId: user.id
      });
      throw new Error('Session creation failed');
    }
  }

  // Validate and refresh session
  static async validateSession(): Promise<SessionData | null> {
    try {
      const cookieStore = cookies();
      
      // Debug: Log all available cookies
      const allCookies = Array.from(cookieStore.getAll().map(cookie => cookie.name)).join(', ');
      logger.debug('Available cookies:', { cookies: allCookies });
      
      // Check for session_token cookie (used by current auth system)
      let sessionToken = cookieStore.get('session_token')?.value;
      logger.debug('session_token cookie:', { found: !!sessionToken });
      
      // Fallback to traditional session cookie
      if (!sessionToken) {
        sessionToken = cookieStore.get('session')?.value;
        logger.debug('session cookie:', { found: !!sessionToken });
      }
      
      // Fallback to secure cookie name (for compatibility)
      if (!sessionToken) {
        const sessionCookieName = getSecureCookieName('session');
        sessionToken = cookieStore.get(sessionCookieName)?.value;
        logger.debug('secure session cookie:', { found: !!sessionToken, cookieName: sessionCookieName });
      }

      if (!sessionToken) {
        // Try to get session data from session_user cookie (JSON format)
        const sessionUserCookie = cookieStore.get('session_user')?.value;
        logger.debug('session_user cookie:', { found: !!sessionUserCookie });
        
        if (sessionUserCookie) {
          try {
            const userData = JSON.parse(sessionUserCookie);
            logger.debug('Successfully parsed session_user data:', { userId: userData.id, email: userData.email });
            
            // Convert to SessionData format
            return {
              userId: userData.id,
              email: userData.email,
              role: userData.role || 'user',
              iat: Math.floor((userData.timestamp || Date.now()) / 1000),
              exp: Math.floor((userData.timestamp || Date.now()) / 1000) + SESSION_CONFIG.maxAge,
              sessionId: `user-${userData.id}`
            };
          } catch (error) {
            logger.debug('Failed to parse session_user cookie', { error });
          }
        }
        
        logger.debug('No valid session found - all methods exhausted');
        return null;
      }

      const { payload } = await jwtVerify(sessionToken, getJWTSecret());
      
      // Handle both custom SessionData format and standard JWT format
      let sessionData: SessionData;
      
      if (payload.sub && !payload.userId) {
        // Standard JWT format - convert to SessionData format
        sessionData = {
          userId: payload.sub as string,
          email: payload.email as string || '',
          role: payload.role as string || 'user',
          iat: payload.iat as number || Math.floor(Date.now() / 1000),
          exp: payload.exp as number,
          sessionId: payload.sessionId as string || 'legacy'
        };
      } else {
        // Custom SessionData format
        sessionData = payload as unknown as SessionData;
      }

      // Check if session is expired (additional check beyond JWT expiry)
      const now = Math.floor(Date.now() / 1000);
      if (sessionData.exp < now) {
        logger.warn('Session expired', { 
          userId: sessionData.userId,
          expiredAt: new Date(sessionData.exp * 1000).toISOString()
        });
        await this.destroySession();
        return null;
      }

      // Check for session timeout (24 hours max) - only if iat is available
      if (sessionData.iat) {
        const sessionAge = now - sessionData.iat;
        if (sessionAge > SESSION_CONFIG.maxAge) {
          logger.warn('Session timeout exceeded', { 
            userId: sessionData.userId,
            sessionAge: sessionAge
          });
          await this.destroySession();
          return null;
        }
      }

      logger.debug('Session validated', { 
        userId: sessionData.userId,
        sessionId: sessionData.sessionId?.substring(0, 8) + '...'
      });

      return sessionData;
    } catch (error) {
      logger.error('Session validation failed', { 
        error: error instanceof Error ? error.message : String(error)
      });
      await this.destroySession();
      return null;
    }
  }

  // Refresh session (extend expiry)
  static async refreshSession(sessionData: SessionData): Promise<string | null> {
    try {
      const now = Math.floor(Date.now() / 1000);
      
      // Only refresh if session is less than 1 hour from expiry
      const timeUntilExpiry = sessionData.exp - now;
      if (timeUntilExpiry > 3600) { // 1 hour
        return null; // No need to refresh yet
      }

      const newSessionData: SessionData = {
        ...sessionData,
        iat: now,
        exp: now + SESSION_CONFIG.maxAge,
        sessionId: generateSessionId() // New session ID for security
      };

      const newToken = await new SignJWT(newSessionData)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_CONFIG.maxAge}s`)
        .sign(getJWTSecret());

      // Update session cookie
      const cookieStore = cookies();
      const sessionCookieName = getSecureCookieName('session');
      cookieStore.set(sessionCookieName, newToken, SESSION_CONFIG);

      logger.info('Session refreshed', { 
        userId: sessionData.userId,
        oldSessionId: sessionData.sessionId?.substring(0, 8) + '...',
        newSessionId: newSessionData.sessionId.substring(0, 8) + '...'
      });

      return newToken;
    } catch (error) {
      logger.error('Session refresh failed', { 
        error: error instanceof Error ? error.message : String(error),
        userId: sessionData.userId
      });
      await this.destroySession();
      return null;
    }
  }

  // Destroy session (logout)
  static async destroySession(): Promise<void> {
    try {
      const cookieStore = cookies();
      
      // Clear all session-related cookies with secure prefixes
      const sessionCookieName = getSecureCookieName('session');
      const userCookieName = getSecureCookieName('session_user');
      
      cookieStore.delete(sessionCookieName);
      cookieStore.delete(userCookieName);
      
      // Also clear legacy cookies without prefixes for backward compatibility
      cookieStore.delete('session');
      cookieStore.delete('session_user');
      cookieStore.delete('session_token'); // Legacy cookie

      logger.info('Session destroyed');
    } catch (error) {
      logger.error('Failed to destroy session', { 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // Get current user from session
  static async getCurrentUser(): Promise<{
    id: string;
    email: string;
    role: string;
  } | null> {
    const sessionData = await this.validateSession();
    
    if (!sessionData) {
      return null;
    }

    return {
      id: sessionData.userId,
      email: sessionData.email,
      role: sessionData.role
    };
  }

  // Check if user has specific role
  static async hasRole(requiredRole: string): Promise<boolean> {
    const sessionData = await this.validateSession();
    
    if (!sessionData) {
      return false;
    }

    return sessionData.role === requiredRole || sessionData.role === 'admin';
  }

  // Middleware helper for protecting routes
  static async requireAuth(): Promise<SessionData> {
    const sessionData = await this.validateSession();
    
    if (!sessionData) {
      throw new Error('Authentication required');
    }

    return sessionData;
  }
}