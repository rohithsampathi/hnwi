// app/api/rohith/start/route.ts
// API endpoint for starting new conversations with Rohith

import { NextRequest, NextResponse } from "next/server"
import { serverSecureApi } from "@/lib/secure-api"
import { getCurrentUserId } from "@/lib/auth-manager"

export async function POST(request: NextRequest) {
  try {
    // Get the first message from request body
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    const firstMessage = body.initial_message || body.message || ""

    if (!firstMessage || !firstMessage.trim()) {
      return NextResponse.json(
        { error: "First message is required" },
        { status: 400 }
      )
    }

    // Get user ID for server token (server-side auth will be handled by serverSecureApi)
    const userId = getCurrentUserId()
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Use serverSecureApi for server-side API calls
    const conversationData = await serverSecureApi.post('/api/rohith/start', {
      message: firstMessage
    })

    return NextResponse.json(conversationData)

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to start conversation" },
      { status: 500 }
    )
  }
}


