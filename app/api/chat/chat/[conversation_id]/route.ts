// app/api/chat/chat/[conversation_id]/route.ts
// API endpoint for sending messages in existing conversations with full context management

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

export async function POST(
  request: NextRequest,
  { params }: { params: { conversation_id: string } }
) {
  try {
    const conversationId = params.conversation_id

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

    // Get the raw text message
    const message = await request.text()
    if (!message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Get or create conversation
    let conversation = conversations.get(conversationId)
    if (!conversation) {
      // Create new conversation if it doesn't exist
      conversation = {
        id: conversationId,
        userId,
        title: message.length > 50 ? message.substring(0, 50) + "..." : message,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    // Verify conversation ownership
    if (conversation.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden - Conversation belongs to another user" },
        { status: 403 }
      )
    }

    // Add user message to conversation
    const userMessage: StoredMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      timestamp: new Date()
    }

    conversation.messages.push(userMessage)

    // Build context from conversation history for LLM
    const contextMessages = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    // Get user context for personalization
    const user = getCurrentUser()
    const userContext = `User Profile: ${user?.name || 'HNWI User'} - High Net Worth Individual interested in premium investment opportunities, real estate, precious metals, and strategic wealth management.`

    // Simulate AI response with context awareness
    // In production, replace with actual LLM API call (OpenAI, Claude, etc.)
    const aiResponse = generateContextualResponse(message, contextMessages, userContext)

    // Add AI response to conversation
    const assistantMessage: StoredMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: aiResponse,
      timestamp: new Date()
    }

    conversation.messages.push(assistantMessage)
    conversation.updatedAt = new Date()

    // Store updated conversation
    conversations.set(conversationId, conversation)

    return NextResponse.json({
      response: aiResponse,
      conversation_id: conversationId,
      message_id: assistantMessage.id,
      timestamp: assistantMessage.timestamp
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    )
  }
}

// Simulate contextual AI response - replace with actual LLM in production
function generateContextualResponse(
  currentMessage: string,
  conversationHistory: Array<{role: string, content: string}>,
  userContext: string
): string {

  // Check if this is a follow-up question
  const previousMessages = conversationHistory.slice(0, -1) // Exclude current message
  const lastExchange = previousMessages.slice(-2) // Get last user message and AI response

  const lowerMessage = currentMessage.toLowerCase()
  const isFollowUp = lowerMessage.includes("break down") ||
                    lowerMessage.includes("further") ||
                    lowerMessage.includes("more detail") ||
                    lowerMessage.includes("elaborate") ||
                    lowerMessage.includes("explain more")

  if (isFollowUp && lastExchange.length >= 2) {
    const lastAiResponse = lastExchange[1]?.content || ""

    // Check what topic we were discussing
    if (lastAiResponse.includes("Mumbai") && lastAiResponse.includes("Gurugram")) {
      return `Let me break down the Mumbai vs Gurugram real estate comparison in more detail:

**Mumbai Deep Dive:**
- Premium Areas: Worli Sea Face ($2M-5M), Lower Parel Business District ($1.5M-3M)
- ROI: 8-12% annually in prime commercial, 6-8% residential
- Rental Yields: Commercial 6-9%, Residential 2-4%
- Growth Drivers: Financial hub status, limited land supply, infrastructure projects

**Gurugram Deep Dive:**
- Premium Areas: Golf Course Extension Road ($800K-2M), Cyber City ($1M-2.5M)
- ROI: 10-15% in emerging sectors, 8-10% in established areas
- Rental Yields: Commercial 8-12%, Residential 3-5%
- Growth Drivers: Corporate expansion, New Gurugram development, connectivity improvements

**Key Investment Considerations:**
- Mumbai: Higher entry cost, stable appreciation, prestige value
- Gurugram: Better affordability, higher growth potential, modern infrastructure

Would you like me to analyze specific sub-markets or investment structures?`
    }
  }

  // Handle general investment queries
  if (lowerMessage.includes("investment") || lowerMessage.includes("opportunity")) {
    return `Based on current market analysis and your HNWI profile, here are premium investment opportunities:

**Real Estate (40% portfolio allocation)**
- Mumbai: Commercial properties in BKC, Worli Sea Face luxury residential
- Dubai: Emirates Hills villas, Downtown Dubai penthouses
- Singapore: Sentosa Cove waterfront properties

**Alternative Investments (30%)**
- Private equity in tech unicorns (₹50L+ minimums)
- Rare metals: Rhodium, Platinum diversification
- Art & Collectibles: Indian contemporary art, vintage automobiles

**Structured Products (30%)**
- USD-denominated bonds, Swiss franc holdings
- Commodity futures via Singapore exchanges
- Cryptocurrency exposure through regulated funds

Each opportunity vetted for accredited investors. Would you like detailed analysis on any specific sector?`
  }

  // Handle market analysis questions
  if (lowerMessage.includes("market") || lowerMessage.includes("trend")) {
    return `Current HNWI market trends and strategic insights:

**Global Macro Environment:**
- US Fed rate trajectory favoring emerging market assets
- Asian real estate showing resilience vs Western markets
- Gold maintaining hedge value amid geopolitical uncertainty

**Sector Analysis:**
- Technology: AI infrastructure plays gaining momentum
- Real Estate: Prime metro locations outperforming tier-2 cities
- Precious Metals: Central bank buying supporting floor prices

**Strategic Positioning:**
- Diversification across 3-4 currencies recommended
- Alternative investments gaining allocation preference
- ESG compliance becoming mandatory for institutional co-investments

Would you like specific regional analysis or sector deep-dive?`
  }

  // Default contextual response
  return `Thank you for your question. As your private intelligence ally, I'm analyzing this within the context of our discussion and your HNWI investment profile.

Based on your query about "${currentMessage}", I recommend focusing on:

1. **Strategic Context**: How this fits within broader wealth management objectives
2. **Risk Assessment**: Appropriate for accredited investor profile
3. **Opportunity Mapping**: Alignment with current market conditions

Could you provide more specific details about your investment timeline or preferences? This will help me deliver more targeted intelligence.`
}