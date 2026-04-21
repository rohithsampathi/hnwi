import {
  REMEMBERED_SESSION_MAX_AGE_SECONDS,
  STANDARD_SESSION_MAX_AGE_SECONDS,
  resolveAuthCookieSameSite,
  resolveAuthSessionMaxAge,
  resolveCookieMaxAge,
} from '@/lib/auth-cookie-policy'

describe('auth-cookie-policy', () => {
  test('uses a 7 day session when remember-me is enabled', () => {
    expect(resolveAuthSessionMaxAge(true)).toBe(REMEMBERED_SESSION_MAX_AGE_SECONDS)
  })

  test('uses a 24 hour session when remember-me is disabled', () => {
    expect(resolveAuthSessionMaxAge(false)).toBe(STANDARD_SESSION_MAX_AGE_SECONDS)
  })

  test('auth cookies inherit remember-me lifetime', () => {
    expect(resolveCookieMaxAge('access_token', true)).toBe(REMEMBERED_SESSION_MAX_AGE_SECONDS)
    expect(resolveCookieMaxAge('access_token', false)).toBe(STANDARD_SESSION_MAX_AGE_SECONDS)
    expect(resolveCookieMaxAge('session_user', false)).toBe(STANDARD_SESSION_MAX_AGE_SECONDS)
  })

  test('remember_me cookie is always capped at 7 days', () => {
    expect(resolveCookieMaxAge('remember_me', true)).toBe(REMEMBERED_SESSION_MAX_AGE_SECONDS)
    expect(resolveCookieMaxAge('remember_me', false)).toBe(REMEMBERED_SESSION_MAX_AGE_SECONDS)
  })

  test('unknown cookies are left unchanged', () => {
    expect(resolveCookieMaxAge('feature_flag', true)).toBeUndefined()
  })

  test('same-site defaults to lax and never widens to none', () => {
    expect(resolveAuthCookieSameSite()).toBe('lax')
    expect(resolveAuthCookieSameSite(null)).toBe('lax')
    expect(resolveAuthCookieSameSite('none')).toBe('lax')
    expect(resolveAuthCookieSameSite('Lax')).toBe('lax')
  })

  test('strict is only preserved when explicitly requested', () => {
    expect(resolveAuthCookieSameSite('strict')).toBe('strict')
    expect(resolveAuthCookieSameSite('STRICT')).toBe('strict')
  })
})
