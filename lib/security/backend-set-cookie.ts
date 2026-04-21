import type { NextResponse } from 'next/server'

import { resolveAuthCookieSameSite, resolveCookieMaxAge } from '@/lib/auth-cookie-policy'

type ParsedSameSite = 'lax' | 'strict' | 'none' | null

export interface ParsedSetCookie {
  name: string
  value: string
  attributes: Map<string, string>
  flags: Set<string>
  raw: string
}

type HeaderShape = Headers & {
  getSetCookie?: () => string[]
  raw?: () => Record<string, string[]>
}

const COOKIE_BOUNDARY = /^\s*[^=;,\s]+=/

export function getSetCookieHeaders(headers: Headers): string[] {
  const typedHeaders = headers as HeaderShape

  if (typeof typedHeaders.getSetCookie === 'function') {
    const cookies = typedHeaders.getSetCookie().filter(Boolean)
    if (cookies.length > 0) {
      return cookies
    }
  }

  if (typeof typedHeaders.raw === 'function') {
    const rawHeaders = typedHeaders.raw()
    const rawSetCookies = rawHeaders['set-cookie'] ?? rawHeaders['Set-Cookie']
    if (Array.isArray(rawSetCookies) && rawSetCookies.length > 0) {
      return rawSetCookies.filter(Boolean)
    }
  }

  const combinedHeader = headers.get('set-cookie')
  return combinedHeader ? splitCombinedSetCookieHeader(combinedHeader) : []
}

export function parseSetCookieHeader(header: string): ParsedSetCookie {
  const segments = header.split(';').map((segment) => segment.trim()).filter(Boolean)
  const [nameValue = '', ...attributeSegments] = segments
  const separatorIndex = nameValue.indexOf('=')

  if (separatorIndex <= 0) {
    throw new Error(`Invalid Set-Cookie header: ${header}`)
  }

  const name = nameValue.slice(0, separatorIndex)
  const value = nameValue.slice(separatorIndex + 1)
  const attributes = new Map<string, string>()
  const flags = new Set<string>()

  for (const segment of attributeSegments) {
    const attributeIndex = segment.indexOf('=')
    if (attributeIndex === -1) {
      flags.add(segment.toLowerCase())
      continue
    }

    const attributeName = segment.slice(0, attributeIndex).trim().toLowerCase()
    const attributeValue = segment.slice(attributeIndex + 1).trim()
    attributes.set(attributeName, attributeValue)
  }

  return { name, value, attributes, flags, raw: header }
}

export function applyBackendAuthCookies(
  response: NextResponse,
  setCookieHeaders: string[],
  rememberDevice: boolean,
  options: {
    cookieDomain?: string
    secureDefault: boolean
  },
): void {
  for (const header of setCookieHeaders) {
    const cookie = parseSetCookieHeader(header)
    const sameSite = parseSameSite(cookie.attributes.get('samesite'))

    const cookieOptions: any = {
      name: cookie.name,
      value: cookie.value,
      httpOnly: cookie.flags.has('httponly'),
      secure: options.secureDefault || cookie.flags.has('secure'),
      sameSite: resolveAuthCookieSameSite(sameSite),
      path: cookie.attributes.get('path') ?? '/',
    }

    const maxAge = resolveCookieMaxAge(cookie.name, rememberDevice)
    if (typeof maxAge === 'number') {
      cookieOptions.maxAge = maxAge
    }

    if (options.cookieDomain) {
      cookieOptions.domain = options.cookieDomain
    }

    response.cookies.set(cookieOptions)
  }
}

export function appendSetCookieHeaders(response: NextResponse, setCookieHeaders: string[]): void {
  for (const header of setCookieHeaders) {
    response.headers.append('set-cookie', header)
  }
}

function splitCombinedSetCookieHeader(header: string): string[] {
  const cookies: string[] = []
  let start = 0
  let inExpires = false

  for (let index = 0; index < header.length; index += 1) {
    const char = header[index]
    const lowerRemaining = header.slice(index).toLowerCase()

    if (lowerRemaining.startsWith('expires=')) {
      inExpires = true
      index += 'expires='.length - 1
      continue
    }

    if (inExpires && char === ';') {
      inExpires = false
      continue
    }

    if (char !== ',' || inExpires) {
      continue
    }

    const nextChunk = header.slice(index + 1)
    if (!COOKIE_BOUNDARY.test(nextChunk)) {
      continue
    }

    const cookie = header.slice(start, index).trim()
    if (cookie) {
      cookies.push(cookie)
    }
    start = index + 1
  }

  const finalCookie = header.slice(start).trim()
  if (finalCookie) {
    cookies.push(finalCookie)
  }

  return cookies
}

function parseSameSite(value?: string): ParsedSameSite {
  if (!value) {
    return null
  }

  const normalized = value.trim().toLowerCase()
  if (normalized === 'lax' || normalized === 'strict' || normalized === 'none') {
    return normalized
  }

  return null
}
