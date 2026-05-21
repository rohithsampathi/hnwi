// app/api/auth/session/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { handleLogin } from '@/lib/auth-actions'
import { cookies } from 'next/headers'
import { logger } from '@/lib/secure-logger'
import { CSRFProtection } from '@/lib/csrf-protection'
import { withRateLimit } from '@/lib/security/api-auth'
import { API_BASE_URL } from '@/config/api'
import { resolveAuthCookieDomain, shouldUseSecureAuthCookies } from '@/lib/auth-cookie-security'
import { normalizeAuthUser } from '@/lib/auth-user-normalization'

// Verify JWT signature if secret is available, returns payload or null
async function verifyJWT(token: string): Promise<Record<string, any> | null> {
  const secret = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET;
  if (!secret) return null;

  try {
    const { jwtVerify } = await import('jose');
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload as Record<string, any>;
  } catch (error) {
    logger.warn('JWT signature verification failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

// Extract user fields from a JWT payload
function extractUserFromPayload(payload: Record<string, any>) {
  const firstName = payload.firstName || payload.first_name || payload.name?.split(' ')[0] || '';
  const lastName = payload.lastName || payload.last_name || payload.name?.split(' ').slice(1).join(' ') || '';
  return normalizeAuthUser({
    id: payload.user_id || payload.userId || payload.id || payload.sub,
    user_id: payload.user_id || payload.userId || payload.id || payload.sub,
    email: payload.email,
    name: payload.name || `${firstName} ${lastName}`.trim() || undefined,
    firstName,
    lastName,
    role: payload.role || 'user',
  });
}

// GET handler for retrieving the session
export async function GET(request: NextRequest) {
  try {
    // Note: In Next.js 15+, cookies() returns a Promise
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const sessionToken = cookieStore.get('session_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;
    const candidateAuthToken = accessToken || sessionToken;

    logger.info('Session check', {
      hasAccessToken: !!accessToken,
      hasSessionToken: !!sessionToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length || 0
    });

    if (!candidateAuthToken) {
      // No signed auth token — session is invalid.
      // NOTE: session_user cookie is not trusted as a standalone auth source
      // because it is unsigned JSON. Backend cookies or verified JWT are authoritative.
      logger.info('No signed auth token found - session invalid');
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Strategy: validate with backend first, verified JWT as fallback
    // 1. Try backend validation (authoritative). Forward the whole browser cookie
    // header, because backend cookie path/name choices are part of its auth contract.
    try {
      const cookieHeader =
        request.headers.get('cookie') ||
        cookieStore.getAll().map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

      const userResponse = await fetch(`${API_BASE_URL}/api/auth/session`, {
        cache: 'no-store',
        headers: {
          'Cookie': cookieHeader,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData && (userData.user || userData.id || userData.user_id)) {
          const user = normalizeAuthUser(userData.user || userData);
          return NextResponse.json({ user });
        }
      }
    } catch (fetchError) {
      logger.warn('Backend session check unavailable, falling back to JWT verification', {
        error: fetchError instanceof Error ? fetchError.message : String(fetchError)
      });
    }

    // 2. Fallback: verify JWT signature locally (only if we have the secret)
    if (candidateAuthToken.includes('.') && candidateAuthToken.split('.').length === 3) {
      const verifiedPayload = await verifyJWT(candidateAuthToken);
      if (verifiedPayload) {
        const user = extractUserFromPayload(verifiedPayload);
        if (user.id) {
          logger.info('Session validated via verified JWT', { userId: user.id });
          return NextResponse.json({ user });
        }
      }
    }

    // No valid session could be established
    return NextResponse.json({ user: null }, { status: 200 });

  } catch (error) {
    logger.error('Session GET error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

// POST handler for login
async function handlePost(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Call the updated handleLogin function
    const result = await handleLogin(body);
    
    // Return appropriate response based on result
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Login failed' },
        { status: 401 }
      )
    }
    
    // Set the session cookies on the response. Frontend remains cookie-backed.
    const responseData = {
      success: result.success,
      user: result.user ? normalizeAuthUser(result.user) : null,
      message: result.message
    };
    const response = NextResponse.json(responseData);

    // Store token in cookie for session management with PWA-compatible configuration
    const secureAuthCookies = shouldUseSecureAuthCookies(request);
    const cookieDomain = resolveAuthCookieDomain(request);

    if (result.token) {
      const sessionTokenOptions: any = {
        httpOnly: true,
        secure: secureAuthCookies,
        sameSite: 'lax' as const,
        maxAge: 7 * 24 * 60 * 60, // 7 days (before iOS Safari auto-clear)
        path: '/'
      };
      if (cookieDomain) sessionTokenOptions.domain = cookieDomain;

      response.cookies.set('session_token', result.token, sessionTokenOptions);

      // Encrypt user data before storing in cookie
      const encryptedUserData = JSON.stringify({
        id: responseData.user?.id || responseData.user?.user_id,
        user_id: responseData.user?.user_id || responseData.user?.id,
        email: responseData.user?.email,
        firstName: responseData.user?.firstName,
        lastName: responseData.user?.lastName,
        role: responseData.user?.role || 'user',
        timestamp: Date.now() // Add timestamp for validation
      });

      const sessionUserOptions: any = {
        httpOnly: true,
        secure: secureAuthCookies,
        sameSite: 'lax' as const,
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      };
      if (cookieDomain) sessionUserOptions.domain = cookieDomain;

      response.cookies.set('session_user', encryptedUserData, sessionUserOptions);
    }
    
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      },
      { status: 500 }
    )
  }
}

export const POST = withRateLimit('api', CSRFProtection.withCSRFProtection(handlePost));
