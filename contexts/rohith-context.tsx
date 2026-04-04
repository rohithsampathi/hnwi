// contexts/rohith-context.tsx
// Context provider for Ask Rohith state management

"use client"

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react"
import { getCurrentUser, getCurrentUserId } from "@/lib/secure-api"
import { createConversationTitle } from "@/lib/utils"
import {
  rohithAPI,
  loadUserContext,
  getConversations,
  getConversationHistory,
  deleteConversation as apiDeleteConversation,
  updateConversationTitle as apiUpdateConversationTitle,
  createMessage,
  submitFeedback as apiSubmitFeedback
} from "@/lib/rohith-api"
import type { VisualizationCommand } from "@/types/rohith"
import { BackgroundSyncService } from "@/lib/services/background-sync-service"
import type {
  RohithContextState,
  UserPortfolioContext,
  Conversation,
  Message,
  ConversationResponse
} from "@/types/rohith"

interface RohithContextActions {
  loadUserContext: () => Promise<void>
  loadConversations: () => Promise<void>
  selectConversation: (conversationId: string) => Promise<void>
  createNewConversation: (firstMessage: string) => Promise<string>
  sendMessage: (message: string) => Promise<void>
  deleteConversation: (conversationId: string) => Promise<boolean>
  updateConversationTitle: (conversationId: string, newTitle: string) => Promise<boolean>
  clearCurrentConversation: () => void
  setTyping: (isTyping: boolean) => void
  clearError: () => void
  submitMessageFeedback: (messageId: string, isPositive: boolean) => Promise<void>
}

type JarvisState = {
  visualizations: VisualizationCommand[]
  predictivePrompts: string[]
  narration: { text: string; delivery: string } | null
  currentMode: "jarvis" | "classic" | null // Track current response mode from backend
}

type RohithInternalState = RohithContextState & JarvisState

type RohithContextType = RohithInternalState & RohithContextActions

// JARVIS-specific interfaces
interface JarvisNarration {
  text: string
  delivery: 'word_by_word' | 'sentence_by_sentence' | 'instant'
}

// Action types
type RohithAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_USER_CONTEXT"; payload: UserPortfolioContext }
  | { type: "SET_CONVERSATIONS"; payload: Conversation[] }
  | { type: "SET_CONVERSATIONS_LOADING"; payload: boolean }
  | { type: "SET_ACTIVE_CONVERSATION"; payload: string | null }
  | { type: "SET_CURRENT_MESSAGES"; payload: Message[] }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "UPDATE_CONVERSATION"; payload: Conversation }
  | { type: "REMOVE_CONVERSATION"; payload: string }
  | { type: "SET_CONTEXT_LOADED"; payload: boolean }
  | { type: "UPDATE_MESSAGE_FEEDBACK"; payload: { messageId: string; feedback: 'positive' | 'negative' } }
  | { type: "SET_VISUALIZATIONS"; payload: VisualizationCommand[] }
  | { type: "SET_PREDICTIVE_PROMPTS"; payload: string[] }
  | { type: "SET_NARRATION"; payload: JarvisNarration | null }
  | { type: "SET_RESPONSE_MODE"; payload: "jarvis" | "classic" | null }
  | { type: "CLEAR_JARVIS_STATE" }

const initialState: RohithContextState = {
  userContext: null,
  conversations: [],
  activeConversationId: null,
  currentMessages: [],
  isLoading: false,
  isTyping: false,
  isContextLoaded: false,
  isConversationsLoading: false,
  error: null
}

// JARVIS-specific initial state (Feb 2026: JARVIS is now the default mode)
const initialJarvisState = {
  visualizations: [],
  predictivePrompts: [],
  narration: null,
  currentMode: null as "jarvis" | "classic" | null
}

