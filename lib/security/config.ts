export interface SecurityConfig {
  encryption: {
    algorithm: string;
    keyLength: number;
    saltLength: number;
    iterations: number;
    enableAtRest: boolean;
    enableInTransit: boolean;
  };
  authentication: {
    jwtExpiry: number;
    refreshTokenExpiry: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireLowercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSpecialChars: boolean;
    mfaRequired: boolean;
    biometricEnabled: boolean;
  };
  session: {
    timeout: number;
    extendOnActivity: boolean;
    maxConcurrentSessions: number;
    cookieSecure: boolean;
    cookieHttpOnly: boolean;
    cookieSameSite: "strict" | "lax" | "none";
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
  };
  cors: {
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    credentials: boolean;
    maxAge: number;
  };
  headers: {
    hsts: {
      enabled: boolean;
      maxAge: number;
      includeSubDomains: boolean;
      preload: boolean;
    };
    csp: {
      enabled: boolean;
      directives: Record<string, string[]>;
    };
    additional: Record<string, string>;
  };
  gdpr: {
    enabled: boolean;
    dataRetentionDays: number;
    consentVersion: string;
    dpoEmail: string;
    allowDataExport: boolean;
    allowDataDeletion: boolean;
    anonymizeOnDeletion: boolean;
  };
  zeroTrust: {
    enabled: boolean;
    trustThreshold: number;
    highRiskThreshold: number;
    deviceFingerprintRequired: boolean;
    continuousVerification: boolean;
  };
  monitoring: {
    auditLogging: boolean;
    auditLogRetentionDays: number;
    securityAlertEmail: string;
    sentryDsn?: string;
    realTimeAlerts: boolean;
  };
  compliance: {
    soc2: boolean;
    iso27001: boolean;
    pciDss: boolean;
    hipaa: boolean;
    requireDataClassification: boolean;
  };
}

const developmentConfig: SecurityConfig = {
  encryption: {
    algorithm: "aes-256-gcm",
    keyLength: 32,
    saltLength: 64,
    iterations: 100000,
    enableAtRest: true,
    enableInTransit: true
  },
  authentication: {
    jwtExpiry: 3600000, // 1 hour
    refreshTokenExpiry: 604800000, // 7 days
    maxLoginAttempts: 5,
    lockoutDuration: 900000, // 15 minutes
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    mfaRequired: false,
    biometricEnabled: true
  },
  session: {
    timeout: 1800000, // 30 minutes
    extendOnActivity: true,
    maxConcurrentSessions: 5,
    cookieSecure: false,
    cookieHttpOnly: true,
    cookieSameSite: "lax"
  },
  rateLimit: {
    windowMs: 60000,
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  cors: {
    allowedOrigins: ["http://localhost:3000", "http://localhost:3001"],
    allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    credentials: true,
    maxAge: 86400
  },
  headers: {
    hsts: {
      enabled: false,
      maxAge: 31536000,
      includeSubDomains: true,
      preload: false
    },
    csp: {
      enabled: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": ["'self'", "http://localhost:3001"]
      }
    },
    additional: {
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "X-XSS-Protection": "1; mode=block"
    }
  },
  gdpr: {
    enabled: true,
    dataRetentionDays: 365,
    consentVersion: "2.0",
    dpoEmail: "dpo@example.com",
    allowDataExport: true,
    allowDataDeletion: true,
    anonymizeOnDeletion: true
  },
  zeroTrust: {
    enabled: true,
    trustThreshold: 60,
    highRiskThreshold: 40,
    deviceFingerprintRequired: false,
    continuousVerification: true
  },
  monitoring: {
    auditLogging: true,
    auditLogRetentionDays: 30,
    securityAlertEmail: "security@example.com",
    realTimeAlerts: false
  },
  compliance: {
    soc2: false,
    iso27001: false,
    pciDss: false,
    hipaa: false,
    requireDataClassification: false
  }
};

