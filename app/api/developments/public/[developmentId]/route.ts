import { NextRequest, NextResponse } from "next/server"
import { secureApi } from "@/lib/secure-api"

export async function GET(
  request: NextRequest,
  { params }: { params: { developmentId: string } }
) {
  try {
    const { developmentId } = params

    if (!developmentId) {
      return NextResponse.json(
        { error: "Development ID is required" },
        { status: 400 }
      )
    }

    // Fetch from backend - no fallback
    const endpoint = `/api/developments/public/${developmentId}`

    const devData = await secureApi.get(endpoint, false, {
      enableCache: true,
      cacheDuration: 600000 // Cache for 10 minutes
    })

    if (!devData) {
      return NextResponse.json(
        { error: "Development not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: developmentId,
      ...devData
    }, { status: 200 })

  } catch (error: any) {
    // Check if it's a 404 error
    if (error.status === 404 || error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "Development not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch development" },
      { status: 500 }
    )
  }
}