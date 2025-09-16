// app/api/chat/start/route.ts
// API endpoint for starting new conversations with Rohith

import { NextRequest, NextResponse } from "next/server"
import { getCurrentUserId, getCurrentUser } from "@/lib/auth-manager"

// Mock conversation storage - In production, use proper database
interface StoredMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface StoredConversation {
  id: string
  userId: string
  title: string
  messages: StoredMessage[]
  createdAt: Date
  updatedAt: Date
}

// In-memory storage for now - replace with database in production
const conversations = new Map<string, StoredConversation>()

export async function POST(request: NextRequest) {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get the first message from request body (raw text)
    const firstMessage = await request.text()
    if (!firstMessage.trim()) {
      return NextResponse.json(
        { error: "First message is required" },
        { status: 400 }
      )
    }

    // Generate conversation ID
    const conversationId = crypto.randomUUID()

    // Create user message
    const userMessage: StoredMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: firstMessage,
      timestamp: new Date()
    }

    // Get user context for personalization
    const user = getCurrentUser()
    const userContext = `User Profile: ${user?.name || 'HNWI User'} - High Net Worth Individual interested in premium investment opportunities, real estate, precious metals, and strategic wealth management.`

    // Generate AI response for first message
    const aiResponse = generateWelcomeResponse(firstMessage, userContext)

    // Create AI response message
    const assistantMessage: StoredMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: aiResponse,
      timestamp: new Date()
    }

    // Create conversation
    const conversation: StoredConversation = {
      id: conversationId,
      userId,
      title: firstMessage.length > 60
        ? firstMessage.substring(0, 60) + "..."
        : firstMessage,
      messages: [userMessage, assistantMessage],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Store conversation
    conversations.set(conversationId, conversation)

    return NextResponse.json({
      conversation_id: conversationId,
      response: aiResponse,
      title: conversation.title,
      created_at: conversation.createdAt
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to start conversation" },
      { status: 500 }
    )
  }
}

// Generate contextual welcome response
function generateWelcomeResponse(firstMessage: string, userContext: string): string {
  const lowerMessage = firstMessage.toLowerCase()

  // Investment-related welcome
  if (lowerMessage.includes("investment") || lowerMessage.includes("portfolio") || lowerMessage.includes("opportunity")) {
    return `Welcome to your private intelligence ally. I see you're interested in investment opportunities.

As your dedicated advisor for HNWI strategies, I have access to:
- Real-time Crown Vault portfolio analysis
- Exclusive global investment opportunities
- Market intelligence from premium sources
- Strategic wealth management insights

How can I help optimize your investment strategy today?`
  }

  // Real estate specific
  if (lowerMessage.includes("real estate") || lowerMessage.includes("property") || lowerMessage.includes("mumbai") || lowerMessage.includes("dubai")) {
    return `Excellent timing for real estate intelligence. The current market presents unique opportunities for sophisticated investors.

I'm analyzing:
- Prime location market dynamics
- ROI projections across global metros
- Emerging growth corridors
- Luxury residential vs commercial positioning

Which market or property sector interests you most?`
  }

  // Market analysis
  if (lowerMessage.includes("market") || lowerMessage.includes("trend") || lowerMessage.includes("analysis")) {
    return `Market intelligence is my specialty. I'm currently tracking significant movements across:

**High-Priority Sectors:**
- Asian real estate markets showing resilience
- Precious metals positioning amid uncertainty
- Tech infrastructure plays gaining momentum
- Alternative investment opportunities

What specific market intelligence can I provide for your investment thesis?`
  }

  // General welcome
  return `Welcome to your private intelligence network. I'm Rohith, your dedicated ally for HNWI strategic insights.

I have access to your Crown Vault portfolio, global market intelligence, and exclusive investment opportunities. My knowledge spans real estate, precious metals, alternative investments, and strategic wealth management.

**What I can help with:**
- Portfolio optimization strategies
- Market opportunity analysis
- Investment due diligence
- Wealth preservation tactics

How can I assist your investment objectives today?`
}

// Export the conversations map for use by other endpoints
export { conversations }