"use client"

const RECENT_OPPORTUNITY_WINDOW_DAYS = 30
const RECENT_OPPORTUNITY_WINDOW_MS = RECENT_OPPORTUNITY_WINDOW_DAYS * 24 * 60 * 60 * 1000

type RecentOpportunityCandidate = {
  is_new?: boolean
  isNew?: boolean
  start_date?: string
  created_at?: string
  createdAt?: string | Date
  dateAdded?: string
  added_at?: string
  published_at?: string
}

function getMostRelevantTimestamp(candidate: RecentOpportunityCandidate): number | null {
  const values = [
    candidate.start_date,
    candidate.created_at,
    candidate.createdAt instanceof Date ? candidate.createdAt.toISOString() : candidate.createdAt,
    candidate.dateAdded,
    candidate.added_at,
    candidate.published_at,
  ]

  for (const value of values) {
    if (!value) continue

    const timestamp = Date.parse(value)
    if (!Number.isNaN(timestamp)) {
      return timestamp
    }
  }

  return null
}

export function isRecentlyAddedOpportunity(
  candidate: RecentOpportunityCandidate,
  now: number = Date.now()
): boolean {
  if (candidate.is_new === true || candidate.isNew === true) {
    return true
  }

  const timestamp = getMostRelevantTimestamp(candidate)
  if (timestamp === null || timestamp > now) {
    return false
  }

  return now - timestamp <= RECENT_OPPORTUNITY_WINDOW_MS
}

export const RECENT_OPPORTUNITY_DAYS = RECENT_OPPORTUNITY_WINDOW_DAYS
