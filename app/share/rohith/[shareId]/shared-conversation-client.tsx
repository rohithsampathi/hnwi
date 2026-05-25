// app/share/rohith/[shareId]/shared-conversation-client.tsx
// Client component for displaying a shared Audelle conversation

'use client'

import { isValidElement, useMemo, useState } from 'react'
import { MessageCircle, Share2, Check, ArrowLeft, User, Clock, BookOpen, Copy } from 'lucide-react'
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
    .replace(/\bwhat\s+is\s+still\s+missing\s+is\b/gi, 'The next useful proof is')
    .replace(/\bwhat\s+remains\s+untested\s+in\s+the\s+sources\s+is\b/gi, 'The next useful proof is')
    .replace(/\bthe\s+record\s+still\s+lacks\s+repeated\s+demonstrations\s+of\b/gi, 'the stronger proof would be repeated demonstrations of')
    .replace(/\buntil\s+that\s+pattern\s+appears\s+in\s+the\s+record\b/gi, 'until that pattern is visible')
    .replace(/\buntil\s+that\s+pattern\s+appears\s+with\s+observable\s+outcomes\s+rather\s+than\s+single-quarter\s+data\b/gi, 'until that pattern is visible across more than one quarter')
    .replace(/\buntil\s+those\s+second-\s*and\s+third-order\s+tests\s+appear\s+in\s+the\s+evidence\b/gi, 'until those second and third order tests are visible')
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

