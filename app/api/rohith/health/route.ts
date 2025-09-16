// app/api/rohith/health/route.ts
// Health check endpoint for Rohith service

import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // In production, this would check the sota_rohith_service health
    return NextResponse.json({
      status: "healthy",
      service: "rohith",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        service: "rohith",
        error: "Service check failed",
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}