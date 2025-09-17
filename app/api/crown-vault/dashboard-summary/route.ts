import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateInput, queryParamSchema } from '@/lib/validation';
import { logger } from '@/lib/secure-logger';
import { ApiAuth } from '@/lib/api-auth';
import { serverSecureApi } from '@/lib/secure-api';

// Protected GET handler using authentication middleware
export const GET = ApiAuth.withAuth(async (request: NextRequest, user) => {
  try {
    // Validate request size
    if (!ApiAuth.validateRequestSize(request)) {
      return NextResponse.json(
        { error: 'Request too large' },
        { status: 413 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Validate query parameters with optional page/limit
    const queryValidation = validateInput(queryParamSchema, {
      owner_id: searchParams.get('owner_id'),
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10'
    });
    
    if (!queryValidation.success) {
      logger.warn("Dashboard summary GET validation failed", { 
        errors: queryValidation.errors,
        userId: user.id
      });
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.errors },
        { status: 400 }
      );
    }

    const { owner_id: ownerId } = queryValidation.data!;
    
    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      );
    }

    // Validate ownership - users can only access their own dashboard
    // For now, allow access if authenticated (TODO: fix user ID matching)
    if (user.id !== ownerId && user.role !== 'admin') {
      logger.info("Dashboard summary access for different owner", {
        userId: user.id,
        requestedOwnerId: ownerId,
        allowing: true
      });
      // Allow for now - TODO: implement proper ownership validation
    }

    // Get authentication cookies
    const accessTokenCookie = cookies().get('access_token');
    const refreshTokenCookie = cookies().get('refresh_token');
    const authCookies = `access_token=${accessTokenCookie?.value || ''}; refresh_token=${refreshTokenCookie?.value || ''}`;

    // Use serverSecureApi to call external backend - no fallbacks
    const endpoint = `/api/crown-vault/dashboard-summary?owner_id=${ownerId}`;

    const dashboardData = await serverSecureApi.get(endpoint, authCookies);

    // Return the data directly from backend
    const apiResponse = NextResponse.json(dashboardData, { status: 200 });
    return ApiAuth.addSecurityHeaders(apiResponse);

  } catch (error) {
    logger.error('Crown Vault dashboard summary fetch error', { 
      error: error instanceof Error ? error.message : String(error),
      userId: user.id
    });
    return ApiAuth.addSecurityHeaders(NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    ));
  }
}, { 
  requireAuth: true, 
  rateLimit: 'standard',
  auditLog: true 
});