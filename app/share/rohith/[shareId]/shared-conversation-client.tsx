// app/share/rohith/[shareId]/shared-conversation-client.tsx
// Client component for displaying a shared Audelle conversation

'use client'

import { useState } from 'react'
import { MessageSquare, Share2, Check, ArrowLeft, Database, AlertTriangle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import VisualizationEngine, { type VisualizationCommand } from '@/components/ask-rohith-jarvis/VisualizationEngine'

interface SharedMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string | Date
  visualizations?: VisualizationCommand[]
}

interface SharedConversationData {
  id: string
  title: string
  messages: SharedMessage[]
  messageCount?: number
  createdAt?: string | Date
  sourceBasis?: string[]
  whatAudelleUsed?: string[]
  whatAskRohithUsed?: string[]
  caveats?: string[]
  positioningLine?: string
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
  const sourceBasis = (conversation.sourceBasis || []).filter(Boolean)
  const shelvesUsed = (conversation.whatAudelleUsed || conversation.whatAskRohithUsed || []).filter(Boolean)
  const caveats = (conversation.caveats || []).filter(Boolean)
  const displaySources = sourceBasis.slice(0, 6)
  const remainingSourceCount = Math.max(0, sourceBasis.length - displaySources.length)

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
                {messages.length} messages &middot; Audelle Conversation
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
        {(shelvesUsed.length > 0 || sourceBasis.length > 0 || caveats.length > 0) && (
          <section className="mb-10 border-b border-border/20 pb-6">
            {conversation.positioningLine && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {conversation.positioningLine}
              </p>
            )}
            <div className="grid gap-5 md:grid-cols-3">
              {shelvesUsed.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-gold/80 font-mono mb-2">
                    <Database className="h-3.5 w-3.5" />
                    Used
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {shelvesUsed.slice(0, 8).map((item) => (
                      <span key={item} className="text-xs text-foreground/80 border border-border/40 px-2 py-1 rounded">
                        {item.replaceAll('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {displaySources.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-gold/80 font-mono mb-2">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Source basis
                  </div>
                  <div className="space-y-1.5">
                    {displaySources.map((source) => {
                      let label = source
                      try {
                        label = new URL(source).hostname.replace(/^www\./, '')
                      } catch {
                        label = source
                      }
                      return (
                        <a
                          key={source}
                          href={source}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-xs text-foreground/80 hover:text-gold truncate"
                        >
                          {label}
                        </a>
                      )
                    })}
                    {remainingSourceCount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        +{remainingSourceCount} more sources in the packet
                      </div>
                    )}
                  </div>
                </div>
              )}

              {caveats.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-gold/80 font-mono mb-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Caveats
                  </div>
                  <ul className="space-y-1.5">
                    {caveats.slice(0, 4).map((item) => (
                      <li key={item} className="text-xs text-foreground/75 leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

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
                      Audelle
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
                  {message.visualizations && message.visualizations.length > 0 && (
                    <div className="mt-4">
                      <VisualizationEngine commands={message.visualizations} inline />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border/20 text-center">
          <p className="text-xs text-muted-foreground/60">
            Shared from HNWI Chronicles &middot; Audelle by HNWI Chronicles
          </p>
        </div>
      </main>
    </div>
  )
}
