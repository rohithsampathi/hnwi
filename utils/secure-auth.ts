"use client";

import { SecureStorage, AES256Encryption } from "@/lib/security/encryption";
import { ClientSecurityManager, SecureAPIClient } from "@/lib/security/client-security";
import { AuditLogger, SecurityEventType, SeverityLevel } from "@/lib/security/audit-logger";
import { GDPRCompliance } from "@/lib/security/gdpr-compliance";
import MixpanelTracker from "@/lib/mixpanel";

type User = {
  email: string;
  name: string;
  id?: string;
  user_id?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
};

class SecureAuthManager {
  private static instance: SecureAuthManager;
  private masterKey: string | null = null;
  private initialized = false;

  static getInstance(): SecureAuthManager {
    if (!SecureAuthManager.instance) {
      SecureAuthManager.instance = new SecureAuthManager();
    }
    return SecureAuthManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Generate or retrieve master key (in production, this would come from a secure key management service)
    this.masterKey = this.getMasterKey();
    
    // Initialize security components
    SecureStorage.initialize(this.masterKey);
    SecureAPIClient.initialize();
    AuditLogger.initialize(this.masterKey);
    
    this.initialized = true;
  }

  private getMasterKey(): string {
    // In production, this would retrieve from a secure key management service
    // For now, derive from environment variable
    const baseKey = process.env.ENCRYPTION_KEY || process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "hnwi-chronicles-secure-key-fallback";
    return AES256Encryption.hash(baseKey + navigator.userAgent, { algorithm: "sha512" });
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    // Sanitize inputs
    const sanitizedEmail = ClientSecurityManager.sanitizeInput(email);
    
    // Check login attempts
    const attemptCheck = ClientSecurityManager.checkLoginAttempt(sanitizedEmail);
    if (!attemptCheck.allowed) {
      AuditLogger.log({
        type: SecurityEventType.LOGIN_FAILURE,
        severity: SeverityLevel.WARNING,
        userEmail: sanitizedEmail,
        action: "Login attempt blocked due to rate limiting",
        success: false,
        details: { lockedUntil: attemptCheck.lockedUntil }
      });
      throw new Error(`Account locked. Please try again after ${new Date(attemptCheck.lockedUntil!).toLocaleTimeString()}`);
    }

    // Validate password strength
    const passwordValidation = ClientSecurityManager.validatePassword(password);
    if (!passwordValidation.valid && process.env.NODE_ENV === "production") {
      AuditLogger.log({
        type: SecurityEventType.LOGIN_FAILURE,
        severity: SeverityLevel.WARNING,
        userEmail: sanitizedEmail,
        action: "Login attempt with weak password",
        success: false,
        details: { errors: passwordValidation.errors }
      });
      ClientSecurityManager.recordFailedLogin(sanitizedEmail);
      throw new Error("Invalid credentials");
    }

    // Send plain password to backend (backend handles hashing)
    try {
      // Make secure API call
      const response = await SecureAPIClient.secureRequest("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          password: password
        })
      });

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      const data = await response.json();
      
      // Clear login attempts on success
      ClientSecurityManager.clearLoginAttempts(sanitizedEmail);
      
      // Log successful login
      AuditLogger.log({
        type: SecurityEventType.LOGIN_SUCCESS,
        severity: SeverityLevel.INFO,
        userId: data.user.id || data.user.user_id,
        userEmail: sanitizedEmail,
        action: "User logged in successfully",
        success: true
      });

      return data.user;
    } catch (error) {
      // Record failed login
      ClientSecurityManager.recordFailedLogin(sanitizedEmail);
      
      // Log failed login
      AuditLogger.log({
        type: SecurityEventType.LOGIN_FAILURE,
        severity: SeverityLevel.WARNING,
        userEmail: sanitizedEmail,
        action: "Login attempt failed",
        success: false,
        errorMessage: (error as Error).message
      });

      throw error;
    }
  }

  login(userData: User, token: string): void {
    if (!userData || !token) return;

    const userId = userData.id || userData.user_id || "";

    // Initialize session security
    ClientSecurityManager.initializeSession(userId);

    // Store encrypted data
    SecureStorage.setItem("userId", userId);
    SecureStorage.setItem("token", token);
    SecureStorage.setItem("userObject", userData);

    // Record GDPR consent
    GDPRCompliance.recordConsent(userId, {
      necessary: true,
      analytics: true,
      marketing: false,
      personalization: true
    });

    // Track in Mixpanel (if consent given)
    if (GDPRCompliance.hasValidConsent(userId, "analytics")) {
      MixpanelTracker.identify(userId);
      MixpanelTracker.track("User Login", {
        userId,
        email: userData.email,
        method: "email"
      });
      
      MixpanelTracker.setProfile({
        $name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || userData.email,
        $email: userData.email,
        userId,
        role: userData.role || "user"
      });
    }

    // Log login event
    AuditLogger.log({
      type: SecurityEventType.LOGIN_SUCCESS,
      severity: SeverityLevel.INFO,
      userId,
      userEmail: userData.email,
      action: "User session initialized",
      success: true
    });
  }

  signup(userData: User, token: string): void {
    if (!userData || !token) return;

    const userId = userData.id || userData.user_id || "";

    // Initialize session security
    ClientSecurityManager.initializeSession(userId);

    // Store encrypted data
    SecureStorage.setItem("userId", userId);
    SecureStorage.setItem("token", token);
    SecureStorage.setItem("userObject", userData);

    // Record GDPR consent
    GDPRCompliance.recordConsent(userId, {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false
    });

    // Track in Mixpanel (if consent given)
    if (GDPRCompliance.hasValidConsent(userId, "analytics")) {
      MixpanelTracker.identify(userId);
      MixpanelTracker.track("User Signup", {
        userId,
        email: userData.email
      });
      
      MixpanelTracker.setProfile({
        $name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || userData.email,
        $email: userData.email,
        userId,
        role: userData.role || "user",
        $created: new Date().toISOString()
      });
    }

    // Log signup event
    AuditLogger.log({
      type: SecurityEventType.LOGIN_SUCCESS,
      severity: SeverityLevel.INFO,
      userId,
      userEmail: userData.email,
      action: "New user registered",
      success: true
    });
  }

  logout(): void {
    const userId = SecureStorage.getItem<string>("userId");
    const userObject = SecureStorage.getItem<User>("userObject");

    if (userId) {
      // Track logout
      if (GDPRCompliance.hasValidConsent(userId, "analytics")) {
        MixpanelTracker.track("User Logout", { userId });
      }

      // Log logout event
      AuditLogger.log({
        type: SecurityEventType.LOGOUT,
        severity: SeverityLevel.INFO,
        userId,
        userEmail: userObject?.email,
        action: "User logged out",
        success: true
      });

      // Terminate session
      ClientSecurityManager.terminateSession(userId);
    }

    // Clear secure storage
    SecureStorage.clear();
  }

  updateProfile(userData: Partial<User>): void {
    const currentUserData = SecureStorage.getItem<User>("userObject");
    if (!currentUserData || !userData) return;

    const updatedUserData = { ...currentUserData, ...userData };
    const userId = updatedUserData.id || updatedUserData.user_id || "";

    // Store updated data securely
    SecureStorage.setItem("userObject", updatedUserData);

    // Track update (if consent given)
    if (GDPRCompliance.hasValidConsent(userId, "analytics")) {
      MixpanelTracker.track("Profile Updated", {
        userId,
        updatedFields: Object.keys(userData)
      });
      
      MixpanelTracker.setProfile({
        $name: `${updatedUserData.firstName || ""} ${updatedUserData.lastName || ""}`.trim() || updatedUserData.email,
        $email: updatedUserData.email
      });
    }

    // Log profile update
    AuditLogger.log({
      type: SecurityEventType.DATA_MODIFICATION,
      severity: SeverityLevel.INFO,
      userId,
      userEmail: updatedUserData.email,
      action: "User profile updated",
      details: { updatedFields: Object.keys(userData) },
      success: true
    });
  }

  trackEvent(eventName: string, properties: Record<string, any> = {}): void {
    const userId = SecureStorage.getItem<string>("userId");
    
    if (userId) {
      properties.userId = userId;
      
      // Only track if user has given consent
      if (GDPRCompliance.hasValidConsent(userId, "analytics")) {
        MixpanelTracker.track(eventName, properties);
      }

      // Always log for audit purposes
      AuditLogger.log({
        type: SecurityEventType.DATA_ACCESS,
        severity: SeverityLevel.INFO,
        userId,
        action: `Event tracked: ${eventName}`,
        details: properties,
        success: true
      });
    }
  }

  // Activity tracking for session management
  updateActivity(): void {
    const userId = SecureStorage.getItem<string>("userId");
    if (userId) {
      ClientSecurityManager.updateActivity(userId);
    }
  }

  // Get current user securely
  getCurrentUser(): User | null {
    return SecureStorage.getItem<User>("userObject");
  }

  // Get auth token securely
  getAuthToken(): string | null {
    return SecureStorage.getItem<string>("token");
  }

  // Check if user is authenticated (legacy compatibility)
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }
  
  // Check if user can access features (not locked)
  canAccessFeatures(): boolean {
    const authUtils = require('@/lib/auth-utils');
    return authUtils.canAccessFeatures();
  }
}

// Export singleton instance
const secureAuth = SecureAuthManager.getInstance();

// Initialize on module load
if (typeof window !== "undefined") {
  secureAuth.initialize().catch(() => {});

  // Add activity tracking listeners
  ["mousedown", "keydown", "scroll", "touchstart"].forEach(event => {
    window.addEventListener(event, () => secureAuth.updateActivity(), { passive: true });
  });
}

// Export methods for backwards compatibility
export const authenticateUser = (email: string, password: string) => 
  secureAuth.authenticateUser(email, password);

export const login = (userData: User, token: string) => 
  secureAuth.login(userData, token);

export const signup = (userData: User, token: string) => 
  secureAuth.signup(userData, token);

export const logout = () => 
  secureAuth.logout();

export const updateProfile = (userData: Partial<User>) => 
  secureAuth.updateProfile(userData);

export const trackEvent = (eventName: string, properties?: Record<string, any>) => 
  secureAuth.trackEvent(eventName, properties);

export const getCurrentUser = () => 
  secureAuth.getCurrentUser();

export const getAuthToken = () => 
  secureAuth.getAuthToken();

export const isAuthenticated = () => 
  secureAuth.isAuthenticated();

export default secureAuth;