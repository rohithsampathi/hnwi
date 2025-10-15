// app/api/auth/session/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { handleLogin } from '@/lib/auth-actions'
import { cookies } from 'next/headers'
import { logger } from '@/lib/secure-logger'
import { CSRFProtection } from '@/lib/csrf-protection'

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

// GET handler for retrieving the session
export async function GET() {
  try {
    // Read backend cookies (FastAPI sets these directly)
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;

    // Log what cookies we're receiving
    const allCookies = cookieStore.getAll();
    logger.info('Session check - cookies received', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      cookieCount: allCookies.length,
      accessTokenLength: accessToken?.length || 0
    });

    // Only check backend cookies - no frontend session management
    if (!accessToken) {
      logger.info('No access_token cookie found');
      return NextResponse.json({ user: null }, { status: 200 });
    }
    
    // We have an access token - fetch user from backend or decode JWT
    try {
      // Try to decode JWT to get user data
      if (accessToken.includes('.')) {
        try {
          const parts = accessToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

            // Extract user data from JWT payload
            const user = {
              id: payload.user_id || payload.userId || payload.id || payload.sub,
              user_id: payload.user_id || payload.userId || payload.id || payload.sub,
              email: payload.email,
              firstName: payload.firstName || payload.first_name || payload.name?.split(' ')[0],
              lastName: payload.lastName || payload.last_name || payload.name?.split(' ').slice(1).join(' '),
              role: payload.role || 'user',
              ...payload // Include any additional fields
            };

            return NextResponse.json({ user });
          }
        } catch (jwtError) {
          logger.error('Error decoding JWT token', { error: jwtError });
        }
      }

      // If we can't decode the JWT, fetch user from backend
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
          if (userData) {
            return NextResponse.json({ user: userData });
          }
        }
      } catch (fetchError) {
        logger.error('Error fetching user from backend', { error: fetchError });
      }

      // If we can't get user data, return null
      return NextResponse.json({ user: null }, { status: 200 });
    } catch (error) {
      logger.error('Error in session handler', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ user: null }, { status: 200 });
    }
    
    // If no valid session found, return null (not demo user)
    return NextResponse.json({ user: null }, { status: 200 });
    
  } catch (error) {
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

export const POST = CSRFProtection.withCSRFProtection(handlePost);
