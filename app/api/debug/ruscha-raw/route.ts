// app/api/debug/ruscha-raw/route.ts
// Debug endpoint to show raw ruscha intelligence data

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // For debug purposes, use the test user ID
    const userId = '59363d04-eb97-4224-94cf-16ca0d4f746e'
    
    console.log('🔍 Fetching raw intelligence data for user:', userId)
    
    // Call the backend API directly (bypassing authentication for debug)
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.hnwi-chronicles.com'
    const apiUrl = `${backendUrl}/api/hnwi/intelligence/dashboard/${userId}`
    
    console.log('🔍 Calling backend URL:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HNWI-Chronicles-Debug/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    console.log('🔍 Raw Backend Response:', data)
    
    // Extract ruscha intelligence data
    const ruschaData = data?.intelligence?.ruscha_intelligence?.data
    
    console.log('🔍 Raw Ruscha Intelligence Data:', ruschaData)
    
    return NextResponse.json({
      success: true,
      fullResponse: data,
      ruschaData: ruschaData,
      hasRuschaData: !!ruschaData,
      userId: userId,
      backendUrl: apiUrl
    })
  } catch (error: any) {
    console.error('❌ Debug API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}