function rohithReducer(state: RohithInternalState, action: RohithAction): RohithInternalState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    case "SET_TYPING":
      return { ...state, isTyping: action.payload }

    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false }

    case "SET_USER_CONTEXT":
      return { ...state, userContext: action.payload, isContextLoaded: true }

    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.payload }

    case "SET_CONVERSATIONS_LOADING":
      return { ...state, isConversationsLoading: action.payload }

    case "SET_ACTIVE_CONVERSATION":
      return { ...state, activeConversationId: action.payload }

    case "SET_CURRENT_MESSAGES":
      return { ...state, currentMessages: action.payload }

    case "ADD_MESSAGE":
      return {
        ...state,
        currentMessages: [...state.currentMessages, action.payload]
      }

    case "UPDATE_CONVERSATION": {
      const updatedConversations = state.conversations.map(conv =>
        conv.id === action.payload.id ? action.payload : conv
      )
      return { ...state, conversations: updatedConversations }
    }

    case "REMOVE_CONVERSATION": {
      const filteredConversations = state.conversations.filter(
        conv => conv.id !== action.payload
      )
      const newActiveId = state.activeConversationId === action.payload ? null : state.activeConversationId
      return {
        ...state,
        conversations: filteredConversations,
        activeConversationId: newActiveId,
        currentMessages: newActiveId ? state.currentMessages : []
      }
    }

    case "SET_CONTEXT_LOADED":
      return { ...state, isContextLoaded: action.payload }

    case "UPDATE_MESSAGE_FEEDBACK": {
      const updatedMessages = state.currentMessages.map(msg => {
        // Match by messageId first, then fall back to id
        const messageIdentifier = msg.messageId || msg.id
        return messageIdentifier === action.payload.messageId
          ? { ...msg, feedbackSubmitted: action.payload.feedback }
          : msg
      })
      return { ...state, currentMessages: updatedMessages }
    }

    case "SET_VISUALIZATIONS":
      return { ...state, visualizations: action.payload }

    case "SET_PREDICTIVE_PROMPTS":
      return { ...state, predictivePrompts: action.payload }

    case "SET_NARRATION":
      return { ...state, narration: action.payload }

    case "SET_RESPONSE_MODE":
      return { ...state, currentMode: action.payload }

    case "CLEAR_JARVIS_STATE":
      return {
        ...state,
        visualizations: [],
        predictivePrompts: [],
        narration: null,
        currentMode: null
      }

    default:
      return state
  }
}

const RohithContext = createContext<RohithContextType | null>(null)

interface RohithProviderProps {
  children: ReactNode
}

