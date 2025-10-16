// app/api/debug/env-check/route.ts
// Diagnostic endpoint to check environment configuration

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envCheck = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      api_base_url: process.env.API_BASE_URL || 'NOT SET',
      api_base_url_exists: !!process.env.API_BASE_URL,
      next_public_base_url: process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET',
      // Don't expose secrets, just check if they exist
      has_jwt_secret: !!process.env.JWT_SECRET,
      has_api_secret: !!process.env.API_SECRET_KEY,
      has_mongodb_uri: !!process.env.MONGODB_URI,
      // Try to ping the backend
      backend_url_configured: process.env.API_BASE_URL || 'http://localhost:8000',
    }

    return NextResponse.json({
      success: true,
      ...envCheck
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
