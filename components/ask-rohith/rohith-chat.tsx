// components/ask-rohith/rohith-chat.tsx
// Main chat interface for Ask Rohith

"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "@/contexts/theme-context"
import { useRohith } from "@/contexts/rohith-context"
import { CrownLoader } from "@/components/ui/crown-loader"
import {
  Send,
  Bot,
  TrendingUp,
  BarChart3,
  Sparkles,
  MessageSquare,
  Share2,
  Check
} from "lucide-react"
import ConversationSidebar from "./conversation-sidebar"
import MessageBubble from "./message-bubble"
import TypingIndicator from "./typing-indicator"
import CitationPanel from "./citation-panel"
import { cn } from "@/lib/utils"
import type { RohithChatProps } from "@/types/rohith"
import type { Citation } from "@/lib/parse-dev-citations"
import { shareConversation } from "@/lib/rohith-api"

const QUICK_PROMPTS = [
  {
    icon: TrendingUp,
    text: "Portfolio performance insights"
  },
  {
    icon: BarChart3,
    text: "Latest market opportunities"
  },
  {
    icon: Sparkles,
    text: "Real estate developments"
  },
  {
    icon: Bot,
    text: "Alternative investment trends"
  }
]

export function RohithChat({ conversationId, onNavigate, isSharedView = false }: RohithChatProps) {
  const { theme } = useTheme()
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [showQuickPrompts, setShowQuickPrompts] = useState(true)
  const [showCitationPanel, setShowCitationPanel] = useState(false)
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)

  const {
    // Core state
    conversations,
    activeConversationId,
    currentMessages,
    isLoading,
    isTyping,
    isContextLoaded,
    isConversationsLoading,
    userContext,

    // Actions
    sendMessage,
    selectConversation,
    deleteConversation,
    clearCurrentConversation,
    createNewConversation,
    submitMessageFeedback,
    updateConversationTitle,
    loadConversations
  } = useRohith()

  // Track if user sent a message to decide when to auto-scroll
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(0)

  // Auto scroll to bottom only when new messages arrive (not on every render)
  useEffect(() => {
    // Only scroll if a new message was added (not on initial load or typing indicator)
    if (currentMessages.length > lastMessageCount) {
      setLastMessageCount(currentMessages.length)

      // Only auto-scroll if user just sent a message or it's an assistant response
      if (shouldAutoScroll) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
          setShouldAutoScroll(false)
        }, 100)
      }
    }
  }, [currentMessages.length, shouldAutoScroll, lastMessageCount])

  // Track window width for responsive layout priority
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setWindowWidth(width)

      // Priority 1: Hide sidebar only on small screens (below 768px)
      // Let it shrink naturally on medium screens instead
      if (width < 768) {
        setSidebarCollapsed(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Focus input on component mount (but don't scroll to top)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || message.trim()
    if (!textToSend || isTyping || isLoading) return

    try {
      setMessage("")
      setShowQuickPrompts(false)
      setShouldAutoScroll(true) // Enable auto-scroll when user sends a message

      if (!activeConversationId) {
        // Create new conversation with first message
        await createNewConversation(textToSend)
      } else {
        // Send message to existing conversation
        await sendMessage(textToSend)
      }

      // Focus input after sending (but don't change scroll)
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleQuickPrompt = (promptText: string) => {
    handleSendMessage(promptText)
  }

  const handleNewConversation = () => {
    clearCurrentConversation()
    setShowQuickPrompts(true)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleShareConversation = async (conversationId: string) => {
    try {
      // Get current conversation data from state
      const currentConversation = conversations.find(c => c.id === conversationId)

      // Ensure all message timestamps are proper Date objects
      const messagesWithDates = currentMessages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
      }))

      const conversationData = {
        id: conversationId,
        title: currentConversation?.title || "Conversation",
        userId: userContext?.userId || 'anonymous',
        createdAt: currentConversation?.createdAt || new Date(),
        updatedAt: currentConversation?.updatedAt || new Date(),
        messageCount: currentMessages.length,
        isActive: true,
        messages: messagesWithDates
      }

      // Call the API to store and get share URL
      const response = await fetch('/api/conversations/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // CRITICAL: Send cookies with request
        body: JSON.stringify({
          conversationId,
          userId: userContext?.userId || 'anonymous',
          conversationData
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to share: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.shareUrl) {
        throw new Error("Invalid share response")
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(data.shareUrl)

      // Show link copied state
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)

      toast({
        title: "Link copied!",
        description: "The conversation link has been copied to your clipboard.",
      })
    } catch (error) {
      // Check if it's a clipboard API permission issue
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast({
          title: "Clipboard access denied",
          description: "Please allow clipboard access to copy the share link.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Failed to share",
          description: "Could not create share link. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const getWelcomeMessage = () => {
    if (!userContext) return "Hello! I'm Rohith, your private intelligence ally."

    const { portfolio, personalDetails } = userContext
    return `Hello ${personalDetails.name}! I'm Rohith, your private intelligence ally. I'm aware of your ${portfolio.totalValue} portfolio with ${portfolio.totalAssets} assets and have access to ${portfolio.marketIntelligenceReports} market intelligence analyses. What can I help you with today?`
  }

  // Create stable dependency for citation processing - only assistant messages with content
  const assistantMessages = useMemo(() => {
    return currentMessages
      .filter(msg => msg.role === "assistant" && msg.content && !msg.content.startsWith("..."))
      .map(msg => msg.content)
  }, [currentMessages])

  // Parse all citations globally whenever assistant message content changes (memoized to prevent unnecessary updates)
  const globalCitations = useMemo(() => {
    const allCitations = new Map<string, Citation>()
    let citationNumber = 1

    // Go through all assistant messages to build global citation map
    assistantMessages.forEach(content => {
      // Check for both citation formats: [Dev ID: ...] and [DEVID - ...]
      const hasCitations = content.includes("[Dev ID:") || content.includes("[DEVID -")

      if (hasCitations) {
        // Support both citation formats
        const devIdPatterns = [
          /\[Dev ID:\s*([^\]]+)\]/g,  // Original format: [Dev ID: xyz]
          /\[DEVID\s*-\s*([^\]]+)\]/g  // New format: [DEVID - xyz]
        ]

        devIdPatterns.forEach(pattern => {
          pattern.lastIndex = 0 // Reset pattern
          let match

          while ((match = pattern.exec(content)) !== null) {
            const devId = match[1].trim()

            // Only add if we haven't seen this Dev ID before
            if (!allCitations.has(devId)) {
              allCitations.set(devId, {
                id: devId,
                number: citationNumber++,
                originalText: match[0]
              })
            }
          }
        })
      }
    })

    return allCitations
  }, [assistantMessages])

  // Memoize citations array to prevent unnecessary re-renders
  const citationsArray = useMemo(() => Array.from(globalCitations.values()), [globalCitations])

  const handleCitationClick = (citationId: string) => {
    setSelectedCitationId(citationId)
    setShowCitationPanel(true)
  }

  const handleCloseCitationPanel = () => {
    setShowCitationPanel(false)
    setSelectedCitationId(null)
  }

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      {/* Conversation Sidebar */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <>
            {/* Mobile Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarCollapsed(true)}
            />

            {/* Sidebar - Fixed on mobile, relative on desktop, independent scroll */}
            <motion.div
              initial={{ x: -384 }}
              animate={{ x: 0 }}
              exit={{ x: -384 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed md:relative top-0 left-0 w-96 xl:w-80 lg:w-72 md:w-64 h-screen md:h-full bg-background border-r border-border z-50 md:z-10 flex flex-col flex-shrink-0"
            >
                <ConversationSidebar
                  conversations={conversations}
                  activeConversationId={activeConversationId}
                  onConversationSelect={(id) => {
                    selectConversation(id)
                    // Don't auto-close on desktop
                    if (window.innerWidth < 768) {
                      setSidebarCollapsed(true)
                    }
                  }}
                  onNewConversation={() => {
                    handleNewConversation()
                    // Don't auto-close on desktop
                    if (window.innerWidth < 768) {
                      setSidebarCollapsed(true)
                    }
                  }}
                  onDeleteConversation={deleteConversation}
                  onShareConversation={handleShareConversation}
                  onUpdateConversationTitle={updateConversationTitle}
                  onReloadConversations={loadConversations}
                  isLoading={isConversationsLoading}
                  className="h-full"
                />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area - Always maintains full width, never shrinks */}
      <div className="flex-1 flex flex-col relative min-w-0 max-w-none h-full overflow-hidden">
        {/* Header Actions Bar */}
        <div className="bg-background/95 backdrop-blur-sm border-b border-border/50 flex-shrink-0 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-3">
                {activeConversationId && currentMessages.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShareConversation(activeConversationId)}
                    disabled={linkCopied}
                    className={cn(
                      "h-9 px-4 font-medium transition-all duration-200",
                      linkCopied
                        ? "border-green-500/50 bg-green-500/10 text-green-600"
                        : theme === "dark"
                        ? "border-border/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                        : "border-border/50 hover:border-primary/50 hover:bg-primary hover:text-white"
                    )}
                  >
                    {linkCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Link Copied
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Conversation
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={cn(
                    "h-9 px-4 font-medium transition-all duration-200",
                    theme === "dark"
                      ? "border-border/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                      : "border-border/50 hover:border-primary/50 hover:bg-primary hover:text-white"
                  )}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">
                    {sidebarCollapsed ? "Show History" : "Hide History"}
                  </span>
                  <span className="sm:hidden">History</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area - Scrollable only when there are messages */}
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex-1",
            currentMessages.length > 0 && "overflow-y-auto"
          )}
          style={{
            paddingBottom: currentMessages.length > 0 ? 'calc(180px + env(safe-area-inset-bottom))' : '0'
          }}
        >
          <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
            {isLoading && !isContextLoaded ? (
              <div className="flex flex-col items-center justify-center py-20">
                <CrownLoader size="lg" text="Loading your private intelligence ally..." />
              </div>
            ) : (
              <>
                {/* Welcome Screen */}
                {showQuickPrompts && currentMessages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col items-center text-center space-y-4 py-8"
                  >
                    {/* Hero Section - Compact */}
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                        <Bot className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-2 text-center">
                        <h1 className="text-xl font-semibold text-foreground">
                          Your Intelligence Ally
                        </h1>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          Get instant insights on your portfolio, market trends, and investment opportunities
                        </p>
                      </div>
                    </div>

                    {/* Quick Prompts - Compact Pills with Icons */}
                    <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                      {QUICK_PROMPTS.map((prompt, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                          onClick={() => handleQuickPrompt(prompt.text)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200",
                            "hover:scale-105 hover:shadow-md border",
                            theme === "dark"
                              ? "bg-card/50 border-border/50 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                              : "bg-white/80 border-border/30 text-muted-foreground hover:bg-primary hover:text-white hover:border-primary"
                          )}
                        >
                          <prompt.icon className="h-3 w-3" />
                          {prompt.text}
                        </motion.button>
                      ))}
                    </div>

                    {/* Main Input */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="w-full max-w-xl"
                    >
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleSendMessage()
                        }}
                        className="relative"
                      >
                        <Input
                          ref={inputRef}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Ask Rohith about your investment strategy, market insights, or portfolio analysis..."
                          className={cn(
                            "h-14 pl-6 pr-14 text-base rounded-2xl border-2 transition-all duration-200",
                            "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                            theme === "dark"
                              ? "bg-card/50 border-border/50 focus:bg-card"
                              : "bg-white/90 border-border/30 focus:bg-white"
                          )}
                          disabled={isTyping || isLoading}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-xl"
                          disabled={!message.trim() || isTyping || isLoading}
                        >
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  </motion.div>
                )}

                {/* Chat Messages */}
                {currentMessages.length > 0 && (
                  <div className="space-y-6">
                    <AnimatePresence>
                      {currentMessages.map((msg, index) => (
                        <MessageBubble
                          key={msg.id}
                          message={msg}
                          isLatest={index === currentMessages.length - 1}
                          showContext={true}
                          userName={userContext?.personalDetails?.name || "User"}
                          globalCitations={globalCitations}
                          onCitationClick={handleCitationClick}
                          onFeedbackSubmit={submitMessageFeedback}
                        />
                      ))}
                    </AnimatePresence>

                    {/* Typing Indicator */}
                    <AnimatePresence>
                      {isTyping && (
                        <TypingIndicator
                          message={
                            currentMessages.length === 0
                              ? "Rohith is browsing HNWI knowledge base..."
                              : "Rohith is analyzing specific information..."
                          }
                          showPortfolioContext={isContextLoaded}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Area - When there are messages */}
        {currentMessages.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-background z-20" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="border-t border-border/50 bg-background/95 backdrop-blur-sm">
              <div className="max-w-4xl mx-auto px-6 py-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="relative max-w-2xl mx-auto"
                >
                  <Input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Continue your intelligence discussion with Rohith..."
                    className={cn(
                      "h-12 pl-6 pr-14 text-base rounded-xl border-2 transition-all duration-200",
                      "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                      theme === "dark"
                        ? "bg-card/50 border-border/50 focus:bg-card"
                        : "bg-white/90 border-border/30 focus:bg-white"
                    )}
                    disabled={isTyping || isLoading}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-lg"
                    disabled={!message.trim() || isTyping || isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary-foreground border-t-transparent" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Thick white space between input and footer */}
            <div className="h-12 bg-background"></div>

            {/* Footer */}
            <div className="border-t border-border/30 bg-background">
              <div className="max-w-4xl mx-auto px-6 py-3">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                  <span className="font-medium">Ask Rohith is a personalised learning engine. It gets better with feedback.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer - When no messages */}
        {currentMessages.length === 0 && (
          <div className="fixed bottom-0 left-0 right-0 border-t border-border/30 bg-background z-20" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="max-w-4xl mx-auto px-6 py-3">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                <span className="font-medium">Ask Rohith is a personalised learning engine. It gets better with feedback.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Citation Panel - Third Column - Hide only on mobile (below 768px) */}
      <AnimatePresence mode="wait">
        {showCitationPanel && windowWidth >= 768 && (
          <CitationPanel
            key="desktop-citation-panel"
            citations={citationsArray}
            selectedCitationId={selectedCitationId}
            onClose={handleCloseCitationPanel}
            onCitationSelect={setSelectedCitationId}
          />
        )}
      </AnimatePresence>

      {/* Mobile Citation Panel - Full Screen Overlay - Only on mobile */}
      <AnimatePresence>
        {showCitationPanel && windowWidth < 768 && (
          <div key="mobile-citation-panel" className="fixed inset-0 z-50">
            <CitationPanel
              citations={citationsArray}
              selectedCitationId={selectedCitationId}
              onClose={handleCloseCitationPanel}
              onCitationSelect={setSelectedCitationId}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RohithChat