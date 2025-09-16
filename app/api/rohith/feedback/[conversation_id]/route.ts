// app/api/rohith/feedback/[conversation_id]/route.ts
// Feedback submission endpoint for Rohith conversations

import { NextRequest, NextResponse } from "next/server"
import { serverSecureApi } from "@/lib/secure-api"
import { getCurrentUserId } from "@/lib/auth-manager"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversation_id: string }> }
) {
  try {
    // Get user ID for server token (server-side auth will be handled by serverSecureApi)
    const userId = getCurrentUserId()
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { conversation_id } = await params
    const { message_id, feedback_score, user_id } = await request.json()

    if (!message_id || feedback_score === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: message_id, feedback_score" },
        { status: 400 }
      )
    }

    // Use serverSecureApi for server-side API calls
    const result = await serverSecureApi.post(`/api/rohith/feedback/${conversation_id}`, {
      conversation_id,
      message_id,
      feedback_score,
      user_id: user_id || userId
    })

    return NextResponse.json(result)

  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to submit feedback to backend" },
      { status: error.status || 500 }
    )
  }
}