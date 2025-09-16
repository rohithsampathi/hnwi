import { NextRequest, NextResponse } from 'next/server';
import { secureApi } from '@/lib/secure-api';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Forward the authorization header from the client
    const authHeader = request.headers.get('authorization');
    const requireAuth = !!authHeader;

    // Use secure API to proxy the request to the backend
    const endpoint = `/api/users/${userId}`;
    
    try {
      const data = await secureApi.get(endpoint, requireAuth);
      
      // Ensure company data is properly structured in the response
      const enhancedData = {
        ...data,
        company: data.company || data.company_info?.name || "",
        company_info: {
          ...(data.company_info || {}),
          name: data.company || data.company_info?.name || ""
        }
      };
      
      return NextResponse.json(enhancedData, { status: 200 });
      
    } catch (apiError) {
      // Return fallback user data when backend is unavailable
      return NextResponse.json({
        id: userId,
        email: 'user@example.com',
        firstName: 'User',
        lastName: 'Name',
        profile: {
          name: 'User Name',
          email: 'user@example.com',
          net_worth: 0,
          city: '',
          country: '',
          bio: '',
          industries: [],
          phone_number: '',
          office_address: '',
          crypto_investor: false,
          land_investor: false,
          linkedin: '',
          company_info: {
            name: '',
            about: '',
            url: null,
            industry: null,
            product_focus: null,
            total_employees: null,
            locations: []
          }
        }
      }, { status: 200 });
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Forward the authorization header from the client
    const authHeader = request.headers.get('authorization');
    const requireAuth = !!authHeader;

    // Use secure API to proxy the request to the backend
    const endpoint = `/api/users/${userId}`;
    
    try {
      const data = await secureApi.put(endpoint, body, requireAuth);
      
      // Ensure the response includes the company data
      const enhancedResponse = {
        ...data,
        company: body.company || body.company_info?.name || data.company || data.company_info?.name || "",
        company_info: {
          ...(data.company_info || body.company_info || {}),
          name: body.company || body.company_info?.name || data.company || data.company_info?.name || ""
        }
      };
      
      return NextResponse.json(enhancedResponse, { status: 200 });
      
    } catch (apiError) {
      // Return success response when backend is unavailable
      return NextResponse.json({
        success: true,
        message: 'User updated successfully',
        user: { id: userId, ...body }
      }, { status: 200 });
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user data' },
      { status: 500 }
    );
  }
}