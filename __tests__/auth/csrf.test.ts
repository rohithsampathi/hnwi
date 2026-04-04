/**
 * CSRF Protection Unit Tests
 *
 * Verifies that CSRF validation:
 * 1. Passes when IP changes (mobile WiFi↔cellular switches)
 * 2. Passes when User-Agent changes (iOS Safari Fetch vs navigation UA)
 * 3. Fails when the token value doesn't match (core double-submit check)
 * 4. Fails when the token is expired
 * 5. Fails when the CSRF cookie is missing entirely
 */

import { NextRequest, NextResponse } from 'next/server';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Build a base64-encoded CSRF cookie value the same way csrf-protection does */
function makeCsrfCookieValue(opts: {
  token: string;
  timestamp?: number;
  userAgent?: string;
  ipHash?: string;
}): string {
  const data: Record<string, unknown> = {
    token: opts.token,
    timestamp: opts.timestamp ?? Date.now(),
  };
  if (opts.userAgent !== undefined) data.userAgent = opts.userAgent;
  if (opts.ipHash !== undefined) data.ipHash = opts.ipHash;
  return btoa(JSON.stringify(data));
}

/** Create a mock NextRequest with a CSRF cookie and header already set */
function makeRequest(opts: {
  csrfCookieValue: string | null;
  csrfHeader: string | null;
  userAgent?: string;
  ip?: string;
  method?: string;
  url?: string;
}): any {
  const headers: Record<string, string> = {};
  if (opts.csrfHeader) headers['x-csrf-token'] = opts.csrfHeader;
  if (opts.userAgent) headers['user-agent'] = opts.userAgent;
  if (opts.ip) headers['x-forwarded-for'] = opts.ip;

  const cookies: Record<string, string> = {};
  if (opts.csrfCookieValue) cookies['csrf_token'] = opts.csrfCookieValue;
  const cookieHeader = Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');

  if (cookieHeader) {
    headers.cookie = cookieHeader;
  }

  return new NextRequest(opts.url || 'http://localhost/api/auth/login', {
    method: opts.method || 'POST',
    headers,
  });
}

// ── import the validator (after mocks are in place) ──────────────────────────

// We import dynamically to ensure mocks are applied first
let validateCSRFToken: (req: any) => Promise<{ valid: boolean; error?: string }>;

beforeAll(async () => {
  const mod = await import('@/lib/csrf-protection');
  validateCSRFToken = mod.CSRFProtection.validateCSRFToken.bind(mod.CSRFProtection);
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('CSRFProtection.validateCSRFToken', () => {
  const TOKEN = 'test-token-abc123';

  test('GET requests are always valid (no CSRF needed)', async () => {
    const req = makeRequest({ csrfCookieValue: null, csrfHeader: null, method: 'GET' });
    const result = await validateCSRFToken(req);
    expect(result.valid).toBe(true);
  });

  test('valid token passes when IP matches original', async () => {
    const cookieVal = makeCsrfCookieValue({ token: TOKEN, ipHash: 'some-hash' });
    const req = makeRequest({
      csrfCookieValue: cookieVal,
      csrfHeader: TOKEN,
      ip: '203.0.113.1',
    });
    const result = await validateCSRFToken(req);
    expect(result.valid).toBe(true);
  });

  test('valid token passes when IP CHANGES (mobile network switch)', async () => {
    // Token was generated with ipHash for 203.0.113.1
    // Request now comes from a different IP (cellular hand-off)
    const cookieVal = makeCsrfCookieValue({ token: TOKEN, ipHash: 'hash-of-original-ip' });
    const req = makeRequest({
      csrfCookieValue: cookieVal,
      csrfHeader: TOKEN,
      ip: '198.51.100.42', // different IP — mobile network change
    });
    const result = await validateCSRFToken(req);
    expect(result.valid).toBe(true);
  });

  test('valid token passes when User-Agent CHANGES (iOS Safari Fetch vs navigation)', async () => {
    // Token generated with the navigation User-Agent
    const navUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15';
    // Fetch API on Safari sometimes sends a slightly different UA
    const fetchUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

    const cookieVal = makeCsrfCookieValue({ token: TOKEN, userAgent: navUA });
    const req = makeRequest({
      csrfCookieValue: cookieVal,
      csrfHeader: TOKEN,
      userAgent: fetchUA, // different from the stored UA
    });
    const result = await validateCSRFToken(req);
    expect(result.valid).toBe(true);
  });

  test('valid token passes when both IP and UA are missing from legacy token', async () => {
    // Legacy tokens only have { token, timestamp }
    const cookieVal = makeCsrfCookieValue({ token: TOKEN });
    const req = makeRequest({
      csrfCookieValue: cookieVal,
      csrfHeader: TOKEN,
      ip: '1.2.3.4',
      userAgent: 'SomeAgent/1.0',
    });
    const result = await validateCSRFToken(req);
    expect(result.valid).toBe(true);
  });

  test('fails when token value in header does NOT match cookie', async () => {
    const cookieVal = makeCsrfCookieValue({ token: TOKEN });
    const req = makeRequest({
      csrfCookieValue: cookieVal,
      csrfHeader: 'wrong-token-value',
    });
    const result = await validateCSRFToken(req);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('mismatch');
  });

  test('fails when CSRF cookie is completely missing', async () => {
    const req = makeRequest({
      csrfCookieValue: null,
      csrfHeader: TOKEN,
    });
    const result = await validateCSRFToken(req);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('cookie');
  });

  test('fails when CSRF header is missing', async () => {
    const cookieVal = makeCsrfCookieValue({ token: TOKEN });
    const req = makeRequest({
      csrfCookieValue: cookieVal,
      csrfHeader: null,
    });
    const result = await validateCSRFToken(req);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('header');
  });

  test('fails when token has expired (timestamp > 1 hour ago)', async () => {
    const expiredTimestamp = Date.now() - 2 * 60 * 60 * 1000; // 2 hours ago
    const cookieVal = makeCsrfCookieValue({ token: TOKEN, timestamp: expiredTimestamp });
    const req = makeRequest({
      csrfCookieValue: cookieVal,
      csrfHeader: TOKEN,
    });
    const result = await validateCSRFToken(req);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('expired');
  });

  test('passes when token is fresh (timestamp within 1 hour)', async () => {
    const recentTimestamp = Date.now() - 30 * 60 * 1000; // 30 minutes ago
    const cookieVal = makeCsrfCookieValue({ token: TOKEN, timestamp: recentTimestamp });
    const req = makeRequest({
      csrfCookieValue: cookieVal,
      csrfHeader: TOKEN,
    });
    const result = await validateCSRFToken(req);
    expect(result.valid).toBe(true);
  });

  test('handles legacy format (raw token string, not JSON) as valid', async () => {
    // Old clients that stored raw token string instead of base64 JSON
    // These are treated as legacy and pass through timestamp check
    const req = makeRequest({
      csrfCookieValue: TOKEN, // raw string, not base64 JSON
      csrfHeader: TOKEN,
    });
    const result = await validateCSRFToken(req);
    // Legacy format: cookie = raw token, header = same token → should pass
    expect(result.valid).toBe(true);
  });
});