export function RohithProvider({ children }: RohithProviderProps) {
  const [state, dispatch] = useReducer(rohithReducer, {
    ...initialState,
    ...initialJarvisState
  })

  // Load user context on mount
  useEffect(() => {
    let mounted = true
    let initializationComplete = false

    const initializeContext = async () => {
      // Prevent duplicate initialization
      if (!mounted || initializationComplete) return

      try {
        dispatch({ type: "SET_LOADING", payload: true })

        const context = await loadUserContext()
        if (!mounted) return // Component unmounted, stop execution

        dispatch({ type: "SET_USER_CONTEXT", payload: context })

        // Also load conversations
        dispatch({ type: "SET_CONVERSATIONS_LOADING", payload: true })
        const conversations = await getConversations()
        if (!mounted) return // Component unmounted, stop execution

        dispatch({ type: "SET_CONVERSATIONS", payload: conversations })
        dispatch({ type: "SET_CONVERSATIONS_LOADING", payload: false })
        initializationComplete = true

      } catch (error) {
        if (!mounted) return // Component unmounted, stop execution
        dispatch({ type: "SET_ERROR", payload: "Failed to load context" })
      } finally {
        if (mounted) {
          dispatch({ type: "SET_LOADING", payload: false })
        }
      }
    }

    // Use secure-api's getCurrentUserId instead of auth-manager
    const userId = getCurrentUserId()
    if (userId) {
      initializeContext()
    }
    // Don't load until user is authenticated

    return () => {
      mounted = false
    }
  }, [])

  const contextActions: RohithContextActions = {
    loadUserContext: async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        const context = await loadUserContext()
        dispatch({ type: "SET_USER_CONTEXT", payload: context })
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to load user context" })
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },

    loadConversations: async () => {
      try {
        dispatch({ type: "SET_CONVERSATIONS_LOADING", payload: true })
        const conversations = await getConversations()
        dispatch({ type: "SET_CONVERSATIONS", payload: conversations })
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to load conversations" })
      } finally {
        dispatch({ type: "SET_CONVERSATIONS_LOADING", payload: false })
      }
    },

    selectConversation: async (conversationId: string) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: conversationId })

        const conversationData = await getConversationHistory(conversationId)

        if (conversationData) {
          // Messages are already sorted by getConversationHistory, but ensure chronological order
          const sortedMessages = [...conversationData.messages].sort((a, b) => {
            const timeDiff = a.timestamp.getTime() - b.timestamp.getTime()

            // If timestamps are very close (within 1 second), user messages should come first
            if (Math.abs(timeDiff) < 1000) {
              if (a.role === 'user' && b.role === 'assistant') return -1
              if (a.role === 'assistant' && b.role === 'user') return 1
            }

            return timeDiff
          })

          dispatch({ type: "SET_CURRENT_MESSAGES", payload: sortedMessages })
        }
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to load conversation" })
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },

    createNewConversation: async (firstMessage: string): Promise<string> => {
      try {

        // Clear any existing messages and JARVIS state
        dispatch({ type: "SET_CURRENT_MESSAGES", payload: [] })
        dispatch({ type: "CLEAR_JARVIS_STATE" })

        // Add user message immediately to UI for instant feedback
        const userMessage = createMessage("user", firstMessage)
        dispatch({ type: "ADD_MESSAGE", payload: userMessage })

        dispatch({ type: "SET_TYPING", payload: true })

        // Call JARVIS V5 API (now the default mode as of Feb 2026)
        const jarvisResponse = await rohithAPI.createConversationJarvis(
          firstMessage,
          state.userContext?.userId
        )

        const conversationId = jarvisResponse.conversationId

        // Set response mode from backend
        const responseMode = jarvisResponse.mode || "jarvis"
        dispatch({ type: "SET_RESPONSE_MODE", payload: responseMode })

        // Create new conversation object
        const newConversation: Conversation = {
          id: conversationId,
          title: createConversationTitle(firstMessage),
          userId: state.userContext?.userId || "",
          createdAt: new Date(),
          updatedAt: new Date(),
          messageCount: 1,
          isActive: true
        }

        // Add to conversations list
        dispatch({ type: "SET_CONVERSATIONS", payload: [newConversation, ...state.conversations] })
        dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: conversationId })

        // Update JARVIS-specific state only if in JARVIS mode
        if (responseMode === "jarvis") {
          if (jarvisResponse.visualizations) {
            dispatch({ type: "SET_VISUALIZATIONS", payload: jarvisResponse.visualizations })
          }
          if (jarvisResponse.predictive_prompts) {
            dispatch({ type: "SET_PREDICTIVE_PROMPTS", payload: jarvisResponse.predictive_prompts })
          }
          if (jarvisResponse.narration) {
            dispatch({ type: "SET_NARRATION", payload: jarvisResponse.narration })
          }
        }

        // Add Rohith's narration as assistant message (with visualizations attached)
        const vizData = responseMode === "jarvis" ? jarvisResponse.visualizations : undefined
        const assistantMessage = createMessage("assistant", jarvisResponse.narration?.text || "", {
          hnwiKnowledgeSources: jarvisResponse.citations || ["jarvis_v5"], // Legacy field
          sourceDocuments: jarvisResponse.source_documents || [], // New field (Feb 2026+)
          responseTime: jarvisResponse.processing_time_ms || 1000
        }, vizData)

        if (jarvisResponse.message_id) {
          assistantMessage.messageId = jarvisResponse.message_id
        }

        dispatch({ type: "ADD_MESSAGE", payload: assistantMessage })

        return conversationId
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to create conversation" })
        throw error
      } finally {
        dispatch({ type: "SET_TYPING", payload: false })
      }
    },

    sendMessage: async (message: string) => {
      if (!state.activeConversationId) {
        dispatch({ type: "SET_ERROR", payload: "No active conversation" })
        return
      }

      try {
        // Add user message immediately to UI
        const userMessage = createMessage("user", message)
        dispatch({ type: "ADD_MESSAGE", payload: userMessage })

        dispatch({ type: "SET_TYPING", payload: true })

        // Call JARVIS V5 API (now the default mode as of Feb 2026)
        const jarvisResponse = await rohithAPI.sendMessageJarvis(
          message,
          state.activeConversationId,
          state.userContext?.userId
        )

        // Set response mode from backend
        const responseMode = jarvisResponse.mode || "jarvis"
        dispatch({ type: "SET_RESPONSE_MODE", payload: responseMode })

        // Update JARVIS-specific state only if in JARVIS mode
        if (responseMode === "jarvis") {
          if (jarvisResponse.visualizations) {
            dispatch({ type: "SET_VISUALIZATIONS", payload: jarvisResponse.visualizations })
          }
          if (jarvisResponse.predictive_prompts) {
            dispatch({ type: "SET_PREDICTIVE_PROMPTS", payload: jarvisResponse.predictive_prompts })
          }
          if (jarvisResponse.narration) {
            dispatch({ type: "SET_NARRATION", payload: jarvisResponse.narration })
          }
        }

        // Add Rohith's narration as assistant message (with visualizations attached)
        const vizData = responseMode === "jarvis" ? jarvisResponse.visualizations : undefined
        const assistantMessage = createMessage("assistant", jarvisResponse.narration?.text || "", {
          hnwiKnowledgeSources: jarvisResponse.citations || ["jarvis_v5"], // Legacy field
          sourceDocuments: jarvisResponse.source_documents || [], // New field (Feb 2026+)
          responseTime: jarvisResponse.processing_time_ms || 1000
        }, vizData)

        if (jarvisResponse.message_id) {
          assistantMessage.messageId = jarvisResponse.message_id
        }

        dispatch({ type: "ADD_MESSAGE", payload: assistantMessage })

        // Update conversation in list with latest message preview
        const updatedConversation = state.conversations.find(
          conv => conv.id === state.activeConversationId
        )

        if (updatedConversation) {
          const narrationText = jarvisResponse.narration?.text || ""
          const lastMessagePreview = narrationText.length > 100
            ? narrationText.substring(0, 100) + "..."
            : narrationText

          const updated: Conversation = {
            ...updatedConversation,
            lastMessage: lastMessagePreview,
            updatedAt: new Date(),
            messageCount: updatedConversation.messageCount + 2
          }
          dispatch({ type: "UPDATE_CONVERSATION", payload: updated })
        }

      } catch (error) {
        // Main API call failed - try background sync as fallback only if available
        let backgroundSyncWorked = false

        try {
          // Only attempt background sync if it's available and working
          // This prevents IndexedDB errors from breaking the main flow
          if (typeof window !== 'undefined' && window.indexedDB && BackgroundSyncService.isSupported()) {
            await BackgroundSyncService.queueMessageSend(
              `/api/rohith/message/${state.activeConversationId}`,
              { message, conversationId: state.activeConversationId }
            )
            backgroundSyncWorked = true
            dispatch({ type: "SET_ERROR", payload: "Message queued for when you're back online." })
          }
        } catch (syncError) {
          // Background sync failed - this is expected in production if PWA isn't working
          backgroundSyncWorked = false
        }

        // If background sync didn't work, show main error and remove optimistic message
        if (!backgroundSyncWorked) {
          dispatch({ type: "SET_ERROR", payload: "Failed to send message. Please check your connection and try again." })

          // Remove the user message that was optimistically added
          const currentMessages = state.currentMessages
          const updatedMessages = currentMessages.slice(0, -1) // Remove last message (the user message we just added)
          dispatch({ type: "SET_CURRENT_MESSAGES", payload: updatedMessages })
        }
      } finally {
        dispatch({ type: "SET_TYPING", payload: false })
      }
    },

    deleteConversation: async (conversationId: string) => {
      try {
        const success = await apiDeleteConversation(conversationId)
        if (success) {
          // Clear the view immediately if we're viewing the deleted conversation
          if (state.activeConversationId === conversationId) {
            dispatch({ type: "SET_CURRENT_MESSAGES", payload: [] })
            dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: null })
          }

          // Reload conversations from the backend to ensure fresh data
          const freshConversations = await getConversations()
          dispatch({ type: "SET_CONVERSATIONS", payload: freshConversations })

          return true // Return success
        }
        throw new Error('Delete failed')
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to delete conversation" })
        throw error // Re-throw to trigger error handling in the component
      }
    },

    updateConversationTitle: async (conversationId: string, newTitle: string) => {
      try {
        const success = await apiUpdateConversationTitle(conversationId, newTitle)
        if (success) {
          // Reload conversations from the backend to ensure fresh data
          const freshConversations = await getConversations()
          dispatch({ type: "SET_CONVERSATIONS", payload: freshConversations })

          return true
        }
        throw new Error('Update failed')
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to update conversation title" })
        throw error // Re-throw for component error handling
      }
    },

    clearCurrentConversation: () => {
      dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: null })
      dispatch({ type: "SET_CURRENT_MESSAGES", payload: [] })
    },

    setTyping: (isTyping: boolean) => {
      dispatch({ type: "SET_TYPING", payload: isTyping })
    },

    clearError: () => {
      dispatch({ type: "SET_ERROR", payload: null })
    },

    submitMessageFeedback: async (messageId: string, isPositive: boolean) => {
      if (!state.activeConversationId) {
        dispatch({ type: "SET_ERROR", payload: "No active conversation for feedback" })
        return
      }

      try {
        await apiSubmitFeedback(state.activeConversationId, messageId, isPositive)

        // Update the message feedback state
        dispatch({
          type: "UPDATE_MESSAGE_FEEDBACK",
          payload: {
            messageId,
            feedback: isPositive ? 'positive' : 'negative'
          }
        })
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to submit feedback" })
      }
    }
  }

  const contextValue: RohithContextType = {
    ...state,
    ...contextActions,
    // JARVIS-specific state (Feb 2026: JARVIS is now default mode)
    visualizations: (state as any).visualizations || [],
    predictivePrompts: (state as any).predictivePrompts || [],
    narration: (state as any).narration || null,
    currentMode: (state as any).currentMode || null
  }

  return (
    <RohithContext.Provider value={contextValue}>
      {children}
    </RohithContext.Provider>
  )
}

export function useRohith() {
  const context = useContext(RohithContext)
  if (!context) {
    throw new Error("useRohith must be used within a RohithProvider")
  }
  return context
}

export default RohithContext
