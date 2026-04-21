"use client"

type AuthSessionPayload = {
  user?: any | null
  [key: string]: any
} | null

interface FetchAuthSessionOptions {
  force?: boolean
  timeoutMs?: number
  ttlMs?: number
}

const DEFAULT_AUTH_SESSION_TIMEOUT_MS = 5000
const DEFAULT_AUTH_SESSION_TTL_MS = 15000

let cachedAuthSession: AuthSessionPayload = null
let cachedAuthSessionAt = 0
let hasCachedAuthSession = false
let inflightAuthSession: Promise<AuthSessionPayload> | null = null

async function fetchAuthSessionFromApi(timeoutMs: number): Promise<AuthSessionPayload> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })

    if (response.status === 401 || response.status === 403) {
      return null
    }

    if (!response.ok) {
      throw new Error(`auth-session-${response.status}`)
    }

    return await response.json()
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export function primeAuthSessionCache(payload: AuthSessionPayload): void {
  cachedAuthSession = payload
  cachedAuthSessionAt = Date.now()
  hasCachedAuthSession = true
}

export function clearAuthSessionCache(): void {
  cachedAuthSession = null
  cachedAuthSessionAt = 0
  hasCachedAuthSession = false
  inflightAuthSession = null
}

export async function fetchAuthSession(
  options: FetchAuthSessionOptions = {},
): Promise<AuthSessionPayload> {
  const {
    force = false,
    timeoutMs = DEFAULT_AUTH_SESSION_TIMEOUT_MS,
    ttlMs = DEFAULT_AUTH_SESSION_TTL_MS,
  } = options

  const now = Date.now()

  if (!force && hasCachedAuthSession && now - cachedAuthSessionAt < ttlMs) {
    return cachedAuthSession
  }

  if (!force && inflightAuthSession) {
    return inflightAuthSession
  }

  inflightAuthSession = fetchAuthSessionFromApi(timeoutMs)
    .then((payload) => {
      primeAuthSessionCache(payload)
      return payload
    })
    .finally(() => {
      inflightAuthSession = null
    })

  return inflightAuthSession
}
