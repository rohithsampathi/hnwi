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
  sendMessage as apiSendMessage,
  createConversation as apiCreateConversation,
  deleteConversation as apiDeleteConversation,
  updateConversationTitle as apiUpdateConversationTitle,
  createMessage,
  submitFeedback as apiSubmitFeedback
} from "@/lib/rohith-api"
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
  deleteConversation: (conversationId: string) => Promise<void>
  updateConversationTitle: (conversationId: string, newTitle: string) => Promise<void>
  clearCurrentConversation: () => void
  setTyping: (isTyping: boolean) => void
  clearError: () => void
  submitMessageFeedback: (messageId: string, isPositive: boolean) => Promise<void>
}

type RohithContextType = RohithContextState & RohithContextActions

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

function rohithReducer(state: RohithContextState, action: RohithAction): RohithContextState {
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

    default:
      return state
  }
}

const RohithContext = createContext<RohithContextType | null>(null)

interface RohithProviderProps {
  children: ReactNode
}

export function RohithProvider({ children }: RohithProviderProps) {
  const [state, dispatch] = useReducer(rohithReducer, initialState)

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
          dispatch({ type: "SET_CURRENT_MESSAGES", payload: conversationData.messages })
        }
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to load conversation" })
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },

    createNewConversation: async (firstMessage: string): Promise<string> => {
      try {

        // Clear any existing messages first
        dispatch({ type: "SET_CURRENT_MESSAGES", payload: [] })

        // Add user message immediately to UI for instant feedback
        const userMessage = createMessage("user", firstMessage)
        dispatch({ type: "ADD_MESSAGE", payload: userMessage })

        dispatch({ type: "SET_TYPING", payload: true })

        // The /api/rohith/start endpoint creates conversation and returns Rohith's response
        const response = await apiCreateConversation(firstMessage)


        // Handle if response is a string (conversation_id) or object with conversation_id
        const conversationId = typeof response === 'string' ? response : response.conversation_id


        // Create new conversation object with properly formatted title
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


        // If the start endpoint returned a response directly, add it
        if (typeof response === 'object' && response.response) {
          const assistantMessage = createMessage("assistant", response.response.content || response.response, {
            hnwiKnowledgeSources: response.context?.relevant_entities?.map((e: any) => e.name) || ["rohith_api"],
            responseTime: response.response?.processing_time_ms || response.system_performance?.processing_time_ms || 1000
          })

          // Add messageId from backend response for feedback
          if (response.message_id) {
            assistantMessage.messageId = response.message_id
          }

          dispatch({ type: "ADD_MESSAGE", payload: assistantMessage })
        } else {
          // Fallback: Load the conversation history to get Rohith's response
          const conversationData = await getConversationHistory(conversationId)
          if (conversationData && conversationData.messages.length > 1) {
            // Find Rohith's response (should be the last message from assistant)
            const assistantMessages = conversationData.messages.filter(msg => msg.role === "assistant")
            if (assistantMessages.length > 0) {
              const rohithResponse = assistantMessages[assistantMessages.length - 1]
              dispatch({ type: "ADD_MESSAGE", payload: rohithResponse })
            }
          }
        }

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

        // Send to API - this will use /api/chat/chat/{conversation_id}
        const response: ConversationResponse = await apiSendMessage(
          message,
          state.activeConversationId
        )

        // Add Rohith's response (Katya's response from backend)
        const assistantMessage = createMessage("assistant", response.response, {
          hnwiKnowledgeSources: response.provenance?.source_nodes || ["chat_api"],
          responseTime: response.response_time
        })

        // Add messageId from backend response for feedback
        if (response.message_id) {
          assistantMessage.messageId = response.message_id
        }

        dispatch({ type: "ADD_MESSAGE", payload: assistantMessage })

        // Update conversation in list with latest message preview
        const updatedConversation = state.conversations.find(
          conv => conv.id === state.activeConversationId
        )

        if (updatedConversation) {
          const lastMessagePreview = response.response.length > 100
            ? response.response.substring(0, 100) + "..."
            : response.response

          const updated: Conversation = {
            ...updatedConversation,
            lastMessage: lastMessagePreview,
            updatedAt: new Date(),
            messageCount: updatedConversation.messageCount + 2
          }
          dispatch({ type: "UPDATE_CONVERSATION", payload: updated })
        }

      } catch (error) {
        try {
          // If direct API call fails, try background sync
          await BackgroundSyncService.queueMessageSend(
            `/api/rohith/message/${state.activeConversationId}`,
            { message, conversationId: state.activeConversationId }
          )

          dispatch({ type: "SET_ERROR", payload: "Message queued for when you're back online." })
        } catch (syncError) {
          dispatch({ type: "SET_ERROR", payload: "Failed to send message. Please try again." })

          // Remove the user message that was optimistically added if both sending and sync failed
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
          const wasViewingDeleted = state.currentConversationId === conversationId
          if (wasViewingDeleted) {
            dispatch({ type: "SET_CURRENT_CONVERSATION", payload: null })
            dispatch({ type: "SET_CURRENT_MESSAGES", payload: [] })
            dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: null })
          }

          // Reload conversations from the backend to ensure fresh data
          const freshConversations = await getConversations()
          dispatch({ type: "SET_CONVERSATIONS", payload: freshConversations })

          // Also clear the active conversation if it was deleted
          if (state.activeConversationId === conversationId) {
            dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: null })
          }


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
    ...contextActions
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