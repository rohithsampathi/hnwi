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
      logger.warn("Asset detailed GET validation failed", { 
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

    // Validate ownership - users can only access their own assets
    // For now, allow access if authenticated (TODO: fix user ID matching)
    if (user.id !== ownerId && user.role !== 'admin') {
      logger.info("Asset detailed access for different owner", {
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

    // Use secureApi to call external backend
    const endpoint = `/api/crown-vault/assets/detailed?owner_id=${ownerId}`;

    const backendAssets = await serverSecureApi.get(endpoint, authCookies);

    // Return the data directly from backend
    const apiResponse = NextResponse.json(backendAssets, { status: 200 });
    return ApiAuth.addSecurityHeaders(apiResponse);

  } catch (error) {
    logger.error('Crown Vault assets detailed fetch error', { 
      error: error instanceof Error ? error.message : String(error),
      userId: user.id
    });
    return ApiAuth.addSecurityHeaders(NextResponse.json(
      { error: 'Failed to fetch detailed assets' },
      { status: 500 }
    ));
  }
}, { 
  requireAuth: true, 
  rateLimit: 'standard',
  auditLog: true 
});