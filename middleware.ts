import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AuditLogger, AuditEventType } from "./lib/audit-logger";
import { CSRFProtection } from "./lib/csrf-protection";
import { sanitizeLoggingContext } from "./lib/security/sanitization";

const PUBLIC_API_ENDPOINTS = ["/api/auth/csrf-token", "/api/og", "/api/auth/refresh"];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const requestId = request.headers.get("X-Request-ID") || crypto.randomUUID();
  const nonce = generateNonce();
  const isDev = process.env.NODE_ENV !== "production";

  let backendOrigin = "";
  const apiBaseUrl = process.env.API_BASE_URL;
  if (apiBaseUrl) {
    try {
      backendOrigin = new URL(apiBaseUrl).origin;
    } catch {
      backendOrigin = "";
    }
  }

  const scriptSources = [
    "'self'",
    `'nonce-${nonce}'`,
    "https://cdn.jsdelivr.net",
    "https://unpkg.com",
    "https://checkout.razorpay.com",
    "https://api-js.mixpanel.com",
  ];

  if (isDev) {
    scriptSources.push("'unsafe-inline'", "'unsafe-eval'");
  } else {
    scriptSources.push("'strict-dynamic'");
  }

  const styleSources = ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"];

  const connectSources = [
    "'self'",
    "https://api.razorpay.com",
    "https://*.vercel.app",
    "wss://*.vercel.app",
    "https://api-js.mixpanel.com",
    "https://formspree.io",
  ];

  if (backendOrigin) {
    connectSources.push(backendOrigin);
  }

  if (isDev) {
    connectSources.push("http://localhost:*", "ws://localhost:*");
  }

  const cspDirectives = [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    `style-src ${styleSources.join(" ")}`,
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    `connect-src ${connectSources.join(" ")}`,
    "frame-src 'self' https://api.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ];

  if (!isDev) {
    cspDirectives.push("block-all-mixed-content", "upgrade-insecure-requests");
  }

  const securityHeaders: Record<string, string> = {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    "Content-Security-Policy": cspDirectives.join("; "),
    "X-CSP-Nonce": nonce,
    "X-Request-ID": requestId,
  };

  if (!isDev) {
    securityHeaders["Strict-Transport-Security"] =
      "max-age=31536000; includeSubDomains; preload";
  }

  const isApiRoute = url.pathname.startsWith("/api/");
  const isStateChanging =
    request.method !== "GET" && request.method !== "HEAD" && request.method !== "OPTIONS";
  const isPublicEndpoint = PUBLIC_API_ENDPOINTS.some((endpoint) =>
    url.pathname.startsWith(endpoint),
  );

  const allowedOrigins =
    process.env.ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ??
    ["http://localhost:3000"];
  const origin = request.headers.get("origin");

  const applyCorsHeaders = (response: NextResponse) => {
    if (isApiRoute && origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-CSRF-Token, X-Request-ID, X-Client-Version, X-Request-Timestamp",
      );
      response.headers.set("Access-Control-Max-Age", "86400");
    }
  };

  if (isApiRoute && isStateChanging && !isPublicEndpoint) {
    const csrfValidation = CSRFProtection.validateCSRFToken(request);
    if (!csrfValidation.valid) {
      const denied = NextResponse.json(
        {
          success: false,
          error: csrfValidation.error || "CSRF validation failed",
          code: "CSRF_TOKEN_INVALID",
          requestId,
          timestamp: new Date().toISOString(),
        },
        { status: 403 },
      );

      applyCorsHeaders(denied);
      Object.entries(securityHeaders).forEach(([key, value]) => {
        denied.headers.set(key, value);
      });

      return denied;
    }
  }

  const response = NextResponse.next();

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  applyCorsHeaders(response);

  if (isApiRoute && !isPublicEndpoint) {
    await handleAPIRequest(request, requestId);
  }

  return response;
}

function generateNonce(): string {
  const array = new Uint8Array(16);

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  return btoa(String.fromCharCode(...array));
}

async function handleAPIRequest(request: NextRequest, requestId: string) {
  const pathname = new URL(request.url).pathname;

  try {
    const context = sanitizeLoggingContext({
      endpoint: pathname,
      method: request.method,
      userAgent: request.headers.get("user-agent") || undefined,
      ip: getClientIP(request),
      requestId,
    });

    await AuditLogger.logEvent(
      AuditEventType.SENSITIVE_DATA_ACCESSED,
      `API_${request.method}_${pathname}`,
      "pending",
      context,
    );
  } catch {
    // Audit logging failure shouldn't block request flow
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (real) {
    return real.trim();
  }

  return request.ip || "unknown";
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
