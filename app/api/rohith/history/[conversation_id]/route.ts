// app/api/rohith/history/[conversation_id]/route.ts
// API endpoint for getting conversation history

import { NextRequest, NextResponse } from "next/server"
import { serverSecureApi } from "@/lib/secure-api"
import { getCurrentUserId } from "@/lib/auth-manager"

export async function GET(
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

    try {
      // Use serverSecureApi for server-side API calls
      const conversationHistory = await serverSecureApi.get(`/api/rohith/history/${conversation_id}`)
      return NextResponse.json(conversationHistory)
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
        { error: "Failed to fetch conversation history from backend" },
        { status: error.status || 500 }
      )
    }

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get conversation history" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    try {
      // Use serverSecureApi for server-side API calls
      const result = await serverSecureApi.delete(`/api/rohith/conversation/${conversation_id}`)
      return NextResponse.json(result)
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
        { error: "Failed to delete conversation from backend" },
        { status: error.status || 500 }
      )
    }

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    )
  }
}