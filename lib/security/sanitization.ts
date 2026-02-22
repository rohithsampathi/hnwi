// lib/security/sanitization.ts - Data sanitization utilities for security logging

/**
 * Anonymize IP addresses for logging while maintaining tracking capability
 */
export function anonymizeIP(ip: string): string {
  if (!ip || ip === 'unknown') return 'unknown';

  try {
    // For IPv4, mask the last octet
    if (ip.includes('.') && !ip.includes(':')) {
      const parts = ip.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
      }
    }

    // For IPv6, mask the last 64 bits
    if (ip.includes(':')) {
      const parts = ip.split(':');
      if (parts.length >= 4) {
        return `${parts.slice(0, 4).join(':')}::xxxx`;
      }
    }

    // For other formats, create a consistent hash using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(ip);

    // Simple hash fallback for edge runtime compatibility
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash + data[i]) & 0xffffffff;
    }
    return `hash-${Math.abs(hash).toString(16).substring(0, 8)}`;
  } catch (error) {
    return 'anonymous';
  }
}

/**
 * Sanitize user agent for logging while preserving useful information
 */
export function sanitizeUserAgent(userAgent: string): string {
  if (!userAgent) return 'unknown';

  try {
    // Extract browser and OS info while removing unique identifiers
    const sanitized = userAgent
      // Remove version numbers that could be too specific
      .replace(/\/[\d.]+/g, '/x.x.x')
      // Remove build numbers and detailed version info
      .replace(/\(.*?\)/g, '(sanitized)')
      // Limit length
      .substring(0, 100);

    return sanitized + (userAgent.length > 100 ? '...' : '');
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Create safe error messages for API responses.
 * ALWAYS returns a sanitized message — even in development — to prevent
 * stack traces or internal details from leaking to the client.
 * Full errors are logged server-side instead.
 */
export function sanitizeErrorMessage(error: unknown, _isProduction?: boolean): string {
  // Return generic messages based on error type (always sanitized)
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Authentication/authorization errors
    if (message.includes('unauthorized') || message.includes('invalid credentials') || message.includes('token')) {
      return 'Authentication failed';
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid input') || message.includes('required')) {
      return 'Invalid input provided';
    }

    // Rate limiting
    if (message.includes('rate limit') || message.includes('too many')) {
      return 'Rate limit exceeded';
    }

    // Network/connection errors
    if (message.includes('connection') || message.includes('network') || message.includes('timeout')) {
      return 'Service temporarily unavailable';
    }

    // Database errors
    if (message.includes('database') || message.includes('query') || message.includes('mongodb')) {
      return 'Database operation failed';
    }
  }

  // Generic fallback
  return 'An error occurred while processing your request';
}

/**
 * Create safe error response for APIs
 */
export interface SafeErrorResponse {
  success: false;
  error: string;
  code?: string;
  timestamp: string;
}

export function createSafeErrorResponse(
  error: unknown,
  errorCode?: string,
  isProduction: boolean = process.env.NODE_ENV === 'production'
): SafeErrorResponse {
  return {
    success: false,
    error: sanitizeErrorMessage(error, isProduction),
    code: errorCode,
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate a consistent hash for tracking without revealing original data
 */
export function generateTrackingHash(data: string): string {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);

  // Simple hash for edge runtime compatibility
  let hash = 0;
  for (let i = 0; i < dataBytes.length; i++) {
    hash = ((hash << 5) - hash + dataBytes[i]) & 0xffffffff;
  }
  return Math.abs(hash).toString(16).substring(0, 16);
}

/**
 * Sanitize data for audit logging
 */
export interface LoggingContext {
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  userId?: string;
  [key: string]: any;
}

export function sanitizeLoggingContext(context: LoggingContext): LoggingContext {
  const sanitized: LoggingContext = {};

  // Anonymize IP if present
  if (context.ip) {
    sanitized.ipHash = generateTrackingHash(context.ip);
    sanitized.ipAnon = anonymizeIP(context.ip);
  }

  // Sanitize user agent if present
  if (context.userAgent) {
    sanitized.userAgentHash = generateTrackingHash(context.userAgent);
    sanitized.userAgentSanitized = sanitizeUserAgent(context.userAgent);
  }

  // Copy other safe properties
  if (context.endpoint) sanitized.endpoint = context.endpoint;
  if (context.userId) sanitized.userId = context.userId;

  // Copy other properties but avoid sensitive data
  Object.keys(context).forEach(key => {
    if (!['ip', 'userAgent', 'password', 'token', 'secret', 'key'].includes(key)) {
      sanitized[key] = context[key];
    }
  });

  return sanitized;
}