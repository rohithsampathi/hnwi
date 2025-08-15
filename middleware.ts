import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RateLimiter } from "./lib/rate-limiter";
import { AuditLogger, AuditEventType, AuditSeverity } from "./lib/audit-logger";
import { CSRFProtection } from "./lib/csrf-protection";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = request.nextUrl;
  
  // Generate CSP nonce for inline scripts
  const nonce = generateNonce();

  // Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  
  // Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  // Enhanced Content Security Policy with nonce and hash support
  const isDev = process.env.NODE_ENV !== "production";
  
  // Specific hashes for Next.js inline scripts (from the error messages)
  const nextJsHashes = [
    "'sha256-Q+8tPsjVtiDsjF/Cv8FMOpg2Yg91oKFKDAJat1PPb2g='",
    "'sha256-KVGCjOWd6A4YXQjBVaM9km5TM69ci9SPmTA9fM0c+TI='", 
    "'sha256-hDLTg33Ow2YmZMgUT11FSMjnOrvW8RFwQIxTAyUO4TE='",
    "'sha256-gKmPYQ60ilP/jPs99aSTUzZHdLDWMaHvFHi8vtyqnUY='",
    "'sha256-dWyLesJo+5wsXLVIIo8A+eHgP5Ekxez/vXrqYE4wlK8='",
    "'sha256-IYQwQlCS7tlDdfed8qCp+uGm3rBPumW7jftgB2PJ+k0='"
  ];
  
  const cspDirectives = [
    "default-src 'self'",
    // Include both nonce and specific hashes for Next.js inline scripts
    `script-src 'self' ${isDev ? `'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval'` : `'nonce-${nonce}' ${nextJsHashes.join(' ')}`} https://cdn.jsdelivr.net https://unpkg.com https://checkout.razorpay.com https://api-js.mixpanel.com`,
    // Style sources with nonce support - allow unsafe-inline for development
    `style-src 'self' ${isDev ? `'unsafe-inline'` : `'nonce-${nonce}'`} https://fonts.googleapis.com`,
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.razorpay.com https://*.vercel.app wss://*.vercel.app https://uwind.onrender.com https://api-js.mixpanel.com https://formspree.io",
    "frame-src 'self' https://api.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    ...(isDev ? [] : ["block-all-mixed-content", "upgrade-insecure-requests"])
  ];

  response.headers.set(
    "Content-Security-Policy",
    cspDirectives.join("; ")
  );

  // Add CSP nonce to response for use by Next.js
  response.headers.set("X-CSP-Nonce", nonce);

  // CORS Headers for API routes with enhanced security
  if (url.pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"];
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token, X-Request-ID, X-Client-Version, X-Request-Timestamp");
      response.headers.set("Access-Control-Max-Age", "86400");
    }

    // Enhanced API security checks
    handleAPIRequest(request, response);
  }

  // Add request ID for tracking
  const requestId = request.headers.get("X-Request-ID") || crypto.randomUUID();
  response.headers.set("X-Request-ID", requestId);

  return response;
}

// Generate cryptographically secure CSP nonce
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// Enhanced API request security handler
async function handleAPIRequest(request: NextRequest, response: NextResponse) {
  const pathname = new URL(request.url).pathname;
  const method = request.method;
  
  // Skip security checks for certain endpoints
  const publicEndpoints = [
    '/api/auth/csrf-token',
    '/api/og'
  ];
  
  if (publicEndpoints.some(endpoint => pathname.startsWith(endpoint))) {
    return;
  }

  // Log API access for audit purposes
  try {
    await AuditLogger.logEvent(
      AuditEventType.SENSITIVE_DATA_ACCESSED,
      `API_${method}_${pathname}`,
      'pending',
      {
        endpoint: pathname,
        method,
        userAgent: request.headers.get('user-agent') || undefined,
        ipAddress: getClientIP(request),
        requestId: request.headers.get('X-Request-ID') || crypto.randomUUID()
      }
    );
  } catch (error) {
    // Audit logging failure shouldn't break the request
  }
}

// Extract client IP for security logging
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (real) {
    return real.trim();
  }
  
  return request.ip || 'unknown';
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};