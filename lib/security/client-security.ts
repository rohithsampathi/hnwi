import { AES256Encryption, SecureStorage } from "./encryption";
import { SessionState, setSessionState, updateLastActivity, getSessionState } from "../auth-utils";
import { getSecurityConfig } from "./config";

interface SecurityConfig {
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  requireMFA: boolean;
  enforcePasswordPolicy: boolean;
  dataRetentionDays: number;
}

export class ClientSecurityManager {
  private static getConfig(): SecurityConfig {
    const globalConfig = getSecurityConfig();
    return {
      sessionTimeout: globalConfig.session.timeout, // Use centralized config (30 minutes)
      maxLoginAttempts: globalConfig.authentication.maxLoginAttempts,
      lockoutDuration: globalConfig.authentication.lockoutDuration,
      requireMFA: globalConfig.authentication.mfaRequired,
      enforcePasswordPolicy: true,
      dataRetentionDays: 90
    };
  }

  private static loginAttempts = new Map<string, { count: number; lockedUntil?: number }>();
  private static sessionActivity = new Map<string, number>();

  static initializeSession(userId: string): void {
    ClientSecurityManager.sessionActivity.set(userId, Date.now());
    setSessionState(SessionState.AUTHENTICATED);
    updateLastActivity();
    ClientSecurityManager.startSessionMonitor(userId);
  }

  private static startSessionMonitor(userId: string): void {
    if (typeof window === "undefined") return;

    const checkSession = () => {
      const lastActivity = ClientSecurityManager.sessionActivity.get(userId);
      const currentSessionState = getSessionState();
      
      if (!lastActivity) return;

      const inactiveTime = Date.now() - lastActivity;
      
      // If session is already locked, don't check again
      if (currentSessionState === SessionState.LOCKED_INACTIVE) {
        return;
      }
      
      // If user has been inactive for the timeout period, lock the session
      if (inactiveTime > ClientSecurityManager.getConfig().sessionTimeout) {
        ClientSecurityManager.lockSession(userId);
      }
    };

    const intervalId = setInterval(checkSession, 60000); // Check every minute
    
    // Store interval ID for cleanup
    if (typeof window !== "undefined") {
      (window as any).__sessionMonitor = intervalId;
    }
  }

  static updateActivity(userId: string): void {
    ClientSecurityManager.sessionActivity.set(userId, Date.now());
    
    // If session was locked, unlock it on activity
    const currentState = getSessionState();
    if (currentState === SessionState.LOCKED_INACTIVE) {
      setSessionState(SessionState.AUTHENTICATED);
    }
    
    updateLastActivity();
  }

  // New method to lock session without clearing data
  static lockSession(userId: string): void {
    try {
      // Double-check we're not already locked to prevent duplicate events
      const currentState = getSessionState();
      if (currentState === SessionState.LOCKED_INACTIVE) {
        return; // Already locked
      }
      
      setSessionState(SessionState.LOCKED_INACTIVE);
      
      // Dispatch custom event to trigger auth popup (only once per lock)
      if (typeof window !== "undefined") {
        // Use setTimeout to avoid blocking the session check
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('session-locked', { 
            detail: { userId, reason: 'inactivity' }
          }));
        }, 100);
      }
    } catch (error) {
      console.error('Error locking session:', error);
      // Fallback to old behavior if there's an error
      ClientSecurityManager.terminateSession(userId);
    }
  }

  static terminateSession(userId: string): void {
    ClientSecurityManager.sessionActivity.delete(userId);
    SecureStorage.clear();
    setSessionState(SessionState.UNAUTHENTICATED);
    
    if (typeof window !== "undefined" && (window as any).__sessionMonitor) {
      clearInterval((window as any).__sessionMonitor);
    }
  }

  static checkLoginAttempt(email: string): { allowed: boolean; remainingAttempts?: number; lockedUntil?: number } {
    const attempt = ClientSecurityManager.loginAttempts.get(email);
    
    if (attempt?.lockedUntil && Date.now() < attempt.lockedUntil) {
      return { 
        allowed: false, 
        lockedUntil: attempt.lockedUntil 
      };
    }

    if (attempt && attempt.count >= ClientSecurityManager.getConfig().maxLoginAttempts) {
      const lockedUntil = Date.now() + ClientSecurityManager.getConfig().lockoutDuration;
      ClientSecurityManager.loginAttempts.set(email, { 
        count: attempt.count, 
        lockedUntil 
      });
      return { 
        allowed: false, 
        lockedUntil 
      };
    }

    const remainingAttempts = ClientSecurityManager.getConfig().maxLoginAttempts - (attempt?.count || 0);
    return { 
      allowed: true, 
      remainingAttempts 
    };
  }

  static recordFailedLogin(email: string): void {
    const attempt = ClientSecurityManager.loginAttempts.get(email) || { count: 0 };
    attempt.count++;
    ClientSecurityManager.loginAttempts.set(email, attempt);
  }

  static clearLoginAttempts(email: string): void {
    ClientSecurityManager.loginAttempts.delete(email);
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    if (!ClientSecurityManager.getConfig().enforcePasswordPolicy) {
      return { valid: true, errors: [] };
    }

    const errors: string[] = [];
    
    if (password.length < 12) {
      errors.push("Password must be at least 12 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[@$!%*?&#^()_+=\-{}\[\]|\\:;"'<>,.\/]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    if (/(.)\1{2,}/.test(password)) {
      errors.push("Password cannot contain more than 2 consecutive identical characters");
    }

    return { 
      valid: errors.length === 0, 
      errors 
    };
  }

  static sanitizeInput(input: string): string {
    // Remove potential XSS vectors
    let sanitized = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .replace(/<[^>]+>/g, "");

    // Remove SQL injection attempts
    sanitized = sanitized
      .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE|SCRIPT|TRUNCATE)\b)/gi, "")
      .replace(/['";\\]/g, "");

    return sanitized.trim();
  }

  static generateCSRFToken(): string {
    return AES256Encryption.generateSecureToken(32);
  }

  static validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken && token.length === 64;
  }
}

