// app/api/rohith/conversation/[conversation_id]/title/route.ts
// API endpoint for updating conversation title

import { NextRequest, NextResponse } from "next/server"
import { secureApi } from "@/lib/secure-api"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversation_id: string }> }
) {
  try {
    const { conversation_id } = await params
    const body = await request.json()
    const { title } = body

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    // Call backend API using secureApi (handles auth automatically)
    const result = await secureApi.patch(
      `/api/rohith/conversation/${conversation_id}/title`,
      { title },
      false // Don't use cache for update operations
    )

    if (!result) {
      return NextResponse.json(
        { error: "Failed to update conversation title" },
        { status: 500 }
      )
    }

    return NextResponse.json(result)

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update conversation title" },
      { status: 500 }
    )
  }
}