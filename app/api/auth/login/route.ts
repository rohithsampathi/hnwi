// app/api/auth/login/route.ts

import { NextResponse } from 'next/server'
import { handleLogin } from '@/lib/auth-actions'

export async function POST(request: Request) {
  try {
    console.log("Login API endpoint called");

    // Parse the request body
    const body = await request.json();
    
    console.log("Login request body:", JSON.stringify({
      email: body.email,
      password: body.password ? '********' : undefined // Log email but mask password
    }));

    // Call the updated handleLogin function
    const result = await handleLogin(body);

    // Log the result (without sensitive data)
    console.log("Login result:", JSON.stringify({
      success: result.success,
      userId: result.user?.id,
      error: result.error,
      hasToken: !!result.token
    }, null, 2));

    // Return appropriate response based on result
    if (!result.success) {
      console.log("Login failed with error:", result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Login failed' },
        { status: 401 }
      )
    }

    // Set the session cookie on the response
    const response = NextResponse.json(result);
    
    // Response cookies are handled by handleLogin now
    // We're just returning the result with the token
    
    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed'
      },
      { status: 500 }
    )
  }
}