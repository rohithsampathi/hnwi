// lib/rohith-api.ts
// API service layer for Ask Rohith feature with SOTA Graph integration

import { secureApi, getCurrentUserId } from "@/lib/secure-api"
// Removed Crown Vault imports - not needed for Ask Rohith
import type {
  UserPortfolioContext,
  UserContextResponse,
  Conversation,
  ConversationWithMessages,
  ConversationResponse,
  ConversationListResponse,
  CreateConversationRequest,
  SendMessageRequest,
  SystemStatus,
  Message
} from "@/types/rohith"

/**
 * API service for Rohith - Private intelligence ally with conversation management
 * Integrates with SOTA Graph backend and HNWI Knowledge Base for personalized context and memory
 */
export class RohithAPI {
  private static instance: RohithAPI
  private userContextCache: Map<string, { data: UserPortfolioContext; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

  private constructor() {}

  public static getInstance(): RohithAPI {
    if (!RohithAPI.instance) {
      RohithAPI.instance = new RohithAPI()
    }
    return RohithAPI.instance
  }

  /**
   * Load user context including portfolio, preferences, and market intelligence
   */
  async loadUserContext(userId?: string): Promise<UserPortfolioContext> {
    try {
      const targetUserId = userId || getCurrentUserId()
      if (!targetUserId) {
        throw new Error("User ID not found")
      }

      // Check cache first
      const cached = this.userContextCache.get(targetUserId)
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data
      }

      // Only load user profile, skip Crown Vault data for Ask Rohith
      const userProfile = await secureApi.get(`/api/users/${targetUserId}`, true, {
        enableCache: true,
        cacheDuration: 600000
      }).catch(() => null)

      // Use placeholder data for portfolio metrics on Ask Rohith page
      // This avoids loading Crown Vault data unnecessarily
      const assets: any[] = []
      const stats = {}
      const totalValue = 0
      const realEstateValue = 0
      const preciousMetalsValue = 0

      const userContext: UserPortfolioContext = {
        userId: targetUserId,
        portfolio: {
          totalValue: totalValue > 0 ? `$${(totalValue / 1000000).toFixed(2)}M` : "$0",
          totalAssets: assets.length,
          realEstateHoldings: "0", // Hidden from UI
          preciousMetalsPosition: "0", // Hidden from UI
          marketIntelligenceReports: stats.intelligence_reports || 12 // Default to 12 for demo
        },
        personalDetails: {
          name: userProfile?.name || userProfile?.first_name || "User",
          email: userProfile?.email || "",
          location: userProfile?.location
        },
        preferences: {
          riskTolerance: userProfile?.risk_tolerance,
          investmentFocus: userProfile?.investment_focus ? [userProfile.investment_focus] : ["Real Estate", "Precious Metals"],
          communicationStyle: "professional"
        }
      }

      // Cache the result
      this.userContextCache.set(targetUserId, {
        data: userContext,
        timestamp: Date.now()
      })

      return userContext
    } catch (error) {
      // Return minimal context on error
      const userId = getCurrentUserId() || "unknown"
      return {
        userId,
        portfolio: {
          totalValue: "0",
          totalAssets: 0,
          realEstateHoldings: "0",
          preciousMetalsPosition: "0",
          marketIntelligenceReports: 0
        },
        personalDetails: {
          name: "User",
          email: ""
        },
        preferences: {}
      }
    }
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(userId?: string, limit: number = 50): Promise<Conversation[]> {
    try {
      const targetUserId = userId || getCurrentUserId()
      if (!targetUserId) {
        throw new Error("User ID not found")
      }

      // Use the backend endpoint for fetching conversations
      const response = await secureApi.get(
        `/api/rohith/conversations?limit=${limit}`,
        true,
        { enableCache: false } // Disable cache to always get fresh data
      )

      // Handle the backend response format
      if (!response || !response.conversations) {
        return []
      }

      // Transform the response to match our frontend format
      const conversations: Conversation[] = response.conversations.map((conv: any) => {
        // Parse title if it's JSON format
        let title = conv.title || "New Conversation"

        // More robust title processing
        title = this.cleanConversationTitle(title)

        return {
          id: conv.conversation_id,
          title: title,
          userId: conv.user_id || targetUserId,
          createdAt: new Date(conv.created_at || conv.updated_at),
          updatedAt: new Date(conv.updated_at || conv.created_at),
          lastMessage: conv.last_message || "",
          messageCount: conv.total_messages || conv.message_count || 0,
          isActive: true
        }
      })

      return conversations
    } catch (error) {
      return []
    }
  }

  /**
   * Get a specific conversation with all messages
   */
  async getConversationHistory(conversationId: string): Promise<ConversationWithMessages | null> {
    try {
      const response = await secureApi.get(
        `/api/rohith/history/${conversationId}`,
        true,
        { enableCache: true, cacheDuration: 60000 } // 1 minute cache for active conversations
      )

      // Handle the backend response format
      if (!response || !response.messages) {
        return null
      }

      // Transform the response to match our frontend format
      const messages: Message[] = response.messages.map((msg: any) => {
        let content = msg.content || msg.message || ""

        // Parse content if it's JSON format containing initial_message
        if (typeof content === 'string' && content.startsWith('{') && content.includes('"initial_message"')) {
          try {
            const parsed = JSON.parse(content)
            content = parsed.initial_message || parsed.message || content
          } catch (e) {
            // If parsing fails, use the original content
            content = content
          }
        } else if (typeof content === 'object' && content.initial_message) {
          // If content is already an object with initial_message property
          content = content.initial_message || content.message || "Message"
        }

        // Ensure content is a string and preserve formatting
        if (typeof content !== 'string') {
          content = String(content)
        }

        // Parse timestamp - handle various formats
        let timestamp: Date
        try {
          timestamp = new Date(msg.timestamp || msg.created_at)
          // Validate the date
          if (isNaN(timestamp.getTime())) {
            timestamp = new Date()
          }
        } catch {
          timestamp = new Date()
        }

        return {
          id: msg.message_id || crypto.randomUUID(),
          role: msg.role === "assistant" ? "assistant" : "user", // Ensure valid role
          content: content,
          timestamp: timestamp,
          messageId: msg.message_id, // Include backend message ID for feedback
          context: msg.role === "assistant" ? {
            hnwiKnowledgeSources: msg.context?.generated_from ? ["HNWI Knowledge Base"] : ["rohith_api"],
            responseTime: msg.context?.response_time || 3000
          } : msg.context
        }
      })

      // Sort messages by timestamp to ensure correct chronological order
      // Secondary sort: if timestamps are equal or very close (within 1 second),
      // ensure user messages come before assistant messages
      messages.sort((a, b) => {
        const timeDiff = a.timestamp.getTime() - b.timestamp.getTime()

        // If timestamps differ by more than 1 second, use timestamp order
        if (Math.abs(timeDiff) > 1000) {
          return timeDiff
        }

        // If timestamps are very close or equal, user message should come first
        if (a.role === 'user' && b.role === 'assistant') {
          return -1
        }
        if (a.role === 'assistant' && b.role === 'user') {
          return 1
        }

        // If both are same role, maintain original order
        return timeDiff
      })

      // Get the first conversation from the list to get title and other metadata
      // Or use a separate endpoint if needed
      const conversationsResponse = await this.getConversations()
      const conversationMetadata = conversationsResponse.find(c => c.id === conversationId)

      const conversationData: ConversationWithMessages = {
        id: conversationId,
        title: conversationMetadata?.title || response.title || "Conversation",
        userId: getCurrentUserId() || "",
        createdAt: conversationMetadata?.createdAt || new Date(),
        updatedAt: conversationMetadata?.updatedAt || new Date(),
        messageCount: messages.length,
        isActive: true,
        messages: messages
      }

      return conversationData
    } catch (error) {
      return null
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(firstMessage: string, userId?: string): Promise<string> {
    try {
      const targetUserId = userId || getCurrentUserId()
      if (!targetUserId) {
        throw new Error("User ID not found")
      }

      // Creating new conversation

      // Use the Rohith start endpoint with the first message
      const response = await secureApi.post(
        "/api/rohith/start",
        {
          initial_message: firstMessage,
          user_id: targetUserId
        },
        true,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      // Conversation created successfully

      return response.conversation_id
    } catch (error) {
      throw error
    }
  }

  /**
   * Send a message to Rohith and get response
   */
  async sendMessage(
    message: string,
    conversationId: string,
    userId?: string
  ): Promise<ConversationResponse> {
    try {
      const targetUserId = userId || getCurrentUserId()
      if (!targetUserId) {
        throw new Error("User ID not found")
      }

      // Sending message to conversation

      // Clear conversation cache to ensure fresh data
      this.clearConversationCache(conversationId)

      const startTime = Date.now()

      // Send message to the Rohith message endpoint
      const response = await secureApi.post(
        `/api/rohith/message/${conversationId}`,
        {
          message: message,
          user_id: targetUserId
        },
        true,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      // Process response

      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Rohith API] Response keys:', Object.keys(response))
        console.log('[Rohith API] Response sample:', JSON.stringify(response).substring(0, 500))
      }

      const responseTime = Date.now() - startTime

      // Transform the response to match our frontend format
      // Handle case where response.response might be an object with content property
      let responseText = "I'm sorry, I couldn't process that request."
      if (response.response) {
        if (typeof response.response === 'string') {
          responseText = response.response
        } else if (typeof response.response === 'object' && response.response.content) {
          responseText = response.response.content
        }
      } else if (response.message) {
        responseText = response.message
      } else if (response.content) {
        responseText = response.content
      }

      // Debug logging for response extraction
      if (process.env.NODE_ENV === 'development') {
        console.log('[Rohith API] Extracted response text length:', responseText.length)
        console.log('[Rohith API] Response text preview:', responseText.substring(0, 100))
      }

      const conversationResponse: ConversationResponse = {
        response: responseText,
        conversationId,
        message_id: response.message_id, // Include message_id for feedback
        authenticity_guarantee: response.authenticity_guarantee || true,
        response_time: response.response?.processing_time_ms || responseTime,
        provenance: {
          source_nodes: response.context?.relevant_entities?.map((e: any) => e.name) || ["rohith_api"],
          knowledge_sources: response.context?.metadata?.entities_found || 0
        },
        context_used: {
          portfolio_data: true,
          conversation_history: true,
          market_intelligence: true
        }
      }

      return conversationResponse
    } catch (error) {
      throw error
    }
  }


  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const response = await secureApi.delete(
        `/api/rohith/conversation/${conversationId}`,
        true
      )

      // Clear cache
      this.clearConversationCache(conversationId)

      return response.success === true
    } catch (error) {
      return false
    }
  }

  /**
   * Update conversation title
   */
  async updateConversationTitle(conversationId: string, newTitle: string): Promise<boolean> {
    try {
      // Clean the title before sending
      const cleanedTitle = this.cleanConversationTitle(newTitle)

      // Use a specific endpoint for title updates
      const response = await secureApi.post(
        `/api/rohith/conversation/${conversationId}/title`,
        { title: cleanedTitle },
        true
      )

      // Clear cache to refresh data - clear both conversation cache and list cache
      this.clearConversationCache(conversationId)

      // Also clear the conversations list cache to ensure it gets fresh data
      import("@/lib/secure-api").then(({ CacheControl }) => {
        CacheControl.delete('/api/rohith/conversations')
      })

      return response.success === true || response.status === 'success'
    } catch (error) {
      return false
    }
  }

  /**
   * Submit feedback for a message
   */
  async submitFeedback(
    conversationId: string,
    messageId: string,
    isPositive: boolean,
    userId?: string
  ): Promise<{ success: boolean; message: string; learning_stats?: any }> {
    try {
      const targetUserId = userId || getCurrentUserId()

      const data = await secureApi.post(
        `/api/rohith/feedback/${conversationId}`,
        {
          conversation_id: conversationId,
          message_id: messageId,
          feedback_score: isPositive ? 1 : 0,
          user_id: targetUserId
        },
        true,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      return data
    } catch (error) {
      throw error
    }
  }

  /**
   * Share a conversation
   */
  async shareConversation(conversationId: string): Promise<{ shareUrl: string; shareId: string }> {
    try {
      // Get the current conversation data
      const userId = getCurrentUserId()

      // Try to get conversation data - we'll send what we can
      let conversationData = null
      try {
        // Check cache if available
        if (this.conversationCache && this.conversationCache.has(conversationId)) {
          conversationData = this.conversationCache.get(conversationId)
        } else {
          // Try to fetch from API
          conversationData = await this.getConversation(conversationId, userId)
        }
      } catch (err) {
        // Could not get conversation data, proceeding without it
      }

      // First try the new MongoDB-backed endpoint
      const response = await fetch('/api/conversations/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // CRITICAL: Send cookies with request
        body: JSON.stringify({ conversationId, userId, conversationData })
      })

      if (response.ok) {
        const data = await response.json()
        // Share created successfully
        return {
          shareUrl: data.shareUrl,
          shareId: data.shareId
        }
      }

      // Fallback to the original endpoint if the new one fails
      const fallbackResponse = await secureApi.post(
        "/api/rohith/share",
        { conversationId },
        true
      )

      // Fallback share created

      if (!fallbackResponse.shareUrl || !fallbackResponse.shareId) {
        throw new Error("Invalid response from share API")
      }

      return {
        shareUrl: fallbackResponse.shareUrl,
        shareId: fallbackResponse.shareId
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Get shared conversation
   */
  async getSharedConversation(shareId: string): Promise<ConversationWithMessages | null> {
    try {
      // First try the new MongoDB-backed endpoint
      const response = await fetch(`/api/conversations/share?shareId=${shareId}`, {
        credentials: 'include' // CRITICAL: Send cookies with request
      })

      if (response.ok) {
        const data = await response.json()
        // Retrieved shared conversation
        if (data.success && data.conversation) {
          return data.conversation as ConversationWithMessages
        }
      }

      // Fallback to the original endpoint if the new one fails
      const fallbackResponse = await secureApi.get(
        `/api/rohith/share?shareId=${shareId}`,
        false // No auth required for public shares
      )

      if (fallbackResponse.success && fallbackResponse.conversation) {
        return fallbackResponse.conversation
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * Get system status and capabilities
   */
  async getSystemStatus(): Promise<SystemStatus> {
    try {
      const response = await secureApi.get(
        "/sota-graph/status",
        false, // No auth required for status
        { enableCache: true, cacheDuration: 30000 } // 30 seconds cache
      ) as SystemStatus

      return response
    } catch (error) {
      // Return default status on error
      return {
        status: "offline",
        authenticity_guarantee: false,
        unified_graph: {
          total_nodes: 0,
          last_updated: new Date()
        },
        capabilities: [],
        response_time_avg: 0
      }
    }
  }

  /**
   * Clear user context cache (useful after profile updates)
   */
  clearUserContextCache(userId?: string): void {
    const targetUserId = userId || getCurrentUserId()
    if (targetUserId) {
      this.userContextCache.delete(targetUserId)
    }
  }

  /**
   * Clear conversation cache for a specific conversation
   */
  private clearConversationCache(conversationId: string): void {
    // Clear from secure API cache
    const cacheKeys = [
      `/api/rohith/history/${conversationId}`,
      `/api/rohith/conversations` // Will clear user's conversation list cache
    ]

    // Access the cache control from secure-api
    import("@/lib/secure-api").then(({ CacheControl }) => {
      cacheKeys.forEach(key => CacheControl.delete(key))
    })
  }

  /**
   * Clean conversation title - handles JSON, objects, and malformed titles
   */
  private cleanConversationTitle(title: any): string {
    if (!title) return "New Conversation"

    // If it's already a clean string that doesn't look like JSON, return it
    if (typeof title === 'string' && !title.startsWith('{') && !title.includes('"initial_message"') && !title.includes('"message"')) {
      return title.length > 60 ? title.substring(0, 57) + "..." : title
    }

    let cleanTitle = "New Conversation"

    try {
      // Handle string that might be JSON
      if (typeof title === 'string') {
        // Check if it's JSON-like
        if (title.startsWith('{') || title.includes('"initial_message"') || title.includes('"message"')) {
          try {
            const parsed = JSON.parse(title)
            cleanTitle = parsed.initial_message || parsed.message || parsed.content || parsed.text || "New Conversation"
          } catch (e) {
            // If JSON parsing fails, try to extract content manually
            const messageMatch = title.match(/"(?:initial_message|message|content)"\s*:\s*"([^"]+)"/)
            if (messageMatch && messageMatch[1]) {
              cleanTitle = messageMatch[1]
            } else {
              // Last resort: clean up the string
              cleanTitle = title.replace(/[{}"]/g, '').replace(/initial_message|message|content/g, '').trim()
              if (!cleanTitle || cleanTitle.length < 3) {
                cleanTitle = "New Conversation"
              }
            }
          }
        } else {
          cleanTitle = title
        }
      }
      // Handle object directly
      else if (typeof title === 'object' && title !== null) {
        cleanTitle = title.initial_message || title.message || title.content || title.text || "New Conversation"
      }

      // Clean and format the title
      if (typeof cleanTitle === 'string') {
        cleanTitle = cleanTitle.trim()

        // Remove any remaining JSON artifacts
        cleanTitle = cleanTitle.replace(/^[{",]+|[}",]+$/g, '')

        // Ensure it's not empty
        if (!cleanTitle || cleanTitle.length < 2) {
          cleanTitle = "New Conversation"
        }

        // Capitalize first letter
        cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)

        // Truncate if needed
        if (cleanTitle.length > 60) {
          cleanTitle = cleanTitle.substring(0, 57) + "..."
        }
      }

    } catch (error) {
      cleanTitle = "New Conversation"
    }

    return cleanTitle
  }

  /**
   * Format conversation title from first message (truncate if needed)
   */
  static formatConversationTitle(firstMessage: string): string {
    // Clean the message first
    let cleanMessage = firstMessage.trim()

    // Convert to sentence case (first letter uppercase, rest lowercase for each sentence)
    cleanMessage = cleanMessage
      .split('. ')
      .map(sentence => {
        const trimmed = sentence.trim()
        if (!trimmed) return ''
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
      })
      .join('. ')
      .trim()

    const maxLength = 60
    if (cleanMessage.length <= maxLength) {
      return cleanMessage
    }

    return cleanMessage.substring(0, maxLength - 3) + "..."
  }

  /**
   * Create a new message object
   */
  static createMessage(
    role: "user" | "assistant",
    content: string,
    context?: any
  ): Message {
    return {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
      context
    }
  }
}

// Export singleton instance
export const rohithAPI = RohithAPI.getInstance()

// Export convenience functions
export const loadUserContext = (userId?: string) => rohithAPI.loadUserContext(userId)
export const getConversations = (userId?: string) => rohithAPI.getConversations(userId)
export const getConversationHistory = (conversationId: string) => rohithAPI.getConversationHistory(conversationId)
export const createConversation = (firstMessage: string, userId?: string) => rohithAPI.createConversation(firstMessage, userId)
export const sendMessage = (message: string, conversationId: string, userId?: string) => rohithAPI.sendMessage(message, conversationId, userId)
export const deleteConversation = (conversationId: string) => rohithAPI.deleteConversation(conversationId)
export const updateConversationTitle = (conversationId: string, newTitle: string) => rohithAPI.updateConversationTitle(conversationId, newTitle)
export const getSystemStatus = () => rohithAPI.getSystemStatus()
export const clearUserContextCache = (userId?: string) => rohithAPI.clearUserContextCache(userId)
export const formatConversationTitle = RohithAPI.formatConversationTitle
export const createMessage = RohithAPI.createMessage
export const shareConversation = (conversationId: string) => rohithAPI.shareConversation.bind(rohithAPI)(conversationId)
export const getSharedConversation = (shareId: string) => rohithAPI.getSharedConversation(shareId)
export const submitFeedback = (conversationId: string, messageId: string, isPositive: boolean, userId?: string) => rohithAPI.submitFeedback(conversationId, messageId, isPositive, userId)