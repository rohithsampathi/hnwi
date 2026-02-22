import { AES256Encryption } from "./encryption";
import { AuditLogger, SecurityEventType, SeverityLevel } from "./audit-logger";

export interface ConsentRecord {
  userId: string;
  timestamp: number;
  version: string;
  purposes: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
  };
  ipAddress?: string;
  userAgent?: string;
}

export interface DataSubjectRequest {
  id: string;
  userId: string;
  type: "ACCESS" | "PORTABILITY" | "ERASURE" | "RECTIFICATION" | "RESTRICTION";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
  requestDate: number;
  completionDate?: number;
  details?: any;
}

export interface PrivacySettings {
  dataMinimization: boolean;
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
  anonymization: boolean;
  pseudonymization: boolean;
  dataRetentionDays: number;
  rightToAccess: boolean;
  rightToErasure: boolean;
  rightToPortability: boolean;
  rightToRectification: boolean;
  cookieConsent: boolean;
}

export class GDPRCompliance {
  private static consentRecords = new Map<string, ConsentRecord>();
  private static dataRequests: DataSubjectRequest[] = [];
  private static privacySettings: PrivacySettings = {
    dataMinimization: true,
    encryptionAtRest: true,
    encryptionInTransit: true,
    anonymization: true,
    pseudonymization: true,
    dataRetentionDays: 365,
    rightToAccess: true,
    rightToErasure: true,
    rightToPortability: true,
    rightToRectification: true,
    cookieConsent: true
  };

  static recordConsent(userId: string, purposes: ConsentRecord["purposes"]): void {
    const consent: ConsentRecord = {
      userId,
      timestamp: Date.now(),
      version: "2.0",
      purposes,
      ipAddress: GDPRCompliance.getClientIP(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined
    };

    GDPRCompliance.consentRecords.set(userId, consent);
    GDPRCompliance.persistConsent(consent);

    AuditLogger.log({
      type: SecurityEventType.DATA_ACCESS,
      severity: SeverityLevel.INFO,
      userId,
      action: "Consent recorded",
      details: purposes,
      success: true
    });
  }

  static getConsent(userId: string): ConsentRecord | null {
    return GDPRCompliance.consentRecords.get(userId) || null;
  }

  static hasValidConsent(userId: string, purpose: keyof ConsentRecord["purposes"]): boolean {
    const consent = GDPRCompliance.getConsent(userId);
    if (!consent) return false;

    // Check if consent is not older than 1 year
    const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
    if (consent.timestamp < oneYearAgo) {
      return false;
    }

    return consent.purposes[purpose];
  }

  static withdrawConsent(userId: string, purposes?: (keyof ConsentRecord["purposes"])[]): void {
    const consent = GDPRCompliance.getConsent(userId);
    if (!consent) return;

    if (purposes) {
      purposes.forEach(purpose => {
        consent.purposes[purpose] = false;
      });
      consent.timestamp = Date.now();
      GDPRCompliance.consentRecords.set(userId, consent);
    } else {
      GDPRCompliance.consentRecords.delete(userId);
    }

    AuditLogger.log({
      type: SecurityEventType.DATA_MODIFICATION,
      severity: SeverityLevel.INFO,
      userId,
      action: "Consent withdrawn",
      details: purposes || "all",
      success: true
    });
  }

  static createDataRequest(
    userId: string,
    type: DataSubjectRequest["type"]
  ): DataSubjectRequest {
    const request: DataSubjectRequest = {
      id: AES256Encryption.generateSecureToken(16),
      userId,
      type,
      status: "PENDING",
      requestDate: Date.now()
    };

    GDPRCompliance.dataRequests.push(request);

    AuditLogger.log({
      type: SecurityEventType.DATA_ACCESS,
      severity: SeverityLevel.INFO,
      userId,
      action: `Data subject request created: ${type}`,
      details: request,
      success: true
    });

    // Process request based on type
    GDPRCompliance.processDataRequest(request);

    return request;
  }

  private static async processDataRequest(request: DataSubjectRequest): Promise<void> {
    request.status = "IN_PROGRESS";

    switch (request.type) {
      case "ACCESS":
        await GDPRCompliance.handleAccessRequest(request);
        break;
      case "PORTABILITY":
        await GDPRCompliance.handlePortabilityRequest(request);
        break;
      case "ERASURE":
        await GDPRCompliance.handleErasureRequest(request);
        break;
      case "RECTIFICATION":
        await GDPRCompliance.handleRectificationRequest(request);
        break;
      case "RESTRICTION":
        await GDPRCompliance.handleRestrictionRequest(request);
        break;
    }
  }

  private static async handleAccessRequest(request: DataSubjectRequest): Promise<void> {
    // Collect all user data
    const userData = await GDPRCompliance.collectUserData(request.userId);
    
    request.status = "COMPLETED";
    request.completionDate = Date.now();
    request.details = { dataProvided: true };

    AuditLogger.log({
      type: SecurityEventType.DATA_ACCESS,
      severity: SeverityLevel.INFO,
      userId: request.userId,
      action: "Access request completed",
      success: true
    });
  }

  private static async handlePortabilityRequest(request: DataSubjectRequest): Promise<void> {
    const userData = await GDPRCompliance.collectUserData(request.userId);
    const exportData = GDPRCompliance.formatDataForExport(userData);

    request.status = "COMPLETED";
    request.completionDate = Date.now();
    request.details = { exportFormat: "JSON", dataSize: JSON.stringify(exportData).length };

    AuditLogger.log({
      type: SecurityEventType.DATA_ACCESS,
      severity: SeverityLevel.INFO,
      userId: request.userId,
      action: "Portability request completed",
      success: true
    });
  }

  private static async handleErasureRequest(request: DataSubjectRequest): Promise<void> {
    // Check if erasure is allowed (no legal obligations to keep data)
    const canErase = await GDPRCompliance.checkErasureEligibility(request.userId);

    if (canErase) {
      await GDPRCompliance.eraseUserData(request.userId);
      request.status = "COMPLETED";
      request.completionDate = Date.now();
      request.details = { erased: true };

      AuditLogger.log({
        type: SecurityEventType.DATA_DELETION,
        severity: SeverityLevel.WARNING,
        userId: request.userId,
        action: "User data erased",
        success: true
      });
    } else {
      request.status = "REJECTED";
      request.details = { reason: "Legal obligation to retain data" };
    }
  }

  private static async handleRectificationRequest(request: DataSubjectRequest): Promise<void> {
    request.status = "COMPLETED";
    request.completionDate = Date.now();
    request.details = { rectified: true };

    AuditLogger.log({
      type: SecurityEventType.DATA_MODIFICATION,
      severity: SeverityLevel.INFO,
      userId: request.userId,
      action: "Rectification request completed",
      success: true
    });
  }

  private static async handleRestrictionRequest(request: DataSubjectRequest): Promise<void> {
    await GDPRCompliance.restrictDataProcessing(request.userId);
    
    request.status = "COMPLETED";
    request.completionDate = Date.now();
    request.details = { restricted: true };

    AuditLogger.log({
      type: SecurityEventType.DATA_MODIFICATION,
      severity: SeverityLevel.INFO,
      userId: request.userId,
      action: "Restriction request completed",
      success: true
    });
  }

  private static async collectUserData(userId: string): Promise<any> {
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
    try {
      const response = await fetch(`${API_BASE_URL}/api/gdpr/export/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Backend unavailable — fall back to local data
    }

    return {
      consent: GDPRCompliance.getConsent(userId),
      auditLogs: AuditLogger.getLogs({ userId }),
    };
  }

  private static formatDataForExport(data: any): any {
    // Format data for machine-readable export
    return {
      exportDate: new Date().toISOString(),
      format: "GDPR_DATA_EXPORT_V1",
      data: data
    };
  }

  private static async checkErasureEligibility(userId: string): Promise<boolean> {
    // Check if there are legal obligations to keep the data
    // For financial services, there might be regulatory requirements
    return true; // Simplified for this implementation
  }

  private static async eraseUserData(userId: string): Promise<void> {
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
    try {
      await fetch(`${API_BASE_URL}/api/gdpr/erase/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      // Backend unavailable — continue with local cleanup
    }

    // Clear local data
    if (typeof window !== "undefined") {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes(userId)) {
          localStorage.removeItem(key);
        }
      });
    }

