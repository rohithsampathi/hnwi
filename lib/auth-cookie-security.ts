import type { NextRequest } from "next/server"

function isLocalHost(host: string): boolean {
  const lowerHost = host.toLowerCase()
  const normalized = lowerHost.startsWith("[")
    ? lowerHost.slice(0, lowerHost.indexOf("]") + 1)
    : lowerHost.split(":")[0]
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "[::1]" ||
    normalized === "::1"
  )
}

function getRootCookieDomain(hostname: string): string | undefined {
  const parts = hostname.toLowerCase().split(".").filter(Boolean)
  if (parts.length < 2) {
    return undefined
  }

  return `.${parts.slice(-2).join(".")}`
}

export function resolveAuthCookieDomain(request?: NextRequest): string | undefined {
  const requestHost = request?.headers.get("host") || request?.nextUrl.host || ""
  if (!requestHost || isLocalHost(requestHost)) {
    return undefined
  }

  const requestHostname = requestHost.toLowerCase().split(":")[0]
  const productionUrl = process.env.NEXT_PUBLIC_PRODUCTION_URL || ""
  if (!productionUrl) {
    return undefined
  }

  try {
    const productionHostname = new URL(productionUrl).hostname.toLowerCase()
    const rootDomain = getRootCookieDomain(productionHostname)
    if (!rootDomain) {
      return undefined
    }

    const rootHostname = rootDomain.slice(1)
    if (requestHostname === rootHostname || requestHostname.endsWith(rootDomain)) {
      return rootDomain
    }
  } catch {
    return undefined
  }

  return undefined
}

export function shouldUseSecureAuthCookies(request?: NextRequest): boolean {
  const forwardedProto = request?.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase()
  const requestProto = request?.nextUrl.protocol.replace(":", "").toLowerCase()
  const proto = forwardedProto || requestProto
  const host = request?.headers.get("host") || request?.nextUrl.host || ""

  if (host && isLocalHost(host)) {
    return false
  }

  if (proto === "https") {
    return true
  }

  if (proto === "http") {
    return false
  }

  return process.env.NODE_ENV === "production"
}
