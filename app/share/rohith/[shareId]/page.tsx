// app/share/rohith/[shareId]/page.tsx
// Public page for viewing shared Rohith conversations

"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CrownLoader } from "@/components/ui/crown-loader"
import { MetaTags } from "@/components/meta-tags"
import MessageBubble from "@/components/ask-rohith/message-bubble"
import CitationPanel from "@/components/ask-rohith/citation-panel"
import { PageHeaderWithBack } from "@/components/ui/back-button"
import {
  Bot,
  Lock,
  ExternalLink,
  Share2,
  MessageSquare,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getSharedConversation } from "@/lib/rohith-api"
import type { ConversationWithMessages } from "@/types/rohith"
import type { Citation } from "@/lib/parse-dev-citations"

// Access gate component
function AccessGate({ onGetAccess }: { onGetAccess: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
    >
      <div className="max-w-md p-8 text-center space-y-6 bg-card rounded-xl border border-border shadow-xl">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Lock className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">Get Full Access</h2>
          <p className="text-muted-foreground">
            To interact with Rohith and access all HNWI Chronicles features, you need a premium account.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={onGetAccess}
            className="w-full gap-2"
            size="lg"
          >
            <Sparkles className="h-4 w-4" />
            View Pricing Plans
            <ExternalLink className="h-3 w-3" />
          </Button>

          <p className="text-xs text-muted-foreground">
            Join elite investors with exclusive market intelligence
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function SharedConversationPage() {
  const params = useParams()
  const router = useRouter()
  const shareId = params.shareId as string

  const [conversation, setConversation] = useState<ConversationWithMessages | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAccessGate, setShowAccessGate] = useState(false)
  const [showCitationPanel, setShowCitationPanel] = useState(false)
  const [globalCitations, setGlobalCitations] = useState<Map<string, Citation>>(new Map())
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null)

  useEffect(() => {
    loadSharedConversation()
  }, [shareId])

  // Parse all citations globally whenever conversation changes
  useEffect(() => {
    if (!conversation) return

    const allCitations = new Map<string, Citation>()
    let citationNumber = 1

    // Go through all messages in order to build global citation map
    conversation.messages.forEach(msg => {
      // Check for both citation formats: [Dev ID: ...] and [DEVID - ...]
      const hasCitations = msg.role === "assistant" && (msg.content.includes("[Dev ID:") || msg.content.includes("[DEVID -"))

      if (hasCitations) {
        // Support both citation formats
        const devIdPatterns = [
          /\[Dev ID:\s*([^\]]+)\]/g,  // Original format: [Dev ID: xyz]
          /\[DEVID\s*-\s*([^\]]+)\]/g  // New format: [DEVID - xyz]
        ]

        devIdPatterns.forEach(pattern => {
          pattern.lastIndex = 0 // Reset pattern
          let match

          while ((match = pattern.exec(msg.content)) !== null) {
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

    setGlobalCitations(allCitations)
  }, [conversation])

  const loadSharedConversation = async () => {
    try {
      setIsLoading(true)
      const data = await getSharedConversation(shareId)

      if (data) {
        setConversation(data)
      } else {
        setError("Conversation not found or has expired")
      }
    } catch (err) {
      setError("Failed to load conversation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNavigation = (route: string) => {
    // Show access gate for any navigation attempt
    setShowAccessGate(true)
  }

  const handleGetAccess = () => {
    // Open pricing page in new tab
    window.open("https://www.hnwichronicles.com/pricing", "_blank")
  }

  const handleBack = () => {
    // Go to main website
    window.location.href = "https://www.hnwichronicles.com"
  }

  const handleCitationClick = (citationId: string) => {
    setSelectedCitationId(citationId)
    setShowCitationPanel(true)
  }

  const handleCloseCitationPanel = () => {
    setShowCitationPanel(false)
    setSelectedCitationId(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <CrownLoader size="lg" text="Loading conversation..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Conversation Not Found</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={handleBack} variant="outline">
            Return to Homepage
          </Button>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return null
  }

  return (
    <>
      <MetaTags
        title={`${conversation.title} - Shared Rohith Conversation | HNWI Chronicles`}
        description="View this exclusive conversation with Rohith, your private intelligence ally for HNWI investment insights."
        image="https://app.hnwichronicles.com/images/ask-rohith-og.png"
        url={`https://app.hnwichronicles.com/share/rohith/${shareId}`}
      />

      <div className="h-screen bg-background flex overflow-hidden">
        {/* Access Gate Overlay */}
        <AnimatePresence>
          {showAccessGate && (
            <AccessGate onGetAccess={handleGetAccess} />
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Header */}
          <div className="sticky top-0 z-40 bg-background border-b border-border">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
              <div className="flex items-center justify-between">
                <PageHeaderWithBack onBack={handleBack} />

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Share2 className="h-4 w-4" />
                    <span>Shared Conversation</span>
                  </div>

                  <Button
                    onClick={handleGetAccess}
                    size="sm"
                    className="gap-2"
                  >
                    <Lock className="h-3 w-3" />
                    Get Access
                  </Button>
                </div>
              </div>

              {/* Conversation Title */}
              <div className="mt-6 flex items-center space-x-3">
                <div className="p-2 md:p-3 rounded-xl bg-primary/10">
                  <Bot className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">{conversation.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    {conversation.messages.length} messages • Shared {new Date(conversation.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages - Independent Scroll with calculated height */}
          <ScrollArea className="flex-1 pb-16">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-4 md:space-y-6">
              <AnimatePresence>
                {conversation.messages.map((msg, index) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isLatest={index === conversation.messages.length - 1}
                    showContext={false}
                    userName="User"
                    globalCitations={globalCitations}
                    onCitationClick={handleCitationClick}
                  />
                ))}
              </AnimatePresence>

              {/* CTA at end of conversation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 p-6 bg-primary/5 rounded-xl border border-primary/20 text-center space-y-4"
              >
                <div className="flex justify-center">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">
                    Continue the Conversation with Rohith
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Get your own private intelligence ally with full HNWI knowledge base access and personalized portfolio insights.
                  </p>
                </div>

                <Button
                  onClick={handleGetAccess}
                  className="gap-2"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4" />
                  Start Your Journey
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </motion.div>
            </div>
          </ScrollArea>

          {/* Footer - Fixed at bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border py-3 z-30">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-4">
                <span className="text-xs text-muted-foreground">Rohith accesses HNWI Knowledge Base</span>
                <Separator orientation="vertical" className="h-3 hidden sm:block" />
                <span className="text-xs text-muted-foreground">100% private conversations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Citation Panel - Desktop: Third Column with independent scroll, Mobile: Full Screen Overlay */}
        <AnimatePresence>
          {showCitationPanel && (
            <CitationPanel
                citations={Array.from(globalCitations.values())}
                selectedCitationId={selectedCitationId}
                onClose={handleCloseCitationPanel}
                onCitationSelect={setSelectedCitationId}
              />
          )}
        </AnimatePresence>
      </div>
    </>
  )
}