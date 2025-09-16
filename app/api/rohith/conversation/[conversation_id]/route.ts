// app/api/rohith/conversation/[conversation_id]/route.ts
// API endpoint for getting a specific conversation with all messages

import { NextRequest, NextResponse } from "next/server"
import { getCurrentUserId } from "@/lib/auth-manager"
import { secureApi } from "@/lib/secure-api"
import { conversations, StoredMessage, StoredConversation } from "@/lib/rohith-storage"

export async function GET(
  request: NextRequest,
  { params }: { params: { conversation_id: string } }
) {
  try {
    const conversationId = params.conversation_id
    const userId = getCurrentUserId()

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const conversation = conversations.get(conversationId)
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    if (conversation.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Transform to match frontend format
    const response = {
      id: conversation.id,
      title: conversation.title,
      created_at: conversation.createdAt.toISOString(),
      updated_at: conversation.updatedAt.toISOString(),
      messages: conversation.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        message_id: msg.id
      }))
    }

    return NextResponse.json(response)

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get conversation" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversation_id: string }> }
) {
  try {
    const { conversation_id } = await params

    // Call backend API using secureApi (handles auth automatically)
    const result = await secureApi.delete(
      `/api/rohith/conversation/${conversation_id}`,
      false // Don't use cache for delete operations
    )

    if (!result) {
      return NextResponse.json(
        { error: "Failed to delete conversation" },
        { status: 500 }
      )
    }

    return NextResponse.json(result)

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    )
  }
}

