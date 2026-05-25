// app/share/rohith/[shareId]/shared-conversation-client.tsx
// Client component for displaying a shared Audelle conversation

'use client'

import { isValidElement, useMemo, useState } from 'react'
import { MessageCircle, Share2, Check, ArrowLeft, User, Clock, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import VisualizationEngine, { type VisualizationCommand } from '@/components/ask-rohith-jarvis/VisualizationEngine'
import { CitationText } from '@/components/elite/citation-text'
import { EliteCitationPanel } from '@/components/elite/elite-citation-panel'
import { Layout } from '@/components/layout/layout'
import { extractDevIds, type Citation } from '@/lib/parse-dev-citations'

interface SharedMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string | Date
  visualizations?: VisualizationCommand[]
  metadata?: Record<string, any>
  context?: {
    responseTime?: number
    sourceDocuments?: Array<Record<string, any>>
  }
}

interface SharedPacket {
  packet_id?: string
  source_urls?: string[]
  devids?: string[]
  witnesses?: Array<Record<string, any>>
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
  packets?: SharedPacket[]
}

interface SharedConversationClientProps {
  conversation: SharedConversationData
  shareId: string
}

function sourceLabel(count: number): string {
  return `${count} source${count === 1 ? '' : 's'}`
}

function thoughtTimeLabel(milliseconds?: number): string {
  if (!milliseconds || milliseconds <= 0) return ''
  const seconds = milliseconds / 1000
  return `Thought for ${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)}s`
}

function normalizeAudelleChatText(content: string): string {
  const text = content || ''
  return text
    .replace(/^\s*(?:\*\*)?\s*(Bottom line|Direct answer|Evidence basis|Evidence foundation|Decision implication|Missing proof|Next move):\s*(?:\*\*)?\s*\n?/gim, '')
    .replace(/\bsource rows surface\b/gi, 'evidence surfaces')
    .replace(/\bsource rows show\b/gi, 'evidence shows')
    .replace(/\bsource rows?\b/gi, 'evidence')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function moveSourceRowsToInlineCitations(content: string): string {
  return String(content || '')
    .replace(
      /(?:\n+\s*)?(?:source\s+rows?|evidence\s+rows?|source\s+basis|evidence)\s*:\s*((?:\s*\[(?:Dev\s*ID|DEVID|Article\s*ID)\s*[:\-–—]\s*[^\]\r\n]+\])+)\s*$/gim,
      ' $1'
    )
}

function getDevelopmentCitationId(source: Record<string, any>): string {
  if (!source || source.type === 'kg_intelligence') return ''
  return String(
    source.dev_id ||
    source.development_id ||
    source.source_development_id ||
    source.id ||
    ''
  ).trim()
}

function cleanSharedMessageContent(content: string): string {
  return normalizeAudelleChatText(moveSourceRowsToInlineCitations(content))
    .replace(/\[object Object\]/gi, '')
    .replace(/\s*that\s+data\s+point\s+(?:sits\s+)?(?:is\s+)?not\s+(?:yet\s+)?proven\s+by\s+(?:this|these)\s+sources?\.?\s*/gi, ' ')
    .replace(/\bthe\s+2026\s+record\s+shows\b/gi, 'the 2026 evidence shows')
    .replace(/\bthe\s+record\s+shows\b/gi, 'the evidence shows')
    .replace(/\bthe\s+record\s+gives\b/gi, 'the evidence gives')
    .replace(/\bcurrent\s+public\s+record\b/gi, 'current public sources')
    .replace(/\bpublic\s+record\b/gi, 'public sources')
    .replace(/\bpresent\s+evidence\s+packet\b/gi, 'sources here')
    .replace(/\bcurrent\s+evidence\s+packet\b/gi, 'sources here')
    .replace(/\bevidence\s+packet\b/gi, 'sources')
    .replace(/\bverified\s+packet\b/gi, 'verified sources')
    .replace(/\bthis\s+sources\b/gi, 'these sources')
    .replace(/—/g, ', ')
    .replace(/–/g, '-')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function reactNodeToText(node: any): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(reactNodeToText).join('')
  if (isValidElement(node)) return reactNodeToText((node.props as any)?.children)
  return ''
}

function visibleVisualizations(message: SharedMessage): VisualizationCommand[] {
  const visualRequested = /chart|graph|visual|visualize|heatmap|timeline|source packet|evidence packet|show me/i.test(message.content || '')
  return (message.visualizations || []).filter((command: any) => {
    const title = String(command?.data?.title || '').toLowerCase()
    if (title === 'native evidence packet' || title === 'risk assessment') return false
    if (command?.type === 'risk_heatmap' && !visualRequested && !command?.data?.show_by_default) return false
    return true
  })
}

