import type { NextRequest, NextResponse } from 'next/server'

import { resolveAuthCookieDomain, shouldUseSecureAuthCookies } from '@/lib/auth-cookie-security'

const AUTH_COOKIE_NAMES = [
  'access_token',
  'refresh_token',
  'csrf_token',
  '__Secure-csrf_token',
  'session_user',
  'session_token',
  'remember_me',
]

const AUTH_COOKIE_PATHS = ['/', '/api/auth']

export interface AppendCookieOptions {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
  path?: string
  maxAge?: number
  domain?: string
}

function isCsrfCookie(name: string): boolean {
  return name.toLowerCase().includes('csrf')
}

function expireCookie(
  response: NextResponse,
  name: string,
  options: {
    secure: boolean
    domain?: string
    path: string
  },
): void {
  const segments = [
    `${name}=`,
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    `Path=${options.path}`,
    'SameSite=Lax',
  ]
  const requiresSecurePrefix = name.startsWith('__Secure-') || name.startsWith('__Host-')

  if (options.domain) {
    segments.push(`Domain=${options.domain}`)
  }

  if (options.secure || requiresSecurePrefix) {
    segments.push('Secure')
  }

  if (!isCsrfCookie(name)) {
    segments.push('HttpOnly')
  }

  response.headers.append('Set-Cookie', segments.join('; '))
}

export function appendCookie(
  response: NextResponse,
  name: string,
  value: string,
  options: AppendCookieOptions = {},
): void {
  const segments = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${options.path ?? '/'}`,
  ]

  if (typeof options.maxAge === 'number') {
    segments.push(`Max-Age=${options.maxAge}`)
  }

  if (options.domain) {
    segments.push(`Domain=${options.domain}`)
  }

  if (options.secure) {
    segments.push('Secure')
  }

  if (options.httpOnly) {
    segments.push('HttpOnly')
  }

  if (options.sameSite) {
    const sameSite = options.sameSite === 'none'
      ? 'None'
      : options.sameSite === 'strict'
        ? 'Strict'
        : 'Lax'
    segments.push(`SameSite=${sameSite}`)
  }

  response.headers.append('Set-Cookie', segments.join('; '))
}

function expireHostCsrfCookie(response: NextResponse): void {
  response.headers.append(
    'Set-Cookie',
    '__Host-csrf_token=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax; Secure',
  )
}

export function collectMfaCookieNames(request: NextRequest, mfaToken?: string | null): string[] {
  const names = new Set<string>(['mfa_session'])

  if (mfaToken) {
    names.add(`mfa_token_${mfaToken.substring(0, 8)}`)
  }

  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith('mfa_token_')) {
      names.add(cookie.name)
    }
  }

  return Array.from(names)
}

export function clearMfaCookies(
  response: NextResponse,
  request: NextRequest,
  mfaToken?: string | null,
): void {
  const secure = shouldUseSecureAuthCookies(request)
  const domain = resolveAuthCookieDomain(request)

  for (const name of collectMfaCookieNames(request, mfaToken)) {
    for (const path of AUTH_COOKIE_PATHS) {
      expireCookie(response, name, { secure, domain, path })
    }
  }
}

export function clearAuthCookies(
  response: NextResponse,
  request: NextRequest,
  options: {
    includeCsrf?: boolean
    includeMfa?: boolean
    mfaToken?: string | null
  } = {},
): void {
  const secure = shouldUseSecureAuthCookies(request)
  const domain = resolveAuthCookieDomain(request)
  const includeCsrf = options.includeCsrf ?? true

  for (const name of AUTH_COOKIE_NAMES) {
    if (!includeCsrf && isCsrfCookie(name)) {
      continue
    }

    for (const path of AUTH_COOKIE_PATHS) {
      expireCookie(response, name, { secure, domain, path })
    }
  }

  if (includeCsrf) {
    expireHostCsrfCookie(response)
  }

  if (options.includeMfa) {
    clearMfaCookies(response, request, options.mfaToken)
  }
}
