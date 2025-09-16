// app/api/rohith/conversations/route.ts
// API endpoint for getting all conversations for a user

import { NextRequest, NextResponse } from "next/server"
import { serverSecureApi } from "@/lib/secure-api"
import { getCurrentUserId } from "@/lib/auth-manager"

export async function GET(request: NextRequest) {
  try {
    // Get user ID for server token (server-side auth will be handled by serverSecureApi)
    const userId = getCurrentUserId()
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Use serverSecureApi for server-side API calls
    const conversations = await serverSecureApi.get('/api/rohith/conversations')

    return NextResponse.json(conversations)

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get conversations" },
      { status: 500 }
    )
  }
}