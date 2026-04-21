// app/share/rohith/[shareId]/shared-conversation-client.tsx
// Client component for displaying a shared Rohith conversation

'use client'

import { useState } from 'react'
import { MessageSquare, Share2, Check, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'

interface SharedMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string | Date
}

interface SharedConversationData {
  id: string
  title: string
  messages: SharedMessage[]
  messageCount?: number
  createdAt?: string | Date
}

interface SharedConversationClientProps {
  conversation: SharedConversationData
  shareId: string
}

export default function SharedConversationClient({ conversation, shareId }: SharedConversationClientProps) {
  const [linkCopied, setLinkCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = window.location.href
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  const messages = conversation.messages || []

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/30 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-gold" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-foreground truncate">
                {conversation.title || 'Shared Conversation'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {messages.length} messages &middot; Ask Rohith
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className={linkCopied
                ? "border-green-500/50 bg-green-500/10 text-green-600"
                : ""
              }
            >
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Link Copied
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </>
              )}
            </Button>
            <a href="https://app.hnwichronicles.com">
              <Button variant="default" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Open App
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === 'user' ? (
                <div className="mb-6">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-2 font-mono">
                    Query
                  </div>
                  <p className="text-base text-foreground/80 leading-relaxed">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/20">
                    <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                    <div className="text-[10px] uppercase tracking-wider text-gold/80 font-mono">
                      Rohith
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-code:text-gold prose-code:bg-gold/10 prose-code:px-1 prose-code:rounded">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="text-foreground leading-relaxed text-[15px] mb-3">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-foreground">{children}</strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-1.5 my-3">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside space-y-1.5 my-3">{children}</ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-foreground text-[15px] leading-relaxed">{children}</li>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-bold text-foreground mt-6 mb-3">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl font-bold text-foreground mt-5 mb-2.5">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">{children}</h3>
                        ),
                        code: ({ children, className }) => {
                          const isInline = !className
                          return isInline ? (
                            <code className="text-xs font-mono text-gold bg-gold/10 px-1.5 py-0.5 rounded">
                              {children}
                            </code>
                          ) : (
                            <code className={className}>{children}</code>
                          )
                        },
                        pre: ({ children }) => (
                          <pre className="bg-surface border border-border rounded-lg p-4 overflow-x-auto my-3">
                            {children}
                          </pre>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border/20 text-center">
          <p className="text-xs text-muted-foreground/60">
            Shared from HNWI Chronicles &middot; Ask Rohith Intelligence System
          </p>
        </div>
      </main>
    </div>
  )
}