export class SecureAPIClient {
  private static csrfToken: string | null = null;

  static initialize(): void {
    SecureAPIClient.csrfToken = ClientSecurityManager.generateCSRFToken();
    if (typeof window !== "undefined") {
      SecureStorage.setItem("csrf_token", SecureAPIClient.csrfToken);
    }
  }

  static async secureRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    if (!SecureAPIClient.csrfToken) {
      SecureAPIClient.initialize();
    }

    // Add security headers
    const headers = new Headers(options.headers);
    headers.set("X-CSRF-Token", SecureAPIClient.csrfToken || "");
    headers.set("X-Request-ID", AES256Encryption.generateSecureToken(16));
    headers.set("X-Client-Version", "1.0.0");

    // Add request timestamp for replay attack prevention
    headers.set("X-Request-Timestamp", Date.now().toString());

    const secureOptions: RequestInit = {
      ...options,
      headers,
      credentials: "include",
      mode: "cors"
    };

    try {
      const response = await fetch(url, secureOptions);
      
      // Check for security headers in response
      const csp = response.headers.get("Content-Security-Policy");
      const xframe = response.headers.get("X-Frame-Options");
      const xcontent = response.headers.get("X-Content-Type-Options");
      
      if (!csp || !xframe || !xcontent) {
        console.warn("Missing security headers in API response");
      }

      return response;
    } catch (error) {
      console.error("Secure request failed:", error);
      throw error;
    }
  }

  static encryptPayload(data: any, encryptionKey: string): string {
    const encrypted = AES256Encryption.encryptObject(data, encryptionKey);
    return JSON.stringify(encrypted);
  }

  static decryptResponse(encryptedData: string, encryptionKey: string): any {
    try {
      const parsed = JSON.parse(encryptedData);
      return AES256Encryption.decryptObject(parsed, encryptionKey);
    } catch (error) {
      console.error("Failed to decrypt response:", error);
      throw new Error("Invalid encrypted response");
    }
  }
}

export class BiometricAuth {
  static async isAvailable(): Promise<boolean> {
    if (typeof window === "undefined" || !window.PublicKeyCredential) {
      return false;
    }

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch {
      return false;
    }
  }

  static async register(userId: string, username: string): Promise<any> {
    if (!await BiometricAuth.isAvailable()) {
      throw new Error("Biometric authentication not available");
    }

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: "HNWI Chronicles",
        id: window.location.hostname
      },
      user: {
        id: new TextEncoder().encode(userId),
        name: username,
        displayName: username
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" }
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required"
      },
      timeout: 60000,
      attestation: "direct"
    };

    try {
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });
      return credential;
    } catch (error) {
      console.error("Biometric registration failed:", error);
      throw error;
    }
  }

  static async authenticate(credentialId: ArrayBuffer): Promise<any> {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials: [{
        id: credentialId,
        type: "public-key",
        transports: ["internal"]
      }],
      userVerification: "required",
      timeout: 60000
    };

    try {
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });
      return assertion;
    } catch (error) {
      console.error("Biometric authentication failed:", error);
      throw error;
    }
  }
}