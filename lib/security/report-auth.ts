import type { NextRequest, NextResponse } from 'next/server'

const REPORT_AUTH_COOKIE_PREFIX = 'hnwi_report_access_'
const REPORT_AUTH_COOKIE_NAME = 'report_access_token'

const sanitizeIntakeIdForCookie = (intakeId: string): string =>
  intakeId.replace(/[^A-Za-z0-9_-]/g, '_')

export const getReportAuthCookieName = (intakeId: string): string =>
  `${REPORT_AUTH_COOKIE_PREFIX}${sanitizeIntakeIdForCookie(intakeId)}`

export const getReportAuthTokenFromRequest = (
  request: NextRequest,
  intakeId: string,
): string | null => {
  const cookieToken =
    request.cookies.get(REPORT_AUTH_COOKIE_NAME)?.value ??
    request.cookies.get(getReportAuthCookieName(intakeId))?.value
  return cookieToken ? `Bearer ${cookieToken}` : null
}

export const getAnyReportAuthTokenFromRequest = (request: NextRequest): string | null => {
  const reportCookie =
    request.cookies.get(REPORT_AUTH_COOKIE_NAME) ??
    request.cookies
      .getAll()
      .find((cookie) => cookie.name.startsWith(REPORT_AUTH_COOKIE_PREFIX))

  return reportCookie?.value ? `Bearer ${reportCookie.value}` : null
}

export const setReportAuthCookie = (
  response: NextResponse,
  intakeId: string,
  token: string,
  rememberDevice: boolean,
): void => {
  const isProduction = process.env.NODE_ENV === 'production'
  const baseCookie = {
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    ...(rememberDevice ? { maxAge: 7 * 24 * 60 * 60 } : {}),
  }

  response.cookies.set({
    name: REPORT_AUTH_COOKIE_NAME,
    ...baseCookie,
    path: '/api/decision-memo',
  })

  response.cookies.set({
    name: getReportAuthCookieName(intakeId),
    ...baseCookie,
    path: '/api/decision-memo',
  })
}

export const clearReportAuthCookie = (
  response: NextResponse,
  intakeId: string,
): void => {
  const baseCookie = {
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
  }

  response.cookies.set({
    name: REPORT_AUTH_COOKIE_NAME,
    ...baseCookie,
    path: '/api/decision-memo',
  })

  response.cookies.set({
    name: getReportAuthCookieName(intakeId),
    ...baseCookie,
    path: '/api/decision-memo',
  })
}
