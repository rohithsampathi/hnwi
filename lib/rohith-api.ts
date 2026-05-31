// lib/rohith-api.ts
// API service layer for Audelle with SOTA Graph integration

import { secureApi, getCurrentUserId } from "@/lib/secure-api"
// Removed Crown Vault imports - not needed for Audelle
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
 * API service for Audelle - private decision ally with conversation management
 * Integrates with SOTA Graph backend and HNWI Knowledge Base for personalized context and memory
 */
export class RohithAPI {
  private static instance: RohithAPI
  private userContextCache: Map<string, { data: UserPortfolioContext; timestamp: number }> = new Map()
  private conversationCache: Map<string, ConversationWithMessages> = new Map()
  private readonly CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
  private visualizationCounter: number = 0
  private readonly visualizationKeys = new Set([
    'visualizations',
    'visualization',
    'visualization_commands',
    'visualization_command',
    'visualisation',
    'visualisation_commands',
    'viz',
    'vizs',
    'viz_commands',
    'chart',
    'charts',
    'graph',
    'graphs',
    'graph_payload',
    'graph_commands',
    'ui_block',
    'ui_blocks',
    'block',
    'blocks',
    'artifact',
    'artifacts',
    'structured_visualizations',
    'structured_response',
  ])
  private readonly visualizationMetadataKeys = new Set([
    'id',
    'type',
    'kind',
    'component',
    'name',
    'visualization_type',
    'visualisation_type',
    'viz_type',
    'chart_type',
    'position',
    'size',
    'animation',
    'duration_ms',
    'priority',
    'interactive',
    'message_id',
    'conversation_id',
    'user_id',
    'role',
    'created_at',
    'updated_at',
    'content',
    'text',
    'message',
  ])

  private constructor() {}

  private rohithBase(): string {
    // Audelle is versionless at the product boundary. Do not let a stale
    // deployment env route the live chat back to legacy V5/Rohith endpoints.
    return "/api/audelle"
  }

  private legacyRohithBase(): string {
    return "/api/rohith"
  }

  private normalizeJarvisMode(mode: any): "jarvis" | "classic" {
    const rawMode = String(mode || "").toLowerCase()
    return rawMode.includes("classic") ? "classic" : "jarvis"
  }