function cleanSharedUserContent(content: string): string {
  return compactText(content)
    .replace(
      /^I\s+went\s+back\s+into\s+the\s+family[- ]wealth\s+memory\s+we\s+have\s+been\s+building\s+since\s+day\s+one(?:\s+for\s+today['’]s\s+public\s+conversation)?\.\s*/i,
      ''
    )
    .replace(/^The\s+question\s+I\s+want\s+to\s+sit\s+with\s+is\s+[^.]*\.\s*/i, '')
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
  return (message.visualizations || []).map((command: any) => {
    if (command?.type !== 'data_explainer' || !Array.isArray(command?.data?.sections)) {
      return command
    }

    const sections = command.data.sections.filter((section: any) => {
      const title = String(section?.title || '').toLowerCase()
      const columns = Array.isArray(section?.columns) ? section.columns.join(' ').toLowerCase() : ''
      return !title.includes('source') && !columns.includes('source')
    })

    return {
      ...command,
      data: {
        ...command.data,
        sections,
      },
    }
  }).filter((command: any) => {
    const title = String(command?.data?.title || '').toLowerCase()
    if (title === 'native evidence packet' || title === 'risk assessment') return false
    if (command?.type === 'data_explainer' && Array.isArray(command?.data?.sections) && command.data.sections.length === 0) return false
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

function isRouteReadVisualization(command: VisualizationCommand): boolean {
  const title = String(command?.data?.title || '').toLowerCase()
  const id = String(command?.id || '').toLowerCase()
  return title === 'route read' || id.startsWith('route-read-')
}

function normalizeNumericValue(value: number, unit: string): number {
  const normalizedUnit = unit.toLowerCase()
  if (normalizedUnit.includes('billion')) return value * 1000
  if (normalizedUnit.includes('crore')) return value * 10
  return value
}

function numericDisplay(value: string, unit: string, currency: string): string {
  return `${currency ? `${currency} ` : ''}${value}${unit ? ` ${unit}` : ''}`.trim()
}

function numericLabel(sentence: string, matchStart: number, matchEnd: number): string {
  const before = sentence.slice(0, matchStart).replace(/[([].*?[\])]/g, ' ').trim()
  const after = sentence.slice(matchEnd).replace(/[([].*?[\])]/g, ' ').trim()
  const beforeWords = before.split(/\s+/).filter(Boolean)
  const afterWords = after.split(/\s+/).filter(Boolean)
  const labelWords = beforeWords.slice(-7)

  if (/^up$/i.test(labelWords[labelWords.length - 1] || '') || /^down$/i.test(labelWords[labelWords.length - 1] || '')) {
    return `${labelWords.slice(0, -1).join(' ')} ${labelWords[labelWords.length - 1]}`.trim() || 'Change'
  }

  const raw = labelWords.length ? labelWords.join(' ') : afterWords.slice(0, 5).join(' ')
  return raw
    .replace(/\b(reached|reports?|posted|shows?|with|while|and|the|a|an|of|in|to|from|above|below)$/gi, '')
    .replace(/^[,.;:\s]+|[,.;:\s]+$/g, '')
    .trim() || 'Reported figure'
}

function inferNumericFactUnit(currency: string, unit: string): string {
  const normalized = unit.toLowerCase()
  if (normalized === '%') return 'percent'
  if (normalized.includes('percent')) return 'percent'
  if (currency && normalized.includes('billion')) return `${currency} million`
  if (currency && normalized.includes('million')) return `${currency} million`
  if (currency && normalized.includes('crore')) return `${currency} million`
  if (currency) return currency
  return normalized || 'value'
}

function syntheticDataExplainer(message: SharedMessage): VisualizationCommand | null {
  if (message.role !== 'assistant') return null

  const text = cleanSharedMessageContent(message.content)
  if (!text || text.length < 120) return null

  const facts: Array<{ label: string; value: number; display: string; unit: string }> = []
  const sentences = text
    .replace(/\[[0-9]+\]/g, '')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  const factPattern = /\b(?:(AED|USD|INR|GBP|EUR)\s*)?([0-9][0-9,]*(?:\.[0-9]+)?)\s*(billion|million|crore|percent|%|entities|licen[cs]es|firms|funds|journeys|transactions|assets|quarters|homes|families)?\b/gi

  sentences.forEach((sentence) => {
    let match: RegExpExecArray | null
    factPattern.lastIndex = 0
    while ((match = factPattern.exec(sentence)) !== null) {
      const currency = (match[1] || '').toUpperCase()
      const rawValue = match[2] || ''
      const rawUnit = match[3] || ''
      const value = Number(rawValue.replace(/,/g, ''))
      if (!Number.isFinite(value)) continue
      if (!currency && !rawUnit) continue
      if (!rawUnit && value >= 1900 && value <= 2100) continue
      if (rawUnit && /quarter/i.test(rawUnit) && value <= 4) continue
      if (facts.some((fact) => fact.display === numericDisplay(rawValue, rawUnit, currency))) continue

      const unit = inferNumericFactUnit(currency, rawUnit)
      facts.push({
        label: numericLabel(sentence, match.index, match.index + match[0].length).slice(0, 42),
        value: normalizeNumericValue(value, rawUnit),
        display: numericDisplay(rawValue, rawUnit, currency),
        unit,
      })
    }
  })

  const tableRows = facts.slice(0, 6)
  if (tableRows.length < 2) return null

  const comparableUnit = tableRows[0].unit
  const comparableRows = tableRows.filter((row) => row.unit === comparableUnit)
  const sections: any[] = [
    {
      kind: 'table',
      title: 'Numbers Audelle is using',
      columns: ['Signal', 'Value'],
      rows: tableRows.map((fact) => [fact.label, fact.display]),
    }
  ]

  if (comparableRows.length >= 2) {
    sections.unshift({
      kind: comparableUnit === 'percent' ? 'deviation' : 'bar',
      title: comparableUnit === 'percent' ? 'Change signals' : 'Comparable scale',
      unit: comparableUnit,
      rows: comparableRows.slice(0, 5).map((fact) => ({
        label: fact.label,
        value: fact.value,
        display: fact.display,
        unit: fact.unit,
      })),
    })
  }

  return {
    id: `synthetic-${message.id}`,
    type: 'data_explainer',
    position: 'center',
    size: 'medium',
    animation: 'fade',
    duration_ms: 180,
    priority: 20,
    interactive: false,
    data: {
      title: 'Answer read',
      subtitle: 'Figures surfaced directly from this answer',
      sections,
    },
  }
}

const routeFactorPatterns = [
  { label: 'Proof', pattern: /\bproof|source[- ]of[- ]wealth|documentation|documentary|defendable|verified\b/i },
  { label: 'Authority', pattern: /\bauthority|signer|commit|consent|principal|family decision\b/i },
  { label: 'Liquidity', pattern: /\bliquidity|exit|buyer pool|sell|resale|window\b/i },
  { label: 'Movement', pattern: /\bmovement|travel|airport|airspace|access|mobility|flight\b/i },
  { label: 'Banking', pattern: /\bbank|banking|account|capital movement|onboarding\b/i },
  { label: 'Tax', pattern: /\btax|residence|residency|domicile|non-dom|substance\b/i },
  { label: 'Family carry', pattern: /\bschool|children|succession|explanation|family|home\b/i },
  { label: 'Fallback', pattern: /\bfallback|contingency|alternative|if .* slows|if .* changes\b/i },
  { label: 'Asset', pattern: /\bproperty|asset|real estate|home|penthouse|villa\b/i },
]

function shortSentence(sentence: string): string {
  const clean = compactText(sentence)
  if (clean.length <= 145) return clean
  return `${clean.slice(0, 142).replace(/\s+\S*$/, '')}...`
}

function routeFactorExplainer(message: SharedMessage): VisualizationCommand | null {
  if (message.role !== 'assistant') return null

  const text = cleanSharedMessageContent(message.content)
  if (!text || text.length < 140) return null

  const sentences = text
    .replace(/\[[0-9]+\]/g, '')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  const usedSentences = new Set<string>()
  const rows = routeFactorPatterns.reduce<string[][]>((acc, factor) => {
    const sentence = sentences.find((item) => factor.pattern.test(item) && !usedSentences.has(item))
    if (!sentence) return acc
    usedSentences.add(sentence)
    acc.push([factor.label, shortSentence(sentence)])
    return acc
  }, []).slice(0, 6)

  if (rows.length < 3) return null

  return {
    id: `route-read-${message.id}`,
    type: 'data_explainer',
    position: 'center',
    size: 'medium',
    animation: 'fade',
    duration_ms: 180,
    priority: 30,
    interactive: false,
    data: {
      title: 'Route read',
      subtitle: 'Joins surfaced directly in this answer',
      sections: [
        {
          kind: 'table',
          title: 'What has to hold',
          columns: ['Join', 'Reading from the answer'],
          rows,
        },
      ],
    },
  }
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
  if (normalized.includes('kgv21') || normalized.includes('castle brief')) return 'HNWI Chronicles brief'
  if (normalized.includes('decision memo')) return 'Decision memo'
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

function compactText(value: string): string {
  return String(value || '')
    .replace(/—/g, ', ')
    .replace(/–/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function conversationSearchText(conversation: SharedConversationData, messages: SharedMessage[]): string {
  return compactText([
    conversation.title,
    conversation.positioningLine,
    messages.slice(0, 6).map((message) => message.content).join(' '),
  ].filter(Boolean).join(' '))
}

function getRouteTopic(conversation: SharedConversationData, messages: SharedMessage[]): string {
  const text = conversationSearchText(conversation, messages)
  if (/dubai|difc|adgm|uae/i.test(text)) return 'Dubai-linked family move'
  if (/singapore|sg\b/i.test(text)) return 'Singapore-linked family move'
  if (/uk|london|europe|non-?dom/i.test(text)) return 'UK or Europe-linked family route'
  if (/hyderabad/i.test(text)) return 'Hyderabad family-base decision'
  if (/mumbai/i.test(text)) return 'Mumbai wealth route'
  if (/succession|heir|inheritance/i.test(text)) return 'succession route'
  if (/property|real estate|asset/i.test(text)) return 'asset route'
  return 'family wealth route'
}

function getPrivatePrompt(conversation: SharedConversationData, messages: SharedMessage[]): string {
  const topic = getRouteTopic(conversation, messages)
  return `If this is live in your room, message Rohith with the ${topic.toLowerCase()}, timing, and the one part of the route that still has to hold before commitment.`
}

export default function SharedConversationClient({ conversation, shareId }: SharedConversationClientProps) {
  const [linkCopied, setLinkCopied] = useState(false)
  const [promptCopied, setPromptCopied] = useState(false)
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
  const privatePrompt = useMemo(() => getPrivatePrompt(conversation, messages), [conversation, messages])

  const handleCopyPrivatePrompt = async () => {
    const prompt = `${privatePrompt}\n\n${window.location.href}`
    try {
      await navigator.clipboard.writeText(prompt)
      setPromptCopied(true)
      setTimeout(() => setPromptCopied(false), 2000)
    } catch {
      const input = document.createElement('textarea')
      input.value = prompt
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setPromptCopied(true)
      setTimeout(() => setPromptCopied(false), 2000)
    }
  }

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
    let routeReadShown = false
    const next = new Map<string, VisualizationCommand[]>()

    messages.forEach((message) => {
      const existingVisualizations = visibleVisualizations(message)
      const hasDataExplainer = existingVisualizations.some((command) => command.type === 'data_explainer')
      const numericSynthetic = hasDataExplainer ? null : syntheticDataExplainer(message)
      const routeSynthetic = hasDataExplainer || numericSynthetic ? null : routeFactorExplainer(message)
      const visualizations = [
        ...existingVisualizations,
        ...(numericSynthetic ? [numericSynthetic] : []),
        ...(routeSynthetic ? [routeSynthetic] : []),
      ].filter((command) => {
        if (isRouteReadVisualization(command)) {
          if (routeReadShown) return false
          routeReadShown = true
        }
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
      <div className="mx-auto flex min-h-[calc(var(--app-viewport-height,100dvh)-190px)] w-full max-w-[1040px] flex-col gap-4 text-foreground">
        <div className="flex w-full items-center justify-between gap-3 border-b border-border/25 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-gold">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">Audelle</p>
              <p className="text-xs text-muted-foreground">
                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
              </p>
            </div>
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
      <main className="w-full pt-2">
        <div className="space-y-8">
          {messages.map((message) => {
            const messageVisualizations = visibleVisualizationsByMessageId.get(message.id) || []
            return (
            <div key={message.id}>
              {message.role === 'user' ? (
                <div className="flex items-start justify-end gap-3">
                  <div className="flex max-w-[min(760px,85%)] flex-col items-end">
                    <div className="mb-1 text-xs font-medium text-muted-foreground">You</div>
                    <div className="rounded-2xl rounded-tr-md bg-muted/80 px-5 py-3 text-[15px] leading-relaxed text-foreground shadow-sm ring-1 ring-border/20">
                      <p className="whitespace-pre-wrap">{cleanSharedUserContent(message.content)}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border/40 bg-muted text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-gold">
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

        <section className="mt-10 border-t border-border/25 pt-5">
          <p className="max-w-2xl text-sm leading-relaxed text-foreground/80">
            {privatePrompt}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyPrivatePrompt}
            className="mt-3"
          >
            {promptCopied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Prompt copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy private prompt
              </>
            )}
          </Button>
        </section>

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
