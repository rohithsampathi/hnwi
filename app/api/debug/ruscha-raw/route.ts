// app/api/debug/ruscha-raw/route.ts
// Secure debug endpoint using secureApi layer

import { NextRequest, NextResponse } from 'next/server'
import { secureApi } from '@/lib/secure-api'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Only allow in development mode for security
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        success: false,
        error: 'Debug endpoint not available in production'
      }, { status: 403 })
    }

    // For debug purposes, use the test user ID
    const userId = '59363d04-eb97-4224-94cf-16ca0d4f746e'
    
    // Use secure API layer - NO direct URL exposure
    const data = await secureApi.get(`/api/hnwi/intelligence/dashboard/${userId}`, false)
    
    // Extract ruscha intelligence data safely
    const ruschaData = data?.intelligence?.ruscha_intelligence?.data
    
    return NextResponse.json({
      success: true,
      ruschaData: ruschaData,
      hasRuschaData: !!ruschaData,
      userId: userId
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Debug request failed'
    }, { status: 500 })
  }
}