interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (identifier: string) => string;
}

interface RateLimitStore {
  hits: number;
  resetTime: number;
}

// Persist instances on globalThis to survive Next.js hot module replacement (HMR).
// In production single-instance Docker this is a no-op; in dev it prevents
// counters from resetting on every code change.
// NOTE: For multi-instance scaling, replace with Redis/Upstash.
const globalRateLimiters: Map<string, RateLimiter> =
  (globalThis as any).__rateLimiters || new Map<string, RateLimiter>();
(globalThis as any).__rateLimiters = globalRateLimiters;

export class RateLimiter {
  private static instances = globalRateLimiters;
  private store = new Map<string, RateLimitStore>();
  private config: RateLimitConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: RateLimitConfig) {
    this.config = {
      ...config,
      keyGenerator: config.keyGenerator || ((id) => id)
    };
    this.startCleanup();
  }

  static getInstance(name: string, config?: RateLimitConfig): RateLimiter {
    if (!RateLimiter.instances.has(name)) {
      if (!config) {
        throw new Error(`RateLimiter ${name} not initialized`);
      }
      RateLimiter.instances.set(name, new RateLimiter(config));
    }
    return RateLimiter.instances.get(name)!;
  }

  async checkLimit(identifier: string): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const key = this.config.keyGenerator!(identifier);
    const now = Date.now();
    
    let record = this.store.get(key);

    // Initialize or reset if window expired
    if (!record || now > record.resetTime) {
      record = {
        hits: 0,
        resetTime: now + this.config.windowMs
      };
      this.store.set(key, record);
    }

    record.hits++;
    const allowed = record.hits <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - record.hits);

    const result = {
      allowed,
      limit: this.config.maxRequests,
      remaining,
      resetTime: record.resetTime,
      retryAfter: allowed ? undefined : Math.ceil((record.resetTime - now) / 1000)
    };

    return result;
  }

  reset(identifier: string): void {
    const key = this.config.keyGenerator!(identifier);
    this.store.delete(key);
  }

  private startCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.store.entries()) {
        if (now > record.resetTime) {
          this.store.delete(key);
        }
      }
    }, this.config.windowMs);
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Pre-configured rate limiters for different scenarios
export class RateLimiters {
  static readonly LOGIN = "login";
  static readonly API = "api";
  static readonly PASSWORD_RESET = "password_reset";
  static readonly DATA_ACCESS = "data_access";
  static readonly FILE_UPLOAD = "file_upload";

  static initialize(): void {
    // Login attempts: 5 per 15 minutes
    RateLimiter.getInstance(RateLimiters.LOGIN, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 5,
      skipSuccessfulRequests: true
    });

    // API calls: 100 per minute
    RateLimiter.getInstance(RateLimiters.API, {
      windowMs: 60 * 1000,
      maxRequests: 100
    });

    // Password reset: 3 per hour
    RateLimiter.getInstance(RateLimiters.PASSWORD_RESET, {
      windowMs: 60 * 60 * 1000,
      maxRequests: 3
    });

    // Data access: 200 per hour (sufficient for normal usage)
    RateLimiter.getInstance(RateLimiters.DATA_ACCESS, {
      windowMs: 60 * 60 * 1000,
      maxRequests: 200
    });

    // File upload: 10 per hour
    RateLimiter.getInstance(RateLimiters.FILE_UPLOAD, {
      windowMs: 60 * 60 * 1000,
      maxRequests: 10
    });
  }
}

// DDoS Protection
export class DDoSProtection {
  private static blacklist = new Set<string>();
  private static suspiciousActivity = new Map<string, number>();
  private static readonly THRESHOLD = 1000; // Requests per minute threshold
  private static readonly BLACKLIST_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static async checkRequest(
    identifier: string,
    userAgent?: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Check blacklist
    if (DDoSProtection.blacklist.has(identifier)) {
      return { allowed: false, reason: "Blacklisted due to suspicious activity" };
    }

    // Check for suspicious patterns
    if (userAgent) {
      const suspiciousPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i,
        /curl/i,
        /wget/i,
        /python/i,
        /java/i,
        /ruby/i
      ];

      const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
      if (isSuspicious && !DDoSProtection.isKnownGoodBot(userAgent)) {
        DDoSProtection.recordSuspiciousActivity(identifier);
        
        const suspiciousCount = DDoSProtection.suspiciousActivity.get(identifier) || 0;
        if (suspiciousCount > 10) {
          DDoSProtection.blacklist.add(identifier);
          setTimeout(() => DDoSProtection.blacklist.delete(identifier), DDoSProtection.BLACKLIST_DURATION);
          return { allowed: false, reason: "Blocked due to suspicious bot activity" };
        }
      }
    }

    // Check rate limit for DDoS
    const rateLimiter = RateLimiter.getInstance("ddos", {
      windowMs: 60 * 1000,
      maxRequests: DDoSProtection.THRESHOLD
    });

    const limitCheck = await rateLimiter.checkLimit(identifier);
    if (!limitCheck.allowed) {
      DDoSProtection.blacklist.add(identifier);
      setTimeout(() => DDoSProtection.blacklist.delete(identifier), DDoSProtection.BLACKLIST_DURATION);
      return { allowed: false, reason: "Rate limit exceeded - possible DDoS attack" };
    }

    return { allowed: true };
  }

  private static isKnownGoodBot(userAgent: string): boolean {
    const goodBots = [
      /googlebot/i,
      /bingbot/i,
      /slurp/i, // Yahoo
      /duckduckbot/i,
      /facebookexternalhit/i,
      /twitterbot/i,
      /linkedinbot/i,
      /whatsapp/i
    ];

    return goodBots.some(pattern => pattern.test(userAgent));
  }

  private static recordSuspiciousActivity(identifier: string): void {
    const current = DDoSProtection.suspiciousActivity.get(identifier) || 0;
    DDoSProtection.suspiciousActivity.set(identifier, current + 1);

    // Clear after 1 hour
    setTimeout(() => {
      DDoSProtection.suspiciousActivity.delete(identifier);
    }, 60 * 60 * 1000);
  }

  static clearBlacklist(): void {
    DDoSProtection.blacklist.clear();
  }

  static getBlacklistedIdentifiers(): string[] {
    return Array.from(DDoSProtection.blacklist);
  }
}

// Client-side rate limiting
export class ClientRateLimiter {
  private static requests = new Map<string, number[]>();

  static canMakeRequest(endpoint: string, limit: number = 10, windowMs: number = 1000): boolean {
    const now = Date.now();
    const requests = ClientRateLimiter.requests.get(endpoint) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= limit) {
      return false;
    }

    validRequests.push(now);
    ClientRateLimiter.requests.set(endpoint, validRequests);
    
    return true;
  }

  static reset(endpoint?: string): void {
    if (endpoint) {
      ClientRateLimiter.requests.delete(endpoint);
    } else {
      ClientRateLimiter.requests.clear();
    }
  }
}

// Initialize rate limiters
if (typeof window !== "undefined") {
  RateLimiters.initialize();
}