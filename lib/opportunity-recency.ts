"use client"

const RECENT_OPPORTUNITY_WINDOW_DAYS = 30
const RECENT_OPPORTUNITY_WINDOW_MS = RECENT_OPPORTUNITY_WINDOW_DAYS * 24 * 60 * 60 * 1000

type RecentOpportunityCandidate = {
  // Map blink authority must come from the source article, not from the
  // command-centre row lifecycle or backend generation timestamp.
  source_article_date?: string
  source_published_at?: string
  article_date?: string
  date?: string
  published_at?: string
  is_new?: boolean
  isNew?: boolean
  start_date?: string
  created_at?: string
  createdAt?: string | Date
  dateAdded?: string
  added_at?: string
}

function getMostRelevantTimestamp(candidate: RecentOpportunityCandidate): number | null {
  const values = [
    candidate.source_article_date,
    candidate.source_published_at,
    candidate.article_date,
    candidate.date,
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
  const timestamp = getMostRelevantTimestamp(candidate)
  if (timestamp === null || timestamp > now) {
    return false
  }

  return now - timestamp <= RECENT_OPPORTUNITY_WINDOW_MS
}

export const RECENT_OPPORTUNITY_DAYS = RECENT_OPPORTUNITY_WINDOW_DAYS
