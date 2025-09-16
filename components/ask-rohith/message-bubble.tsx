// components/ask-rohith/message-bubble.tsx
// Individual message bubble for chat interface

"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/contexts/theme-context"
import { Bot, User, Clock, BookOpen, Copy, Check, FileText, ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { parseDevCitations } from "@/lib/parse-dev-citations"
import type { Message } from "@/types/rohith"
import type { Citation } from "@/lib/parse-dev-citations"

interface MessageBubbleProps {
  message: Message
  isLatest?: boolean
  showContext?: boolean
  userName?: string
  globalCitations?: Map<string, Citation>
  onCitationClick?: (citationId: string) => void
  onFeedbackSubmit?: (messageId: string, isPositive: boolean) => Promise<void>
}

export function MessageBubble({
  message,
  isLatest = false,
  showContext = false,
  userName = "You",
  globalCitations,
  onCitationClick,
  onFeedbackSubmit
}: MessageBubbleProps) {
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)
  const [formattedContent, setFormattedContent] = useState<string>(message.content)
  const [messageCitations, setMessageCitations] = useState<Citation[]>([])
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"

  // Format message with global citation numbers
  useEffect(() => {
    if (isAssistant && globalCitations && message.content.includes("[Dev ID:")) {
      let formatted = message.content
      const citationsInMessage: Citation[] = []

      // Replace each Dev ID with its global citation number
      const devIdPattern = /\[Dev ID:\s*([^\]]+)\]/g
      let match

      while ((match = devIdPattern.exec(message.content)) !== null) {
        const devId = match[1].trim()
        const citation = globalCitations.get(devId)

        if (citation) {
          // Add to this message's citations list
          if (!citationsInMessage.find(c => c.id === devId)) {
            citationsInMessage.push(citation)
          }

          // Replace with citation number
          formatted = formatted.replace(
            match[0],
            `<citation data-id="${devId}" data-number="${citation.number}">[${citation.number}]</citation>`
          )
        }
      }

      setFormattedContent(formatted)
      setMessageCitations(citationsInMessage)
    } else {
      setFormattedContent(message.content)
      setMessageCitations([])
    }
  }, [message.content, isAssistant, globalCitations])

  // Format timestamp
  const formatTime = (date: Date | string) => {
    // Ensure we have a valid Date object
    const dateObj = date instanceof Date ? date : new Date(date)

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Copy message content
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // Silently fail if copy fails
    }
  }

  // Handle feedback submission
  const handleFeedback = async (isPositive: boolean) => {
    if (!onFeedbackSubmit || isSubmittingFeedback) return

    // Use messageId if available, otherwise use message id as fallback
    const feedbackId = message.messageId || message.id

    try {
      setIsSubmittingFeedback(true)
      await onFeedbackSubmit(feedbackId, isPositive)
    } catch (error) {
      // Silently fail if feedback submission fails
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const bubbleVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      variants={bubbleVariants}
      initial="initial"
      animate="animate"
      className={cn(
        "flex mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "flex max-w-[80%] md:max-w-[70%]",
        isUser ? "flex-row-reverse space-x-reverse space-x-3" : "flex-row space-x-3"
      )}>
        {/* Avatar */}
        <Avatar className="w-8 h-8 flex-shrink-0">
          {isUser ? (
            <>
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </>
          ) : (
            <>
              <AvatarImage src="/Rohith.ico" alt="Rohith" />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </>
          )}
        </Avatar>

        {/* Message Content */}
        <div className={cn(
          "flex flex-col",
          isUser ? "items-end" : "items-start"
        )}>
          {/* Message Bubble */}
          <div className="group relative">
            <div className={cn(
              "px-4 py-3 rounded-2xl shadow-sm",
              isUser
                ? `${isUser ? "rounded-tr-md" : "rounded-tl-md"} bg-primary text-primary-foreground`
                : `rounded-tl-md ${theme === "dark"
                  ? "bg-card border border-border/50"
                  : "bg-muted/50 border border-border/30"
                }`
            )}>
              <div className="prose prose-sm max-w-none">
                {isAssistant && messageCitations.length > 0 ? (
                  <div>
                    <div
                      className={cn(
                        "text-sm leading-relaxed whitespace-pre-wrap m-0",
                        "text-foreground"
                      )}
                      dangerouslySetInnerHTML={{
                        __html: formattedContent.replace(
                          /<citation data-id="([^"]+)" data-number="(\d+)">\[(\d+)\]<\/citation>/g,
                          (match, id, number) => {
                            return `<button
                              class="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors mx-0.5 cursor-pointer"
                              data-citation-id="${id}"
                            >[${number}]</button>`
                          }
                        )
                      }}
                      onClick={(e) => {
                        const target = e.target as HTMLElement
                        if (target.tagName === 'BUTTON' && target.hasAttribute('data-citation-id')) {
                          const citationId = target.getAttribute('data-citation-id')
                          if (citationId && onCitationClick) {
                            onCitationClick(citationId)
                          }
                        }
                      }}
                    />
                    {/* Citation indicator */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Contains citations: {messageCitations.map(c => `[${c.number}]`).join(', ')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className={cn(
                    "text-sm leading-relaxed whitespace-pre-wrap m-0",
                    isUser ? "text-primary-foreground" : "text-foreground"
                  )}>
                    {message.content}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className={cn(
                "absolute -top-8 right-0 opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md px-1 py-0.5 shadow-sm",
                isUser ? "bg-primary/20" : "bg-background/80 border border-border/20"
              )}>
                {/* Feedback buttons or submitted state - for all assistant messages */}
                {isAssistant && onFeedbackSubmit && (
                  <>
                    {message.feedbackSubmitted ? (
                      <span className={cn(
                        "px-3 py-1 text-xs font-medium rounded-full",
                        message.feedbackSubmitted === 'positive'
                          ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30"
                          : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30"
                      )}>
                        Feedback Submitted
                      </span>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                          onClick={() => handleFeedback(true)}
                          disabled={isSubmittingFeedback}
                          title="Helpful response"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => handleFeedback(false)}
                          disabled={isSubmittingFeedback}
                          title="Not helpful"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </>
                )}

                {/* Copy button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  onClick={handleCopy}
                  title="Copy message"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Message Context (for assistant messages) */}
          {showContext && isAssistant && message.context && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 text-xs text-muted-foreground space-y-1"
            >
              {/* HNWI Knowledge Sources */}
              {message.context.hnwiKnowledgeSources && message.context.hnwiKnowledgeSources.length > 0 && (
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{message.context.hnwiKnowledgeSources.length} HNWI knowledge sources</span>
                </div>
              )}

              {/* Response time */}
              {message.context.responseTime && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{(message.context.responseTime / 1000).toFixed(1)}s</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Timestamp */}
          <div className={cn(
            "mt-1 text-xs text-muted-foreground/70",
            isUser ? "text-right" : "text-left"
          )}>
            {formatTime(message.timestamp)}
            {isAssistant && (
              <span className="ml-2 font-medium text-primary">Rohith</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MessageBubble