function visualizationSignature(command: VisualizationCommand): string {
  const data = command?.data || {}
  const sections = Array.isArray(data.sections)
    ? data.sections.map((section: any) => ({
        kind: section?.kind,
        title: section?.title,
        rows: Array.isArray(section?.rows)
          ? section.rows.map((row: any) => Array.isArray(row) ? row.join('|') : `${row?.label || ''}:${row?.value || ''}`)
          : [],
      }))
    : []
  return JSON.stringify({ type: command.type, title: data.title || '', sections })
}

function firstSourceUrl(source: Record<string, any>): string {
  const urls = source?.source_urls
  if (Array.isArray(urls) && urls.length > 0) return String(urls[0] || '')
  return String(source?.source || source?.url || source?.source_url || '')
}

function publicEvidenceLabel(value: any): string {
  const raw = String(value || '').trim()
  if (!raw) return 'Audelle source evidence'
  const normalized = raw.toLowerCase().replace(/[_-]+/g, ' ')
  if (normalized.includes('kgv21') || normalized.includes('castle brief')) return 'Castle brief evidence'
  if (normalized.includes('decision memo')) return 'Decision memo evidence'
  if (normalized.includes('web validation') || normalized.includes('official')) return 'Public validation source'
  if (normalized.includes('transaction')) return 'Transaction evidence'
  if (normalized.includes('corridor')) return 'Corridor intelligence'
  if (normalized.includes('claim')) return 'Claim evidence'
  if (normalized.includes('library')) return 'Library evidence'
  return raw
}

function packetWitnessCitationIds(witness: Record<string, any>): string[] {
  const ids = new Set<string>()
  ;(witness.devids || []).forEach((value: any) => {
    const id = String(value || '').trim()
    if (id) ids.add(id)
  })
  const metadata = witness.metadata && typeof witness.metadata === 'object' ? witness.metadata : {}
  ;['source_development_id', 'devid', 'dev_id', 'mongo_id', 'source_record_id'].forEach((key) => {
    const id = String(metadata[key] || witness[key] || '').trim()
    if (id) ids.add(id)
  })
  const witnessId = String(witness.witness_id || '').trim()
  if (witnessId && /^(?:memo_audit_|[a-f0-9]{24}$)/i.test(witnessId)) {
    ids.add(witnessId)
  }
  return Array.from(ids)
}

function makePreloadedDevelopment(id: string, source: Record<string, any>, fallbackSummary = '') {
  const metadata = source.metadata && typeof source.metadata === 'object' ? source.metadata : {}
  const title = String(
    source.title ||
    source.name ||
    metadata.display_title ||
    metadata.case_title ||
    `Evidence ${id}`
  )
  const summary = String(
    source.summary ||
    source.description ||
    source.content ||
    fallbackSummary ||
    title
  )
  const url = firstSourceUrl(source)

  return {
    id,
    title,
    description: String(source.description || summary || title).slice(0, 600),
    industry: publicEvidenceLabel(source.industry || source.witness_type || source.type || source.shelf_key || 'Audelle Evidence'),
    product: publicEvidenceLabel(source.product || metadata.source_type || source.shelf_key || source.type || 'Audelle Evidence'),
    date: String(source.updated_at || source.date || source.created_at || ''),
    summary,
    url,
    numerical_data: Array.isArray(source.numerical_data) ? source.numerical_data : [],
  }
}

function sourceQuality(source: ReturnType<typeof makePreloadedDevelopment>) {
  let score = 0
  if (source.title && !source.title.startsWith('Evidence ')) score += 2
  if (source.summary && source.summary !== source.title) score += Math.min(8, Math.floor(source.summary.length / 80))
  if (source.description && source.description !== source.title) score += 2
  if (source.url) score += 1
  if (source.numerical_data?.length) score += 2
  if (/part of the public-safe Audelle evidence packet/i.test(source.summary || '')) score -= 4
  return score
}