const productionConfig: SecurityConfig = {
  encryption: {
    algorithm: "aes-256-gcm",
    keyLength: 32,
    saltLength: 64,
    iterations: 200000,
    enableAtRest: true,
    enableInTransit: true
  },
  authentication: {
    jwtExpiry: 900000, // 15 minutes
    refreshTokenExpiry: 86400000, // 1 day
    maxLoginAttempts: 3,
    lockoutDuration: 1800000, // 30 minutes
    passwordMinLength: 12,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    mfaRequired: true,
    biometricEnabled: true
  },
  session: {
    timeout: 900000, // 15 minutes
    extendOnActivity: true,
    maxConcurrentSessions: 3,
    cookieSecure: true,
    cookieHttpOnly: true,
    cookieSameSite: "strict"
  },
  rateLimit: {
    windowMs: 60000,
    maxRequests: 50,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [],
    allowedMethods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    credentials: true,
    maxAge: 3600
  },
  headers: {
    hsts: {
      enabled: true,
      maxAge: 63072000, // 2 years
      includeSubDomains: true,
      preload: true
    },
    csp: {
      enabled: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'"],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": ["'self'"],
        "frame-ancestors": ["'none'"],
        "form-action": ["'self'"],
        "base-uri": ["'self'"],
        "object-src": ["'none'"]
      }
    },
    additional: {
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
    }
  },
  gdpr: {
    enabled: true,
    dataRetentionDays: parseInt(process.env.GDPR_DATA_RETENTION_DAYS || "365"),
    consentVersion: process.env.GDPR_CONSENT_VERSION || "2.0",
    dpoEmail: process.env.GDPR_DPO_EMAIL || "dpo@company.com",
    allowDataExport: true,
    allowDataDeletion: true,
    anonymizeOnDeletion: true
  },
  zeroTrust: {
    enabled: true,
    trustThreshold: 70,
    highRiskThreshold: 50,
    deviceFingerprintRequired: true,
    continuousVerification: true
  },
  monitoring: {
    auditLogging: true,
    auditLogRetentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || "90"),
    securityAlertEmail: process.env.SECURITY_ALERT_EMAIL || "security@company.com",
    sentryDsn: process.env.SENTRY_DSN,
    realTimeAlerts: true
  },
  compliance: {
    soc2: process.env.SOC2_COMPLIANCE_MODE === "true",
    iso27001: process.env.ISO27001_COMPLIANCE_MODE === "true",
    pciDss: process.env.PCI_DSS_COMPLIANCE_MODE === "true",
    hipaa: false,
    requireDataClassification: true
  }
};

export function getSecurityConfig(): SecurityConfig {
  const env = process.env.NODE_ENV || "development";
  return env === "production" ? productionConfig : developmentConfig;
}

export function validateSecurityConfig(config: SecurityConfig): boolean {
  // Validate encryption settings
  if (config.encryption.keyLength < 32) {
    console.error("Encryption key length must be at least 32 bytes");
    return false;
  }

  // Validate authentication settings
  if (config.authentication.passwordMinLength < 8) {
    console.error("Password minimum length must be at least 8 characters");
    return false;
  }

  // Validate session settings
  if (config.session.timeout < 300000) { // 5 minutes
    console.error("Session timeout must be at least 5 minutes");
    return false;
  }

  // Validate rate limiting
  if (config.rateLimit.maxRequests < 10) {
    console.error("Rate limit must allow at least 10 requests");
    return false;
  }

  // Validate GDPR settings
  if (config.gdpr.enabled && !config.gdpr.dpoEmail) {
    console.error("DPO email must be provided when GDPR is enabled");
    return false;
  }

  return true;
}

export const securityConfig = getSecurityConfig();

// Validate configuration on load
if (!validateSecurityConfig(securityConfig)) {
  console.error("Invalid security configuration detected");
  if (process.env.NODE_ENV === "production") {
    throw new Error("Security configuration validation failed");
  }
}