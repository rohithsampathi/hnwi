// app/api/rohith/chat/[conversation_id]/route.ts
// API endpoint for sending messages in existing conversations

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

    if (!conversation_id) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      )
    }

    // Get the message from request body
    let body
    try {
      body = await request.json()
    } catch {
      // Fallback to raw text
      const message = await request.text()
      body = { message }
    }

    const message = body.message || ""

    if (!message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    try {
      // Use serverSecureApi for server-side API calls
      const chatResponse = await serverSecureApi.post(`/api/rohith/message/${conversation_id}`, {
        message: message
      })
      return NextResponse.json(chatResponse)
    } catch (error: any) {
      if (error.status === 404) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        )
      }

      if (error.status === 403) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: "Failed to send message to backend" },
        { status: error.status || 500 }
      )
    }

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    )
  }
}

