export const REMEMBERED_SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60
export const STANDARD_SESSION_MAX_AGE_SECONDS = 24 * 60 * 60
export type AuthCookieSameSite = 'lax' | 'strict'

const AUTH_COOKIE_NAMES = new Set([
  "access_token",
  "refresh_token",
  "session_user",
  "session_token",
  "csrf_token",
])

export function resolveAuthSessionMaxAge(rememberMe: boolean): number {
  return rememberMe
    ? REMEMBERED_SESSION_MAX_AGE_SECONDS
    : STANDARD_SESSION_MAX_AGE_SECONDS
}

export function resolveCookieMaxAge(
  cookieName: string,
  rememberMe: boolean,
): number | undefined {
  if (cookieName === "remember_me") {
    return REMEMBERED_SESSION_MAX_AGE_SECONDS
  }

  if (AUTH_COOKIE_NAMES.has(cookieName)) {
    return resolveAuthSessionMaxAge(rememberMe)
  }

  return undefined
}

export function resolveAuthCookieSameSite(
  requestedSameSite?: string | null,
): AuthCookieSameSite {
  if (requestedSameSite?.toLowerCase() === 'strict') {
    return 'strict'
  }

  // Default to same-site Lax. Cross-site None is broader than this app
  // needs because frontend auth is cookie-backed on the same site.
  return 'lax'
}
