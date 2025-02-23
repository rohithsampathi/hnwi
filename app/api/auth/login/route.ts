// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { handleLogin } from '@/lib/auth-actions'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await handleLogin(body)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Login failed' },
        { status: 401 }
      )
    }

    return NextResponse.json(result)
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