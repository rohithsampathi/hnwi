// app/api/rohith/feedback/route.ts
// API endpoint for submitting message feedback

import { NextRequest, NextResponse } from "next/server"
import { getCurrentUserId } from "@/lib/auth-manager"

export async function POST(request: NextRequest) {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { conversation_id, message_id, feedback_score, user_id } = await request.json()

    if (!conversation_id || !message_id || feedback_score === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // In production, store feedback in database
    // Feedback received for conversation_id and message_id with feedback_score

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
      learning_stats: {
        total_feedback: 1,
        positive_feedback: feedback_score === 1 ? 1 : 0
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    )
  }
}