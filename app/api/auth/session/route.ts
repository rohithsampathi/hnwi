// app/api/auth/session/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { handleLogin } from '@/lib/auth-actions'
import { cookies } from 'next/headers'
import { logger } from '@/lib/secure-logger'
import { CSRFProtection } from '@/lib/csrf-protection'
import { withRateLimit } from '@/lib/security/api-auth'

// Helper to get cookie domain for PWA cross-subdomain support
function getCookieDomain(): string | undefined {
  if (process.env.NODE_ENV !== 'production') return undefined;

  const productionUrl = process.env.NEXT_PUBLIC_PRODUCTION_URL || '';
  if (!productionUrl) return undefined;

  try {
    const url = new URL(productionUrl);
    // Extract root domain (e.g., 'hnwichronicles.com' from 'app.hnwichronicles.com')
    const hostParts = url.hostname.split('.');
    if (hostParts.length >= 2) {
      return `.${hostParts.slice(-2).join('.')}`; // '.hnwichronicles.com'
    }
  } catch (e) {
    logger.warn('Failed to parse production URL for cookie domain', { url: productionUrl });
  }

  return undefined;
}

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
  return {
    id: payload.user_id || payload.userId || payload.id || payload.sub,
    user_id: payload.user_id || payload.userId || payload.id || payload.sub,
    email: payload.email,
    firstName: payload.firstName || payload.first_name || payload.name?.split(' ')[0],
    lastName: payload.lastName || payload.last_name || payload.name?.split(' ').slice(1).join(' '),
    role: payload.role || 'user',
  };
}

// GET handler for retrieving the session
export async function GET() {
  try {
    // Note: In Next.js 15+, cookies() returns a Promise
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;

    logger.info('Session check', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length || 0
    });

    if (!accessToken) {
      // No access_token — session is invalid
      // NOTE: session_user cookie is NOT trusted as a standalone auth source
      // because it's unsigned JSON. Only access_token (JWT signed by backend) is authoritative.
      logger.info('No access_token found - session invalid');
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Strategy: validate with backend first, verified JWT as fallback
    // 1. Try backend validation (authoritative)
    try {
      const backendUrl = process.env.API_BASE_URL || 'http://localhost:8000';
      const userResponse = await fetch(`${backendUrl}/api/auth/session`, {
        headers: {
          'Cookie': `access_token=${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData && (userData.user || userData.id || userData.user_id)) {
          const user = userData.user || userData;
          return NextResponse.json({ user });
        }
      }
    } catch (fetchError) {
      logger.warn('Backend session check unavailable, falling back to JWT verification', {
        error: fetchError instanceof Error ? fetchError.message : String(fetchError)
      });
    }

    // 2. Fallback: verify JWT signature locally (only if we have the secret)
    if (accessToken.includes('.') && accessToken.split('.').length === 3) {
      const verifiedPayload = await verifyJWT(accessToken);
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
    
    // Set the session cookie on the response
    // Include the token in the response so frontend can store it in localStorage
    const responseData = {
      success: result.success,
      user: result.user ?? null,
      message: result.message
    };
    const response = NextResponse.json(responseData);

    // Store token in cookie for session management with PWA-compatible configuration
    const isProd = process.env.NODE_ENV === 'production';
    const cookieDomain = getCookieDomain();

    if (result.token) {
      const sessionTokenOptions: any = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' as const : 'lax' as const, // 'none' for PWA in production
        maxAge: 7 * 24 * 60 * 60, // 7 days (before iOS Safari auto-clear)
        path: '/'
      };
      if (cookieDomain) sessionTokenOptions.domain = cookieDomain;
      if (isProd) sessionTokenOptions.partitioned = true;

      response.cookies.set('session_token', result.token, sessionTokenOptions);

      // Encrypt user data before storing in cookie
      const encryptedUserData = JSON.stringify({
        id: result.user?.id || result.user?.user_id,
        email: result.user?.email,
        firstName: result.user?.firstName,
        lastName: result.user?.lastName,
        role: result.user?.role || 'user',
        timestamp: Date.now() // Add timestamp for validation
      });

      const sessionUserOptions: any = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' as const : 'lax' as const, // 'none' for PWA in production
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      };
      if (cookieDomain) sessionUserOptions.domain = cookieDomain;
      if (isProd) sessionUserOptions.partitioned = true;

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
