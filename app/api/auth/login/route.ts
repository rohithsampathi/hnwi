// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { handleLogin } from '@/lib/auth-actions'

export async function POST(request: Request) {
  try {
    console.log("Login API endpoint called");
    const body = await request.json();
    console.log("Login request body:", JSON.stringify(body));
    
    const result = await handleLogin(body);
    console.log("Login result:", JSON.stringify(result, null, 2));
    
    if (!result.success) {
      console.log("Login failed with error:", result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Login failed' },
        { status: 401 }
      )
    }

    return NextResponse.json(result);
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