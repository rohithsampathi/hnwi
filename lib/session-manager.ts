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

      // Set secure session cookie
      const cookieStore = cookies();
      cookieStore.set('session', token, SESSION_CONFIG);

      // Store user display data in separate cookie (non-sensitive)
      const userDisplay = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        role: user.role
      };

      cookieStore.set('session_user', JSON.stringify(userDisplay), {
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
      const sessionToken = cookieStore.get('session')?.value;

      if (!sessionToken) {
        logger.debug('No session token found');
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
      cookieStore.set('session', newToken, SESSION_CONFIG);

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
      
      // Clear all session-related cookies
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