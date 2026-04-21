import { NextRequest, NextResponse } from 'next/server'

import {
  clearReportAuthCookie,
  getAnyReportAuthTokenFromRequest,
  getReportAuthCookieName,
  getReportAuthTokenFromRequest,
  setReportAuthCookie,
} from '@/lib/security/report-auth'

describe('report-auth cookie helpers', () => {
  test('sanitizes intake ids used in cookie names', () => {
    expect(getReportAuthCookieName('fo/audit:abc?123')).toBe('hnwi_report_access_fo_audit_abc_123')
  })

  test('reads intake-scoped or generic report auth from cookies', () => {
    const cookieHeader = [
      'report_access_token=generic-token',
      `${getReportAuthCookieName('fo_audit_1')}=scoped-token`,
    ].join('; ')
    const request = new NextRequest('http://localhost/api/decision-memo/session/test', {
      headers: {
        cookie: cookieHeader,
      },
    })

    expect(getReportAuthTokenFromRequest(request, 'fo_audit_1')).toBe('Bearer generic-token')
    expect(getAnyReportAuthTokenFromRequest(request)).toBe('Bearer generic-token')
  })

  test('falls back to intake-specific auth when generic cookie is absent', () => {
    const cookieHeader = `${getReportAuthCookieName('fo_audit_2')}=scoped-token`
    const request = new NextRequest('http://localhost/api/decision-memo/session/test', {
      headers: {
        cookie: cookieHeader,
      },
    })

    expect(getReportAuthTokenFromRequest(request, 'fo_audit_2')).toBe('Bearer scoped-token')
    expect(getAnyReportAuthTokenFromRequest(request)).toBe('Bearer scoped-token')
  })

  test('sets hardened report auth cookies with same-site lax and httpOnly', () => {
    const response = NextResponse.json({ ok: true })

    setReportAuthCookie(response, 'fo_audit_3', 'token-123', true)

    const genericCookie = response.cookies.get('report_access_token')
    const scopedCookie = response.cookies.get(getReportAuthCookieName('fo_audit_3'))

    expect(genericCookie).toMatchObject({
      value: 'token-123',
      httpOnly: true,
      sameSite: 'lax',
      path: '/api/decision-memo',
      maxAge: 7 * 24 * 60 * 60,
    })
    expect(scopedCookie).toMatchObject({
      value: 'token-123',
      httpOnly: true,
      sameSite: 'lax',
      path: '/api/decision-memo',
      maxAge: 7 * 24 * 60 * 60,
    })
  })

  test('clears both generic and scoped report auth cookies', () => {
    const response = NextResponse.json({ ok: true })

    clearReportAuthCookie(response, 'fo_audit_4')

    expect(response.cookies.get('report_access_token')).toMatchObject({
      value: '',
      maxAge: 0,
      httpOnly: true,
      sameSite: 'lax',
    })
    expect(response.cookies.get(getReportAuthCookieName('fo_audit_4'))).toMatchObject({
      value: '',
      maxAge: 0,
      httpOnly: true,
      sameSite: 'lax',
    })
  })
})
