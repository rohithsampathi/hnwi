// app/api/chat/share/route.ts
// API endpoint for creating shareable conversation links

import { NextRequest, NextResponse } from "next/server"
import { secureApi } from "@/lib/secure-api"
import { getCurrentUserId, getCurrentUser } from "@/lib/auth-manager"
import { storeSharedConversation, getSharedConversation } from "@/lib/shared-conversations-db"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { conversationId } = await request.json()

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      )
    }

    const userId = getCurrentUserId()
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Generate a unique share ID
    const shareId = crypto.randomBytes(12).toString("hex")

    // Get the conversation history from the backend
    const conversationData = await secureApi.get(
      `/api/rohith/history/${conversationId}`,
      true
    )

    if (!conversationData) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    // Get user info for shared by
    const user = getCurrentUser()
    const sharedBy = user?.name || user?.email || "Anonymous"

    // Store the shared conversation data
    await storeSharedConversation({
      shareId,
      conversationId,
      userId,
      conversationData,
      sharedBy
    })

    // Get the base URL from the request headers if NEXT_PUBLIC_APP_URL is not set
    const host = request.headers.get("host")
    const protocol = request.headers.get("x-forwarded-proto") || "http"
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}` || "https://app.hnwichronicles.com"
    const shareUrl = `${baseUrl}/share/rohith/${shareId}`

    return NextResponse.json({
      success: true,
      shareUrl,
      shareId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get("shareId")

    if (!shareId) {
      return NextResponse.json(
        { error: "Share ID is required" },
        { status: 400 }
      )
    }

    // Retrieve from storage
    const sharedConversation = await getSharedConversation(shareId)

    if (!sharedConversation) {
      return NextResponse.json(
        { error: "Shared conversation not found or has expired" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      conversation: sharedConversation.conversationData
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve shared conversation" },
      { status: 500 }
    )
  }
}