// lib/secure-logger.ts - Secure logging utility to prevent data leaks

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface SecureLoggerConfig {
  enabled: boolean;
  level: LogLevel;
  sanitizeData: boolean;
}

const config: SecureLoggerConfig = {
  enabled: process.env.NODE_ENV !== 'production',
  level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  sanitizeData: true
};

// Sensitive data patterns to sanitize
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /auth/i,
  /session/i,
  /credential/i,
  /private/i
];

// Fields that should never be logged
const FORBIDDEN_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'privateKey',
  'sessionId',
  'userId', // Sensitive for HNWI data
  'user_id',
  'ssn',
  'creditCard'
];

function sanitizeData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }

  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Check if field should be completely omitted
    if (FORBIDDEN_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }
    
    // Check if field contains sensitive patterns
    if (SENSITIVE_PATTERNS.some(pattern => pattern.test(key))) {
      sanitized[key] = '[SANITIZED]';
      continue;
    }
    
    // Recursively sanitize nested objects
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

class SecureLogger {
  private shouldLog(level: LogLevel): boolean {
    if (!config.enabled) return false;
    
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(config.level);
    const requestedLevelIndex = levels.indexOf(level);
    
    return requestedLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const sanitizedData = config.sanitizeData && data ? sanitizeData(data) : data;
    
    if (sanitizedData) {
      return `[${timestamp}] [${level.toUpperCase()}] ${message} ${JSON.stringify(sanitizedData)}`;
    }
    
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, data?: any) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, data?: any) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, data));
    }
  }

  // Production-safe logging for critical errors only
  critical(message: string, data?: any) {
    console.error(this.formatMessage('error', `CRITICAL: ${message}`, data));
  }
}

export const logger = new SecureLogger();
export default logger;