  private isRecord(value: any): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }

  private isNonEmptyString(value: any): boolean {
    return typeof value === 'string' && value.trim().length > 0
  }

  private normalizeObjectKey(key: string): string {
    return String(key || '')
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
  }

  private parseJsonLikeValue(value: any): any {
    let current = value

    for (let depth = 0; depth < 3; depth++) {
      if (!this.isNonEmptyString(current)) {
        return current
      }

      const text = String(current).trim()
      const isJsonObjectOrArray =
        (text.startsWith('{') && text.endsWith('}')) ||
        (text.startsWith('[') && text.endsWith(']'))
      const isQuotedJson =
        text.startsWith('"') &&
        text.endsWith('"') &&
        (text.includes('{') || text.includes('['))

      if (!isJsonObjectOrArray && !isQuotedJson) {
        return current
      }

      try {
        const parsed = JSON.parse(text)
        if (parsed === current) {
          return current
        }
        current = parsed
      } catch {
        return current
      }
    }

    return current
  }

  private normalizeResponsePayload(value: any, visited: Set<any> = new Set(), depth = 0): any {
    if (depth > 12) {
      return value
    }

    const parsed = this.parseJsonLikeValue(value)

    if (this.isNonEmptyString(parsed) || typeof parsed === 'number' || typeof parsed === 'boolean' || parsed === null || parsed === undefined) {
      return parsed
    }

    if (visited.has(parsed)) {
      return parsed
    }

    if (this.isRecord(parsed)) {
      visited.add(parsed)

      const envelopeKeys = ['response', 'payload', 'result', 'data', 'body', 'output', 'context', 'metadata']

      // If payload is wrapped in a single known envelope and the wrapper does not
      // already expose a conversation/message id, dive into the envelope.
      for (const key of envelopeKeys) {
        const next = parsed[key]
        if (!next) {
          continue
        }

        const normalizedNext = this.normalizeResponsePayload(next, visited, depth + 1)
        if (this.isRecord(normalizedNext) || Array.isArray(normalizedNext)) {
          const containsConversationMarker = this.findStringValueInTree(
            normalizedNext,
            (innerKey, innerValue, innerPath) => {
              if (innerKey === 'conversation_id' || innerKey === 'conversationId' || innerKey === 'message_id' || innerKey === 'messageId') {
                return this.isNonEmptyString(innerValue)
              }

              return innerKey === 'response' || innerKey === 'narration' || innerKey === 'citations' || innerKey === 'source_documents'
            }
          )

          if (containsConversationMarker) {
            return normalizedNext
          }
        }
      }

      const normalizedRecord: Record<string, any> = {}
      for (const [recordKey, recordValue] of Object.entries(parsed)) {
        normalizedRecord[recordKey] = this.normalizeResponsePayload(recordValue, visited, depth + 1)
      }
      return normalizedRecord
    }

    if (Array.isArray(parsed)) {
      return parsed.map((item) => this.normalizeResponsePayload(item, visited, depth + 1))
    }

    return parsed
  }

  private hasConversationContext(path: string[]): boolean {
    return path.some(segment => /conversation|session|thread|chat/i.test(segment))
  }

  private findStringValueInTree(
    response: any,
    matcher: (key: string, value: any, path: string[]) => boolean,
    maxDepth: number = 12,
    depth: number = 0,
    path: string[] = [],
    visited: Set<any> = new Set(),
  ): string {
    const normalizedResponse = this.normalizeResponsePayload(response)

    if (!normalizedResponse || depth > maxDepth) {
      return ''
    }

    if (this.isRecord(normalizedResponse)) {
      if (visited.has(normalizedResponse)) {
        return ''
      }
      visited.add(normalizedResponse)

      const keys = Object.keys(normalizedResponse)
      for (const key of keys) {
        const value = (normalizedResponse as Record<string, unknown>)[key]
        const candidatePath = path.concat(key)
        if (matcher(key, value, candidatePath) && this.isNonEmptyString(value)) {
          return String(value).trim()
        }
      }

      const envelopePriority = ['response', 'payload', 'result', 'data', 'context', 'metadata', 'body']
      for (const key of envelopePriority) {
        const nextValue = normalizedResponse[key]
        const found = this.findStringValueInTree(
          nextValue,
          matcher,
          maxDepth,
          depth + 1,
          path.concat(key),
          visited,
        )
        if (found) {
          return found
        }
      }

      for (const key of keys) {
        const value = normalizedResponse[key]
        if (!this.isRecord(value) && !Array.isArray(value)) {
          continue
        }

        if (envelopePriority.includes(key)) {
          continue
        }

        const found = this.findStringValueInTree(
          value,
          matcher,
          maxDepth,
          depth + 1,
          path.concat(key),
          visited,
        )
        if (found) {
          return found
        }
      }

      return ''
    }

    if (Array.isArray(normalizedResponse)) {
      for (let idx = 0; idx < normalizedResponse.length; idx++) {
        const value = normalizedResponse[idx]
        const found = this.findStringValueInTree(
          value,
          matcher,
          maxDepth,
          depth + 1,
          path.concat(String(idx)),
          visited,
        )
        if (found) {
          return found
        }
      }
    }

    return ''
  }

  private findAllValuesInTree(
    response: any,
    matcher: (key: string, value: any, path: string[]) => boolean,
    maxDepth: number = 12,
    depth: number = 0,
    path: string[] = [],
    visited: Set<any> = new Set(),
    found: any[] = [],
  ): any[] {
    const normalizedResponse = this.normalizeResponsePayload(response)

    if (!normalizedResponse || depth > maxDepth) {
      return found
    }

    if (this.isRecord(normalizedResponse)) {
      if (visited.has(normalizedResponse)) {
        return found
      }
      visited.add(normalizedResponse)

      for (const [key, value] of Object.entries(normalizedResponse)) {
        const candidatePath = path.concat(key)
        if (matcher(key, value, candidatePath)) {
          found.push(value)
        }

        if (this.isRecord(value) || Array.isArray(value)) {
          this.findAllValuesInTree(value, matcher, maxDepth, depth + 1, candidatePath, visited, found)
        }
      }
    } else if (Array.isArray(normalizedResponse)) {
      for (let idx = 0; idx < normalizedResponse.length; idx++) {
        const value = normalizedResponse[idx]
        if (this.isRecord(value) || Array.isArray(value)) {
          this.findAllValuesInTree(value, matcher, maxDepth, depth + 1, path.concat(String(idx)), visited, found)
        }
      }
    }

    return found
  }

  private extractConversationId(response: any): string {
    const normalizedResponse = this.normalizeResponsePayload(response)

    const direct = this.findStringValueInTree(
      normalizedResponse,
      (key, _value) => {
        const normalizedKey = String(key).toLowerCase().replace(/-/g, "_")
        return normalizedKey === "conversation_id" || normalizedKey === "conversationid"
      }
    )
    if (direct) {
      return direct
    }

    const nestedConversationId = this.findStringValueInTree(
      normalizedResponse,
      (key, value, path) => {
        const normalizedKey = String(key).toLowerCase().replace(/-/g, "_")
        if (normalizedKey === "id" && this.hasConversationContext(path)) {
          return this.isNonEmptyString(value)
        }

        if (normalizedKey === "conversation" && this.isRecord(value)) {
          const obj = value as Record<string, unknown>
          return this.isNonEmptyString(obj.conversation_id) || this.isNonEmptyString(obj.conversationId) || this.isNonEmptyString(obj.id)
        }

        if (normalizedKey === "conversation" && this.isNonEmptyString(value)) {
          return true
        }

        if (normalizedKey === "data" || normalizedKey === "payload" || normalizedKey === "result") {
          const obj = value as Record<string, unknown>
          const nestedConversation = obj.conversation as Record<string, unknown> | undefined
          return (
            this.isNonEmptyString(obj.conversation_id) ||
            this.isNonEmptyString(obj.conversationId) ||
            this.isNonEmptyString((nestedConversation || {}).id) ||
            this.isNonEmptyString((obj as Record<string, unknown>).id)
          )
        }

        return false
      }
    )
    if (nestedConversationId) {
      return nestedConversationId
    }

    return this.extractConversationIdLegacyFallback(normalizedResponse)
  }

  private extractConversationIdLegacyFallback(response: any): string {
    const normalizedResponse = this.normalizeResponsePayload(response)
    const directPaths: Array<Array<string>> = [
      ['data', 'conversation_id'],
      ['data', 'conversationId'],
      ['data', 'id'],
      ['payload', 'conversation_id'],
      ['payload', 'conversationId'],
      ['payload', 'conversation'],
      ['response', 'conversation_id'],
      ['response', 'conversationId'],
      ['result', 'conversation_id'],
      ['result', 'conversationId'],
      ['result', 'id'],
      ['conversation', 'id'],
    ]

    for (const path of directPaths) {
      let current = normalizedResponse as any
      let invalid = false
      for (const key of path) {
        if (!this.isRecord(current) || !(key in current)) {
          invalid = true
          break
        }
        current = current[key]
      }

      if (invalid) {
        continue
      }

      if (this.isNonEmptyString(current)) {
        return String(current).trim()
      }

      if (this.isRecord(current)) {
        const candidateObj = current as Record<string, unknown>
        const candidates = [
          candidateObj.conversation_id,
          candidateObj.conversationId,
          candidateObj.id,
          candidateObj.conversation,
        ]

        for (const candidate of candidates) {
          if (this.isNonEmptyString(candidate)) {
            return String(candidate).trim()
          }
        }
      }
    }

    return ''
  }

  private extractResponseContent(response: any, fallback: string): string {
    const payloadText = this.findStringValueInTree(response, (key, value) => {
      const normalizedKey = String(key).toLowerCase().replace(/-/g, "_")
      return normalizedKey === 'content' || normalizedKey === 'text'
    },
    )

    if (payloadText) {
      return payloadText
    }

    return fallback
  }

  private extractResponseContentCompat(response: any, fallback: string): string {
    const responseText = this.findStringValueInTree(response, (key, value) => {
      const normalizedKey = String(key).toLowerCase().replace(/-/g, "_")
      return normalizedKey === 'message' || normalizedKey === 'content' || normalizedKey === 'text'
    })

    return responseText || fallback
  }

  private extractNarration(response: any, fallback: string): { text: string; delivery: string } {
    const narration = this.findAllValuesInTree(response, (key) => {
      const normalizedKey = String(key).toLowerCase().replace(/-/g, "_")
      return normalizedKey === 'narration'
    })[0]
    const text =
      this.isRecord(narration) && this.isNonEmptyString((narration as Record<string, unknown>).text)
        ? String((narration as Record<string, unknown>).text)
        : this.extractResponseContent(response, fallback)

    const delivery = this.isRecord(narration) && this.isNonEmptyString((narration as Record<string, unknown>).delivery)
      ? String((narration as Record<string, unknown>).delivery)
      : "word_by_word"

    return {
      text,
      delivery,
    }
  }

  private extractMessageId(response: any): string | undefined {
    const direct = this.findStringValueInTree(response, (key) => {
      const normalizedKey = String(key).toLowerCase().replace(/-/g, "_")
      return normalizedKey === "message_id" || normalizedKey === "messageid"
    })
    if (direct) {
      return direct
    }

    const nested = this.findStringValueInTree(response, (key, _value, path) => {
      const normalizedKey = String(key).toLowerCase().replace(/-/g, "_")
      return normalizedKey === "id" && this.hasConversationContext(path.concat(["message"]))
    })

    return nested || undefined
  }

  private extractSourceDocuments(response: any): any[] {
    const values = this.findAllValuesInTree(response, (key) => {
      const normalizedKey = String(key).toLowerCase().replace(/-/g, "_")
      return normalizedKey === 'citations' || normalizedKey === 'source_documents'
    })
    const docs: any[] = []

    for (const value of values) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item) {
            docs.push(item)
          }
        }
      } else if (value && typeof value === 'object') {
        docs.push(value)
      }
    }

    if (docs.length > 0) {
      return docs
    }

    const fallback = this.findStringValueInTree(response, (key) => {
      const normalizedKey = String(key).toLowerCase().replace(/-/g, "_")
      return normalizedKey === 'source_document' || normalizedKey === 'source'
    })
    return this.isNonEmptyString(fallback) ? [{ id: fallback, type: 'fallback' }] : []
  }

  private shortHash(value: string, length = 8): string {
    let hash = 0
    for (let idx = 0; idx < value.length; idx++) {
      hash = ((hash << 5) - hash) + value.charCodeAt(idx)
      hash |= 0
    }
    return Math.abs(hash).toString(16).padStart(length, "0").slice(0, length)
  }

  private isVisualizationKey(key: string): boolean {
    return this.visualizationKeys.has(this.normalizeObjectKey(key))
  }

  private normalizeVisualizationType(rawType: any): string {
    const normalizedType = this.normalizeObjectKey(String(rawType || ''))
    if (!normalizedType) {
      return ''
    }

    const aliases: Record<string, string> = {
      network: 'chain_network',
      network_graph: 'chain_network',
      chain_graph: 'chain_network',
      chain_network: 'chain_network',
      cascade: 'cascade_graph',
      cascade_network: 'cascade_graph',
      graph: 'cascade_graph',
      graph_payload: 'cascade_graph',
      dependency_graph: 'cascade_graph',
      decision_graph: 'cascade_graph',
      knowledge_graph: 'cascade_graph',
      linechart: 'line_chart',
      piechart: 'pie_chart',
      rangechart: 'range_chart',
      deviation: 'deviation_chart',
      stacked: 'stacked_bar',
      stacked_bar_chart: 'stacked_bar',
      barchart: 'data_explainer',
      bar_chart: 'data_explainer',
      table: 'data_explainer',
      table_chart: 'data_explainer',
      timeline: 'development_timeline',
      lag: 'lag_timeline',
      map: 'world_map',
      worldmap: 'world_map',
    }

    return aliases[normalizedType] || normalizedType
  }

  private isKnownVisualizationType(visualType: string): boolean {
    return new Set([
      'asset_grid',
      'concentration_donut',
      'concentration_chart',
      'chain_network',
      'cascade_graph',
      'development_timeline',
      'jurisdiction_map',
      'risk_heatmap',
      'portfolio_stats',
      'tax_comparison',
      'regulatory_timeline',
      'migration_flow',
      'jurisdiction_scorecard',
      'key_metrics',
      'cost_of_delay',
      'data_explainer',
      'bar',
      'bar_chart',
      'line',
      'line_chart',
      'pie',
      'pie_chart',
      'stacked',
      'stacked_bar',
      'range',
      'range_chart',
      'deviation',
      'deviation_chart',
      'world_map',
      'lag_timeline',
    ]).has(visualType)
  }

  private normalizeDataSectionKind(rawKind: any): 'bar' | 'deviation' | 'line' | 'pie' | 'range' | 'stacked_bar' | 'table' {
    const normalizedKind = this.normalizeObjectKey(String(rawKind || ''))
    const aliases: Record<string, 'bar' | 'deviation' | 'line' | 'pie' | 'range' | 'stacked_bar' | 'table'> = {
      bar: 'bar',
      bar_chart: 'bar',
      data_explainer: 'table',
      deviation: 'deviation',
      deviation_chart: 'deviation',
      line: 'line',
      line_chart: 'line',
      pie: 'pie',
      pie_chart: 'pie',
      range: 'range',
      range_chart: 'range',
      stacked: 'stacked_bar',
      stacked_bar: 'stacked_bar',
      stacked_bar_chart: 'stacked_bar',
      table: 'table',
      table_chart: 'table',
    }

    return aliases[normalizedKind] || 'table'
  }

  private visualizationBaseData(candidate: Record<string, any>): Record<string, any> {
    const parsedData = this.parseJsonLikeValue(candidate.data)
    if (this.isRecord(parsedData)) {
      return parsedData as Record<string, any>
    }

    if (Array.isArray(parsedData)) {
      return { items: parsedData }
    }

    return candidate
  }

  private hasVisualizationStructure(candidate: Record<string, any>): boolean {
    const data = this.visualizationBaseData(candidate)
    const hasGraph = Array.isArray(data.nodes) && Array.isArray(data.edges)
    const hasExplainer =
      Array.isArray(data.sections) ||
      (Array.isArray(data.rows) && (
        this.isNonEmptyString(data.title) ||
        this.isNonEmptyString(candidate.title) ||
        this.isNonEmptyString(candidate.kind) ||
        this.isNonEmptyString(candidate.chart_type) ||
        this.isNonEmptyString(candidate.chartType)
      ))
    const hasTimeline = Array.isArray(data.events) || Array.isArray(data.timeline)
    const hasFlow = Array.isArray(data.flows) || Array.isArray(data.routes)
    const hasMap = Array.isArray(data.points) || Array.isArray(data.locations)
    const hasRiskMap = this.isRecord(data.jurisdictions) || Array.isArray(data.jurisdictions)
    const hasMetrics = Array.isArray(data.metrics) || Array.isArray(data.stats)

    return hasGraph || hasExplainer || hasTimeline || hasFlow || hasMap || hasRiskMap || hasMetrics
  }

  private inferVisualizationType(candidate: Record<string, any>): string {
    const directKeys = [
      'type',
      'kind',
      'visualization_type',
      'visualizationType',
      'visualisation_type',
      'visualisationType',
      'viz_type',
      'vizType',
      'chart_type',
      'chartType',
      'component',
      'name',
    ]

    for (const key of directKeys) {
      const rawType = candidate[key]
      if (this.isNonEmptyString(rawType)) {
        const normalizedType = this.normalizeVisualizationType(rawType)
        if (this.isKnownVisualizationType(normalizedType) || this.hasVisualizationStructure(candidate)) {
          return normalizedType
        }
      }
    }

    const data = this.visualizationBaseData(candidate)
    if (Array.isArray(data.nodes) && Array.isArray(data.edges)) {
      return 'cascade_graph'
    }
    if (Array.isArray(data.sections) || Array.isArray(data.rows)) {
      return 'data_explainer'
    }
    if (Array.isArray(data.events) || Array.isArray(data.timeline)) {
      return 'development_timeline'
    }
    if (Array.isArray(data.flows) || Array.isArray(data.routes)) {
      return 'migration_flow'
    }
    if (this.isRecord(data.jurisdictions) || Array.isArray(data.jurisdictions)) {
      return 'risk_heatmap'
    }
    if (Array.isArray(data.points) || Array.isArray(data.locations)) {
      return 'world_map'
    }
    if (Array.isArray(data.metrics) || Array.isArray(data.stats)) {
      return 'key_metrics'
    }

    return ''
  }

  private normalizeVisualizationData(candidate: Record<string, any>, visualType: string): Record<string, any> {
    const parsedData = this.parseJsonLikeValue(candidate.data)
    const data: Record<string, any> = this.isRecord(parsedData)
      ? { ...(parsedData as Record<string, any>) }
      : Array.isArray(parsedData)
        ? { items: parsedData }
        : {}

    for (const [key, value] of Object.entries(candidate)) {
      const normalizedKey = this.normalizeObjectKey(key)
      if (this.visualizationMetadataKeys.has(normalizedKey) || normalizedKey === 'data') {
        continue
      }

      if (data[key] === undefined) {
        data[key] = this.parseJsonLikeValue(value)
      }
    }

    const isExplainerType = [
      'data_explainer',
      'line_chart',
      'line',
      'pie_chart',
      'pie',
      'range_chart',
      'range',
      'deviation_chart',
      'stacked_bar',
    ].includes(visualType)

    if (isExplainerType && !Array.isArray(data.sections) && Array.isArray(data.rows)) {
      const rawKind = candidate.kind || candidate.chart_type || candidate.chartType || candidate.type || visualType
      data.sections = [{
        kind: this.normalizeDataSectionKind(rawKind),
        title: data.title || candidate.title || 'Data',
        unit: data.unit || candidate.unit,
        insight: data.insight || candidate.insight,
        rows: data.rows,
        columns: data.columns,
      }]
    }

    return data
  }

  private normalizeVisualizationCandidate(value: any, candidateIdx: number): any | null {
    const parsed = this.parseJsonLikeValue(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null
    }

    const candidate: Record<string, any> = parsed as Record<string, any>
    const visualType = this.inferVisualizationType(candidate)
    if (!visualType) {
      return null
    }
    const data = this.normalizeVisualizationData(candidate, visualType)

    const normalizeId = (rawId: any, idx: number): string => {
      if (typeof rawId === 'string' || typeof rawId === 'number') {
        const trimmed = String(rawId).trim()
        if (trimmed) {
          return trimmed
        }
      }

      const hashSeed = this.shortHash(JSON.stringify({
        type: visualType,
        position: candidate.position || 'center',
        size: candidate.size || 'medium',
        animation: candidate.animation || 'fade',
        data,
      }), 8)
      return `${visualType.replace(/[^a-z0-9_-]/gi, '_') || 'visualization'}_${idx + 1}_${hashSeed}`
    }

    const id = normalizeId(candidate.id, candidateIdx)
    if (!id) {
      return null
    }

    return {
      id,
      type: String(visualType),
      position: candidate.position || 'center',
      size: candidate.size || 'medium',
      animation: candidate.animation || 'fade',
      duration_ms: Number(candidate.duration_ms || candidate.durationMs) || 400,
      priority: Number(candidate.priority) || 1,
      data,
      interactive: Boolean(candidate.interactive),
    }
  }

  private addVisualizationCandidates(value: any, collected: any[]): void {
    const parsed = this.parseJsonLikeValue(value)

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        this.addVisualizationCandidates(item, collected)
      }
      return
    }

    if (!this.isRecord(parsed)) {
      return
    }

    const candidate = parsed as Record<string, any>
    let addedNested = false
    for (const [key, childValue] of Object.entries(candidate)) {
      if (!this.isVisualizationKey(key) && !['commands', 'items'].includes(this.normalizeObjectKey(key))) {
        continue
      }
      this.addVisualizationCandidates(childValue, collected)
      addedNested = true
    }

    if (!addedNested || this.hasVisualizationStructure(candidate) || this.inferVisualizationType(candidate)) {
      collected.push(candidate)
    }
  }

  private findVisualizationObjectsInTree(
    response: any,
    maxDepth: number = 12,
    depth: number = 0,
    visited: Set<any> = new Set(),
    found: any[] = [],
  ): any[] {
    const normalizedResponse = this.normalizeResponsePayload(response)

    if (!normalizedResponse || depth > maxDepth) {
      return found
    }

    if (this.isRecord(normalizedResponse)) {
      if (visited.has(normalizedResponse)) {
        return found
      }
      visited.add(normalizedResponse)

      const record = normalizedResponse as Record<string, any>
      if (this.hasVisualizationStructure(record)) {
        found.push(record)
      }

      for (const value of Object.values(record)) {
        if (this.isRecord(value) || Array.isArray(value) || this.isNonEmptyString(value)) {
          this.findVisualizationObjectsInTree(value, maxDepth, depth + 1, visited, found)
        }
      }
    } else if (Array.isArray(normalizedResponse)) {
      for (const item of normalizedResponse) {
        this.findVisualizationObjectsInTree(item, maxDepth, depth + 1, visited, found)
      }
    }

    return found
  }

  private extractVisualizations(response: any): any[] {
    const thisSequenceStart = this.visualizationCounter

    const normalizedResponse = this.normalizeResponsePayload(response)
    const collected: any[] = []

    for (const value of this.findAllValuesInTree(normalizedResponse, (key) => {
      return this.isVisualizationKey(key)
    })) {
      this.addVisualizationCandidates(value, collected)
    }

    for (const candidate of this.findVisualizationObjectsInTree(normalizedResponse)) {
      collected.push(candidate)
    }

    const deduped = new Map<string, any>()
    let candidateIdx = 0
    for (const candidate of collected) {
      const parsedCandidate = this.normalizeVisualizationCandidate(candidate, candidateIdx)
      candidateIdx += 1
      if (!parsedCandidate) {
        continue
      }
      const dedupeKey = this.shortHash(
        JSON.stringify({
          type: parsedCandidate.type,
          position: parsedCandidate.position,
          size: parsedCandidate.size,
          animation: parsedCandidate.animation,
          duration_ms: parsedCandidate.duration_ms,
          priority: parsedCandidate.priority,
          data: parsedCandidate.data,
        }),
      ) + `:${parsedCandidate.type}`
      if (!deduped.has(dedupeKey)) {
        deduped.set(dedupeKey, parsedCandidate)
      }
    }

    this.visualizationCounter = thisSequenceStart + 1
    return Array.from(deduped.values()).sort((left, right) => (left.priority || 0) - (right.priority || 0))
  }

  private extractProcessingTime(response: any, responseTime: number): number {
    const direct = this.findStringValueInTree(response, (key) => {
      const normalizedKey = String(key).toLowerCase().replace(/-/g, "_")
      return normalizedKey === 'processing_time_ms'
    })
    if (this.isNonEmptyString(direct)) {
      const parsed = Number(direct)
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed
      }
    }

    const nested = Number(
      this.findAllValuesInTree(response, (key) => {
        const normalizedKey = String(key).toLowerCase().replace(/-/g, "_")
        return normalizedKey === 'processing_time_ms'
      })?.[0]
    )

    if (!Number.isNaN(nested) && nested > 0) {
      return nested
    }

    return responseTime
  }

  private async postJarvisEndpoint(endpoint: string, data: any): Promise<any> {
    let lastError: any

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await secureApi.post(
          endpoint,
          data,
          true,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      } catch (error: any) {
        lastError = error
        const status = error?.status || error?.response?.status
        const isTransient = status === 502 || status === 503 || status === 504
        if (!isTransient || attempt === 1) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 700))
      }
    }

    throw lastError
  }

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

      // Only load user profile, skip Crown Vault data for Audelle
      const userProfile = await secureApi.get(`/api/users/${targetUserId}`, true, {
        enableCache: true,
        cacheDuration: 600000
      }).catch(() => null)

      // Use placeholder data for portfolio metrics on Audelle page
      // This avoids loading Crown Vault data unnecessarily
      const assets: any[] = []
      const stats: Record<string, any> = {}
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
        `${this.rohithBase()}/conversations?limit=${limit}`,
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
        `${this.rohithBase()}/history/${conversationId}`,
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
          visualizations: this.extractVisualizations(msg),
          context: msg.role === "assistant" ? {
            hnwiKnowledgeSources: msg.context?.generated_from ? ["HNWI Knowledge Base"] : ["audelle_api"],
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

      this.conversationCache.set(conversationId, conversationData)
      return conversationData
    } catch (error) {
      return null
    }
  }

  private async getConversation(
    conversationId: string,
    userId?: string | null,
  ): Promise<ConversationWithMessages | null> {
    const conversation = await this.getConversationHistory(conversationId)
    if (!conversation) {
      return null
    }

    if (!conversation.userId && userId) {
      return {
        ...conversation,
        userId,
      }
    }

    return conversation
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

      // Use the Audelle start endpoint with the first message
      const response = await secureApi.post(
        `${this.rohithBase()}/start`,
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
   * Send a message to Audelle and get response
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

      // Send message to the Audelle message endpoint
      const response = await secureApi.post(
        `${this.rohithBase()}/message/${conversationId}`,
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
      }

      const conversationResponse: ConversationResponse = {
        response: responseText,
        conversationId,
        message_id: response.message_id, // Include message_id for feedback
        authenticity_guarantee: response.authenticity_guarantee || true,
        response_time: response.response?.processing_time_ms || responseTime,
        provenance: {
          source_nodes: response.context?.relevant_entities?.map((e: any) => e.name) || ["audelle_api"],
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
   * Send message with JARVIS mode (V5 endpoint with visualizations)
   * As of Feb 2026: JARVIS mode is now the backend default
   */
  async sendMessageJarvis(
    message: string,
    conversationId: string,
    userId?: string,
    conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
  ): Promise<any> {
    try {
      const targetUserId = userId || getCurrentUserId()
      if (!targetUserId) {
        throw new Error("User ID not found")
      }
      if (!conversationId) {
        throw new Error("Conversation ID not found")
      }

      // Clear conversation cache
      this.clearConversationCache(conversationId)

      const startTime = Date.now()

      // Call the configured Audelle conversation lane. V6 preserves the JARVIS response envelope.
      const response = await this.postJarvisEndpoint(
        `${this.rohithBase()}/message/${conversationId}`,
        {
          message: message,
          conversation_id: conversationId,
          conversationId,
          user_id: targetUserId,
          userId: targetUserId,
          conversation_history: conversationHistory
          // jarvis_mode removed - backend defaults to true as of Feb 2026
        }
      )

      const responseTime = Date.now() - startTime

      // Backend response format (Feb 2026):
      // {
      //   mode: "jarvis" | "classic",
      //   response: {
      //     content: "text narration",
      //     narration: { text: "...", delivery: "word_by_word" },
      //     visualizations: [...],
      //     predictive_prompts: [...],
      //     tier: "fast",
      //     processing_time_ms: 1234,
      //     confidence_score: 0.85,
      //     citations: [...]
      //   }
      // }

      // Log the mode for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Audelle API] Response mode: ${response.mode || 'jarvis (default)'}`)
      }

      const narration = this.extractNarration(response, "I'm sorry, I couldn't process that request.")

      return {
        mode: this.normalizeJarvisMode(response.mode),
        rawMode: response.mode || "jarvis",
        narration,
        visualizations: this.extractVisualizations(response),
        predictive_prompts: response.response?.predictive_prompts || response.predictive_prompts || [],
        // Map backend's 'citations' field to 'source_documents' (Feb 2026 backend uses 'citations')
        source_documents: this.extractSourceDocuments(response),
        conversationId,
        message_id: this.extractMessageId(response),
        // Check both top-level and metadata locations for these fields
        tier: response.response?.tier || response.response?.metadata?.tier || "fast",
        processing_time_ms: this.extractProcessingTime(response, responseTime),
        confidence_score: response.response?.confidence_score || response.response?.metadata?.confidence_score || 0.85,
        intelligence_sources: response.response?.intelligence_sources || response.response?.metadata?.intelligence_sources || []
      }
    } catch (error) {
      console.error("JARVIS message send error:", error)
      throw error
    }
  }

  /**
   * Create new conversation with JARVIS mode (V5 endpoint)
   * As of Feb 2026: Backend defaults to JARVIS mode
   */
  async createConversationJarvis(
    firstMessage: string,
    userId?: string
  ): Promise<any> {
    try {
      const targetUserId = userId || getCurrentUserId()
      if (!targetUserId) {
        throw new Error("User ID not found")
      }

      const startTime = Date.now()

      // Call the configured Audelle conversation lane. V6 preserves the JARVIS response envelope.
      const response = await this.postJarvisEndpoint(
        `${this.rohithBase()}/start`,
        {
          message: firstMessage,
          user_id: targetUserId,
          userId: targetUserId,
          conversation_history: []
          // jarvis_mode removed - backend defaults to true as of Feb 2026
        }
      )

      const responseTime = Date.now() - startTime

      // Log the mode for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Audelle API] Conversation start mode: ${response.mode || 'jarvis (default)'}`)
      }

      const conversationId = this.extractConversationId(response)
      if (!conversationId) {
        if (response?.status === "kingdom_native_compatibility") {
          throw new Error("Audelle backend returned the generic Kingdom compatibility adapter instead of the conversation route. Start the HNWI backend on port 8000 locally, or deploy the Audelle route to the active backend.")
        }
        throw new Error("Audelle start response did not include a conversation ID")
      }

      const narration = this.extractNarration(response, "Hello. I'm Audelle, your private decision ally.")

      return {
        conversationId,
        mode: this.normalizeJarvisMode(response.mode),
        rawMode: response.mode || "jarvis",
        narration,
        visualizations: this.extractVisualizations(response),
        predictive_prompts: response.response?.predictive_prompts || response.predictive_prompts || [],
        // Map backend's 'citations' field to 'source_documents' (Feb 2026 backend uses 'citations')
        source_documents: this.extractSourceDocuments(response),
        message_id: this.extractMessageId(response),
        // Check both top-level and metadata locations for these fields
        tier: response.response?.tier || response.response?.metadata?.tier || "instant",
        processing_time_ms: this.extractProcessingTime(response, responseTime),
        confidence_score: response.response?.confidence_score || response.response?.metadata?.confidence_score || 0.85
      }
    } catch (error) {
      console.error("Audelle conversation create error:", error)
      throw error
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      let response
      try {
        response = await secureApi.delete(
          `${this.rohithBase()}/conversation/${conversationId}`,
          true
        )
      } catch {
        response = await secureApi.delete(
          `${this.legacyRohithBase()}/conversation/${conversationId}`,
          true
        )
      }

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

      let response
      try {
        response = await secureApi.post(
          `${this.rohithBase()}/conversation/${conversationId}/title`,
          { title: cleanedTitle },
          true
        )
      } catch {
        response = await secureApi.post(
          `${this.legacyRohithBase()}/conversation/${conversationId}/title`,
          { title: cleanedTitle },
          true
        )
      }

      // Clear cache to refresh data - clear both conversation cache and list cache
      this.clearConversationCache(conversationId)

      // Also clear the conversations list cache to ensure it gets fresh data
      import("@/lib/secure-api").then(({ CacheControl }) => {
        CacheControl.delete(`${this.rohithBase()}/conversations`)
        CacheControl.delete(`${this.legacyRohithBase()}/conversations`)
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

      const payload = {
        conversation_id: conversationId,
        message_id: messageId,
        feedback_score: isPositive ? 1 : 0,
        user_id: targetUserId
      }
      const options = {
        headers: {
          'Content-Type': 'application/json'
        }
      }
      let data
      try {
        data = await secureApi.post(
          `${this.rohithBase()}/feedback/${conversationId}`,
          payload,
          true,
          options
        )
      } catch {
        data = await secureApi.post(
          `${this.legacyRohithBase()}/feedback/${conversationId}`,
          payload,
          true,
          options
        )
      }

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
        `${this.legacyRohithBase()}/share?shareId=${encodeURIComponent(shareId)}`,
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
    this.conversationCache.delete(conversationId)

    // Clear from secure API cache
    const cacheKeys = [
      `${this.rohithBase()}/history/${conversationId}`,
      `${this.rohithBase()}/conversations`,
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
    context?: any,
    visualizations?: any[]
  ): Message {
    return {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
      context,
      ...(visualizations && visualizations.length > 0 ? { visualizations } : {})
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