export default function SharedConversationClient({ conversation, shareId }: SharedConversationClientProps) {
  const [linkCopied, setLinkCopied] = useState(false)
  const [citationPanelOpen, setCitationPanelOpen] = useState(false)
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null)

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

  const messages = useMemo(() => conversation.messages || [], [conversation.messages])
  const packets = useMemo(
    () => Array.isArray(conversation.packets) ? conversation.packets : [],
    [conversation.packets]
  )

  const { citations, citationMap } = useMemo(() => {
    const nextCitations: Citation[] = []
    const nextMap = new Map<string, number>()
    let citationNumber = 1
    const add = (value: string, originalText?: string) => {
      const id = String(value || '').trim()
      if (!id || nextMap.has(id)) return
      nextMap.set(id, citationNumber)
      nextCitations.push({
        id,
        number: citationNumber,
        originalText: originalText || `[DEVID - ${id}]`,
      })
      citationNumber += 1
    }

    messages.forEach((message) => {
      if (message.role !== 'assistant') return
      extractDevIds(cleanSharedMessageContent(message.content)).forEach((devId) => add(devId))
      message.context?.sourceDocuments?.forEach((source) => {
        const developmentId = getDevelopmentCitationId(source)
        if (developmentId) add(developmentId)
      })
    })

    packets.forEach((packet) => {
      ;(packet.devids || []).forEach((devId) => add(devId))
    })

    return { citations: nextCitations, citationMap: nextMap }
  }, [messages, packets])

  const preloadedSources = useMemo(() => {
    const sources = new Map<string, ReturnType<typeof makePreloadedDevelopment>>()
    const add = (id: string, source: Record<string, any>, fallbackSummary = '') => {
      const cleaned = String(id || '').trim()
      if (!cleaned) return
      const next = makePreloadedDevelopment(cleaned, source, fallbackSummary)
      const existing = sources.get(cleaned)
      if (!existing || sourceQuality(next) > sourceQuality(existing)) {
        sources.set(cleaned, next)
      }
    }

    messages.forEach((message) => {
      message.context?.sourceDocuments?.forEach((source) => {
        const developmentId = getDevelopmentCitationId(source)
        if (developmentId) add(developmentId, source)
      })
    })

    packets.forEach((packet) => {
      packet.witnesses?.forEach((witness) => {
        packetWitnessCitationIds(witness).forEach((developmentId) => {
          add(developmentId, witness)
        })
      })
      packet.devids?.forEach((developmentId) => {
        add(developmentId, { title: `Evidence ${developmentId}`, summary: 'This source is part of the public-safe Audelle evidence packet.' })
      })
    })

    return sources
  }, [messages, packets])

  const visibleVisualizationsByMessageId = useMemo(() => {
    const seenDataExplainers = new Set<string>()
    const next = new Map<string, VisualizationCommand[]>()

    messages.forEach((message) => {
      const visualizations = visibleVisualizations(message).filter((command) => {
        if (command.type !== 'data_explainer') return true
        const signature = visualizationSignature(command)
        if (seenDataExplainers.has(signature)) return false
        seenDataExplainers.add(signature)
        return true
      })
      next.set(message.id, visualizations)
    })

    return next
  }, [messages])

  const getMessagePacket = (message: SharedMessage) => {
    const packetId = message.metadata?.native_packet_id
    return packetId ? packets.find((packet) => packet.packet_id === packetId) : undefined
  }

  const getMessageSourceCount = (message: SharedMessage) => {
    return getMessageCitationIds(message).length
  }

  const getMessageCitationIds = (message: SharedMessage) => {
    const ids = new Set<string>()
    if (message.role !== 'assistant') return []
    extractDevIds(cleanSharedMessageContent(message.content)).forEach((devId) => ids.add(devId))
    message.context?.sourceDocuments?.forEach((source) => {
      const developmentId = getDevelopmentCitationId(source)
      if (developmentId) ids.add(developmentId)
    })
    const packet = getMessagePacket(message)
    packet?.devids?.forEach((devId) => ids.add(devId))
    return Array.from(ids)
  }

  const openFirstMessageCitation = (message: SharedMessage) => {
    const [firstCitationId] = getMessageCitationIds(message)
    if (!firstCitationId) return
    setSelectedCitationId(firstCitationId)
    setCitationPanelOpen(true)
  }

  const handleCitationClick = (citationId: string) => {
    setSelectedCitationId(citationId)
    setCitationPanelOpen(true)
  }

  return (
    <Layout
      title=""
      onNavigate={() => undefined}
      currentPage="ask-audelle"
      isUserAuthenticated={false}
      disableNavigation
    >
      <div className="flex min-h-[calc(var(--app-viewport-height,100dvh)-190px)] flex-col gap-4 text-foreground">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <MessageCircle className="h-3.5 w-3.5 text-primary" />
              <span>{messages.length} messages</span>
              <span>&middot;</span>
              <span>Audelle Conversation</span>
            </div>
            <h2 className="truncate text-lg font-semibold text-foreground">
              {conversation.title || 'Shared Conversation'}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
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

      {/* Messages */}
      <main className="mx-auto w-full max-w-4xl py-4">
        <div className="space-y-6">
          {messages.map((message) => {
            const messageVisualizations = visibleVisualizationsByMessageId.get(message.id) || []
            return (
            <div key={message.id}>
              {message.role === 'user' ? (
                <div className="mb-8 flex items-start justify-end gap-3">
                  <div className="flex max-w-[85%] flex-col items-end md:max-w-[70%]">
                    <div className="mb-1 text-xs font-medium text-muted-foreground">You</div>
                    <div className="rounded-3xl rounded-tr-md bg-muted/80 px-5 py-3 text-[15px] leading-relaxed text-foreground shadow-sm">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border/40 bg-muted text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                </div>
              ) : (
                <div className="mb-9 flex items-start gap-3">
                  <div className="mt-5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-gold">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-semibold text-foreground">Audelle</span>
                    </div>
                    <div className="max-w-[760px] text-[15px] leading-relaxed text-foreground">
                      <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-code:text-gold prose-code:bg-gold/10 prose-code:px-1 prose-code:rounded">
                              <ReactMarkdown
                                components={{
                            p: ({ children }) => {
                              const cleanedText = cleanSharedMessageContent(reactNodeToText(children))
                              return (
                                <p className="mb-4 text-foreground leading-relaxed text-[15px] last:mb-0">
                                  <CitationText
                                    text={cleanedText}
                                    onCitationClick={handleCitationClick}
                                    citationMap={citationMap}
                                    options={{
                                      convertMarkdownBold: true,
                                      preserveLineBreaks: true,
                                      trim: true,
                                    }}
                                  />
                                </p>
                              )
                            },
                            strong: ({ children }) => (
                              <strong className="font-semibold text-foreground">{children}</strong>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside space-y-1.5 my-3">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside space-y-1.5 my-3">{children}</ol>
                            ),
                            li: ({ children }) => {
                              const cleanedText = cleanSharedMessageContent(reactNodeToText(children))
                              return (
                                <li className="text-foreground text-[15px] leading-relaxed">
                                  <CitationText
                                    text={cleanedText}
                                    onCitationClick={handleCitationClick}
                                    citationMap={citationMap}
                                    options={{
                                      convertMarkdownBold: true,
                                      preserveLineBreaks: false,
                                      trim: true,
                                    }}
                                  />
                                </li>
                              )
                            },
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
                            table: ({ children }) => (
                              <div className="my-4 overflow-x-auto rounded-xl border border-border/40 bg-card/40">
                                <table className="min-w-full border-collapse text-left text-sm">{children}</table>
                              </div>
                            ),
                            thead: ({ children }) => (
                              <thead className="border-b border-border/40 bg-muted/40">{children}</thead>
                            ),
                            th: ({ children }) => (
                              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="border-t border-border/30 px-3 py-2 align-top text-sm text-foreground/90">
                                {children}
                              </td>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="my-4 border-l-2 border-gold/50 pl-4 text-foreground/85">
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {cleanSharedMessageContent(message.content)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  {(getMessageSourceCount(message) > 0 || thoughtTimeLabel(message.metadata?.processing_time_ms || message.context?.responseTime)) && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/70">
                      {getMessageSourceCount(message) > 0 && (
                        <button
                          type="button"
                          onClick={() => openFirstMessageCitation(message)}
                          className="inline-flex items-center gap-1 hover:text-gold hover:underline"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          {sourceLabel(getMessageSourceCount(message))}
                        </button>
                      )}
                      {thoughtTimeLabel(message.metadata?.processing_time_ms || message.context?.responseTime) && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {thoughtTimeLabel(message.metadata?.processing_time_ms || message.context?.responseTime)}
                        </span>
                      )}
                    </div>
                  )}
                  {messageVisualizations.length > 0 && (
                    <div className="mt-3 max-w-[720px]">
                      <VisualizationEngine commands={messageVisualizations} inline />
                    </div>
                  )}
                  </div>
                </div>
              )}
            </div>
            )
          })}
        </div>

        {citations.length > 0 && (
          <details id="conversation-evidence" className="mt-10 rounded-2xl border border-border/30 bg-card/50 px-4 py-3 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-foreground">
              <BookOpen className="h-4 w-4 text-gold" />
              Source basis
            </summary>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {citations.map((citation) => (
                <button
                  key={citation.id}
                  type="button"
                  onClick={() => handleCitationClick(citation.id)}
                  title={`Citation ${citation.number}`}
                  aria-label={`Open citation ${citation.number}`}
                  className="rounded border border-border/40 px-2 py-1 text-xs text-foreground/80 hover:border-gold/50 hover:text-gold"
                >
                  [{citation.number}]
                </button>
              ))}
            </div>
          </details>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border/20 text-center">
          <p className="text-xs font-medium text-muted-foreground">
            Ask Audelle is a personalised learning engine. It gets better with feedback.
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground/70">
            © 2026 All Rights Reserved. HNWI Chronicles.
          </p>
        </div>
      </main>
      </div>
      {citationPanelOpen && (
        <EliteCitationPanel
          citations={citations}
          selectedCitationId={selectedCitationId}
          onClose={() => {
            setCitationPanelOpen(false)
            setSelectedCitationId(null)
          }}
          onCitationSelect={handleCitationClick}
          citationMap={citationMap}
          preloadedSources={preloadedSources}
          shareId={shareId}
        />
      )}
    </Layout>
  )
}
