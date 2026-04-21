"use client"

type AssessmentHistoryResponse = any

interface AssessmentHistoryOptions {
  force?: boolean
  timeoutMs?: number
  ttlMs?: number
}

interface CachedAssessmentHistory {
  data: AssessmentHistoryResponse
  fetchedAt: number
}

const DEFAULT_ASSESSMENT_TIMEOUT_MS = 5000
const DEFAULT_ASSESSMENT_TTL_MS = 600000
export const PERSONAL_MODE_RECENCY_DAYS = 30

const assessmentCache = new Map<string, CachedAssessmentHistory>()
const inflightAssessmentRequests = new Map<string, Promise<AssessmentHistoryResponse>>()

function parseAssessmentDate(value: unknown): Date | null {
  if (!value || typeof value !== "string") return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function hasRecentAssessmentResult(
  payload: AssessmentHistoryResponse,
  maxAgeDays: number = PERSONAL_MODE_RECENCY_DAYS,
): boolean {
  if (!payload) return false

  const directLast = parseAssessmentDate(payload?.last_assessment_date)
  const assessments = Array.isArray(payload?.assessments)
    ? payload.assessments
    : Array.isArray(payload?.history)
      ? payload.history
      : Array.isArray(payload)
        ? payload
        : []

  const fallbackLast = assessments
    .map((item: any) => parseAssessmentDate(item?.completed_at))
    .filter((value: Date | null): value is Date => value !== null)
    .sort((a: Date, b: Date) => b.getTime() - a.getTime())[0] || null

  const lastAssessment = directLast || fallbackLast
  if (!lastAssessment) return false

  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000
  return Date.now() - lastAssessment.getTime() <= maxAgeMs
}

async function fetchAssessmentHistoryFromApi(
  userId: string,
  timeoutMs: number,
): Promise<AssessmentHistoryResponse> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`/api/assessment/history/${userId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`assessment-history-${response.status}`)
    }

    return await response.json()
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export function clearAssessmentHistoryCache(userId?: string): void {
  if (userId) {
    assessmentCache.delete(userId)
    inflightAssessmentRequests.delete(userId)
    return
  }

  assessmentCache.clear()
  inflightAssessmentRequests.clear()
}

export async function fetchAssessmentHistory(
  userId: string,
  options: AssessmentHistoryOptions = {},
): Promise<AssessmentHistoryResponse> {
  const {
    force = false,
    timeoutMs = DEFAULT_ASSESSMENT_TIMEOUT_MS,
    ttlMs = DEFAULT_ASSESSMENT_TTL_MS,
  } = options

  const cached = assessmentCache.get(userId)
  const now = Date.now()

  if (!force && cached && now - cached.fetchedAt < ttlMs) {
    return cached.data
  }

  if (!force) {
    const inflight = inflightAssessmentRequests.get(userId)
    if (inflight) {
      return inflight
    }
  }

  const request = fetchAssessmentHistoryFromApi(userId, timeoutMs)
    .then((payload) => {
      assessmentCache.set(userId, {
        data: payload,
        fetchedAt: Date.now(),
      })
      return payload
    })
    .finally(() => {
      inflightAssessmentRequests.delete(userId)
    })

  inflightAssessmentRequests.set(userId, request)
  return request
}
