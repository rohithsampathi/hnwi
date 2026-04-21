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
  const rawMessage =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : '';

  const message = rawMessage.toLowerCase();

  if (message) {
    // Authentication/authorization errors
    if (
      message.includes('unauthorized') ||
      message.includes('invalid credentials') ||
      message.includes('invalid email') ||
      message.includes('invalid password') ||
      message.includes('authentication failed') ||
      message.includes('token')
    ) {
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

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);

const restoreSimpleTag = (value: string, tagName: string): string => {
  const openTag = new RegExp(`&lt;${tagName}&gt;`, 'gi');
  const closeTag = new RegExp(`&lt;\\/${tagName}&gt;`, 'gi');
  return value.replace(openTag, `<${tagName}>`).replace(closeTag, `</${tagName}>`);
};

const restoreSelfClosingTag = (value: string, tagName: string): string =>
  value
    .replace(new RegExp(`&lt;${tagName}\\s*\\/?&gt;`, 'gi'), `<${tagName} />`)
    .replace(new RegExp(`&lt;\\/${tagName}&gt;`, 'gi'), '');

const sanitizeHref = (href: string): string | null => {
  const trimmed = href.trim();
  if (!trimmed) return null;

  const isSafe =
    /^(https?:|mailto:|tel:|\/|#)/i.test(trimmed) &&
    !/^\s*javascript:/i.test(trimmed) &&
    !/^\s*data:/i.test(trimmed);

  return isSafe ? escapeHtml(trimmed) : null;
};

export interface RichHtmlSanitizationOptions {
  allowCitations?: boolean;
  allowLinks?: boolean;
}

/**
 * Strict allow-list sanitizer for rich text rendered on the client.
 *
 * The function escapes the entire payload first, then selectively restores only
 * the small subset of tags and attributes that the UI actually needs.
 */
export function sanitizeRichHtml(
  value: string | null | undefined,
  options: RichHtmlSanitizationOptions = {},
): string {
  if (!value) return '';

  const { allowCitations = false, allowLinks = false } = options;

  let sanitized = escapeHtml(value);

  // Restore the handful of formatting tags the app intentionally supports.
  ['strong', 'em', 'b', 'i', 'u', 'p', 'ul', 'ol', 'li', 'blockquote'].forEach((tagName) => {
    sanitized = restoreSimpleTag(sanitized, tagName);
  });
  ['br', 'hr'].forEach((tagName) => {
    sanitized = restoreSelfClosingTag(sanitized, tagName);
  });

  if (allowLinks) {
    sanitized = sanitized.replace(
      /&lt;a\s+href=&quot;([^"]+)&quot;(?:\s+target=&quot;[^"]*&quot;)?(?:\s+rel=&quot;[^"]*&quot;)?\s*&gt;([\s\S]*?)&lt;\/a&gt;/gi,
      (_match, href, innerHtml) => {
        const safeHref = sanitizeHref(href);
        if (!safeHref) {
          return innerHtml;
        }

        return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${innerHtml}</a>`;
      },
    );
  }

  if (allowCitations) {
    sanitized = sanitized.replace(
      /&lt;citation\s+data-id=&quot;([A-Za-z0-9:_-]{1,128})&quot;\s+data-number=&quot;(\d{1,4})&quot;\s*&gt;\[(\d{1,4})\]&lt;\/citation&gt;/gi,
      (_match, citationId, citationNumber, displayNumber) =>
        `<citation data-id="${citationId}" data-number="${citationNumber}">[${displayNumber}]</citation>`,
    );
  }

  return sanitized;
}