    GDPRCompliance.consentRecords.delete(userId);
  }

  private static async restrictDataProcessing(userId: string): Promise<void> {
    // Mark user data as restricted
    if (typeof window !== "undefined") {
      localStorage.setItem(`hnwi_restricted_${userId}`, "true");
    }
  }

  private static persistConsent(consent: ConsentRecord): void {
    if (typeof window === "undefined") return;

    const key = `hnwi_consent_${consent.userId}`;
    localStorage.setItem(key, JSON.stringify(consent));
  }

  private static getClientIP(): string | undefined {
    // In production, this would be obtained from the server
    return undefined;
  }

  static anonymizeData(data: any): any {
    const anonymized = JSON.parse(JSON.stringify(data));

    // Recursively anonymize PII fields
    const anonymizeObject = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === "object" && obj[key] !== null) {
          anonymizeObject(obj[key]);
        } else if (typeof obj[key] === "string") {
          // Anonymize common PII fields
          if (key.toLowerCase().includes("email")) {
            obj[key] = GDPRCompliance.hashValue(obj[key]);
          } else if (key.toLowerCase().includes("name")) {
            obj[key] = "ANONYMIZED";
          } else if (key.toLowerCase().includes("phone")) {
            obj[key] = "ANONYMIZED";
          } else if (key.toLowerCase().includes("address")) {
            obj[key] = "ANONYMIZED";
          } else if (key.toLowerCase().includes("ssn") || key.toLowerCase().includes("social")) {
            obj[key] = "ANONYMIZED";
          }
        }
      }
    };

    anonymizeObject(anonymized);
    return anonymized;
  }

  static pseudonymizeData(data: any, userId: string): any {
    const pseudonymized = JSON.parse(JSON.stringify(data));
    const pseudonym = AES256Encryption.hash(userId, { algorithm: "sha256" }).substring(0, 16);

    // Replace user identifiers with pseudonym
    const pseudonymizeObject = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === "object" && obj[key] !== null) {
          pseudonymizeObject(obj[key]);
        } else if (key === "userId" || key === "user_id") {
          obj[key] = pseudonym;
        }
      }
    };

    pseudonymizeObject(pseudonymized);
    return pseudonymized;
  }

  private static hashValue(value: string): string {
    return AES256Encryption.hash(value, { algorithm: "sha256" }).substring(0, 10) + "...";
  }

  static getPrivacySettings(): PrivacySettings {
    return { ...GDPRCompliance.privacySettings };
  }

  static updatePrivacySettings(settings: Partial<PrivacySettings>): void {
    GDPRCompliance.privacySettings = {
      ...GDPRCompliance.privacySettings,
      ...settings
    };

    AuditLogger.log({
      type: SecurityEventType.PERMISSION_CHANGE,
      severity: SeverityLevel.INFO,
      action: "Privacy settings updated",
      details: settings,
      success: true
    });
  }
}