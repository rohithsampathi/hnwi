// types/rohith.ts
// TypeScript interfaces for Ask Rohith feature

export interface UserPortfolioContext {
  userId: string
  portfolio: {
    totalValue: string
    totalAssets: number
    realEstateHoldings: string
    preciousMetalsPosition: string
    marketIntelligenceReports: number
  }
  personalDetails: {
    name: string
    email: string
    location?: string
  }
  preferences: {
    riskTolerance?: string
    investmentFocus?: string[]
    communicationStyle?: string
  }
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  messageId?: string // Backend message ID for feedback submission
  feedbackSubmitted?: 'positive' | 'negative' | null // Track feedback state
  context?: {
    portfolioSnapshot?: Partial<UserPortfolioContext>
    hnwiKnowledgeSources?: string[]
    responseTime?: number
  }
}

export interface Conversation {
  id: string
  title: string // First user question becomes the title
  userId: string
  createdAt: Date
  updatedAt: Date
  lastMessage?: string
  messageCount: number
  isActive?: boolean
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[]
}

export interface RohithContextState {
  userContext: UserPortfolioContext | null
  conversations: Conversation[]
  activeConversationId: string | null
  currentMessages: Message[]
  isLoading: boolean
  isTyping: boolean
  isContextLoaded: boolean
  isConversationsLoading: boolean
  error: string | null
}

export interface ConversationResponse {
  response: string
  conversationId: string
  message_id?: string // Backend message ID for feedback
  authenticity_guarantee: boolean
  response_time: number
  provenance: {
    source_nodes: string[]
    knowledge_sources: number
  }
  context_used: {
    portfolio_data: boolean
    conversation_history: boolean
    market_intelligence: boolean
  }
}

export interface StatusIndicators {
  authenticityGuarantee: boolean
  hnwiKnowledgeSources: number
  responseTime: number
  privacyCompliant: boolean
  graphNodesReferenced: number
}

export interface QuickInsight {
  title: string
  value: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  description?: string
}

export interface SystemStatus {
  status: "online" | "offline" | "maintenance"
  authenticity_guarantee: boolean
  unified_graph: {
    total_nodes: number
    last_updated: Date
  }
  capabilities: string[]
  response_time_avg: number
}

// API Request/Response types
export interface CreateConversationRequest {
  userId: string
  firstMessage: string
}

export interface SendMessageRequest {
  userId: string
  message: string
  conversationId: string
  personalization_level?: "high" | "medium" | "low"
}

export interface ConversationListResponse {
  conversations: Conversation[]
  total: number
  hasMore: boolean
}

export interface UserContextResponse extends UserPortfolioContext {
  intelligence: {
    active_analyses: number
    recent_opportunities: number
    market_alerts: number
  }
  opportunities: {
    aligned_count: number
    risk_matched: number
    industry_aligned: number
  }
}

// Component Props interfaces
export interface RohithChatProps {
  conversationId?: string
  onNavigate?: (route: string) => void
  isSharedView?: boolean
  sharedConversationData?: ConversationWithMessages
}

export interface SharedConversation {
  shareId: string
  conversationId: string
  userId: string
  conversationData: ConversationWithMessages
  sharedBy: string
  createdAt: Date
  expiresAt: Date
  viewCount?: number
}

export interface ConversationSidebarProps {
  conversations: Conversation[]
  activeConversationId: string | null
  onConversationSelect: (conversationId: string) => void
  onNewConversation: () => void
  onDeleteConversation: (conversationId: string) => void
  isLoading?: boolean
}

export interface MessageBubbleProps {
  message: Message
  isLatest?: boolean
  showContext?: boolean
}

export interface TypingIndicatorProps {
  message?: string
  showPortfolioContext?: boolean
}

export interface StatusIndicatorsProps {
  indicators: StatusIndicators
  compact?: boolean
}

export interface QuickInsightsProps {
  insights: QuickInsight[]
  portfolioSummary: {
    totalValue: string
    assetCount: number
    topPerformer?: string
  }
  onInsightClick?: (insight: QuickInsight) => void
}