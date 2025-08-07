import { AES256Encryption } from "./encryption";

export enum SecurityEventType {
  LOGIN_ATTEMPT = "LOGIN_ATTEMPT",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILURE = "LOGIN_FAILURE",
  LOGOUT = "LOGOUT",
  SESSION_TIMEOUT = "SESSION_TIMEOUT",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  MFA_ENABLED = "MFA_ENABLED",
  MFA_DISABLED = "MFA_DISABLED",
  DATA_ACCESS = "DATA_ACCESS",
  DATA_MODIFICATION = "DATA_MODIFICATION",
  DATA_DELETION = "DATA_DELETION",
  PERMISSION_CHANGE = "PERMISSION_CHANGE",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  API_CALL = "API_CALL",
  ERROR = "ERROR",
  SECURITY_ALERT = "SECURITY_ALERT"
}

export enum SeverityLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL"
}

interface AuditLog {
  id: string;
  timestamp: number;
  type: SecurityEventType;
  severity: SeverityLevel;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  action: string;
  resource?: string;
  details?: any;
  success: boolean;
  errorMessage?: string;
  stackTrace?: string;
  sessionId?: string;
  requestId?: string;
}

interface SecurityMetrics {
  failedLoginAttempts: number;
  successfulLogins: number;
  activeSessions: number;
  suspiciousActivities: number;
  dataAccessEvents: number;
  lastSecurityIncident?: number;
}

export class AuditLogger {
  private static logs: AuditLog[] = [];
  private static metrics: SecurityMetrics = {
    failedLoginAttempts: 0,
    successfulLogins: 0,
    activeSessions: 0,
    suspiciousActivities: 0,
    dataAccessEvents: 0
  };
  private static maxLogsInMemory = 1000;
  private static encryptionKey: string | null = null;

  static initialize(encryptionKey: string): void {
    AuditLogger.encryptionKey = encryptionKey;
    AuditLogger.loadPersistedLogs();
    AuditLogger.startPeriodicFlush();
  }

  static log(event: Omit<AuditLog, "id" | "timestamp">): void {
    const log: AuditLog = {
      ...event,
      id: AES256Encryption.generateSecureToken(16),
      timestamp: Date.now(),
      ipAddress: AuditLogger.getClientIP(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      sessionId: AuditLogger.getSessionId()
    };

    AuditLogger.logs.push(log);
    AuditLogger.updateMetrics(log);

    // Check for suspicious patterns
    AuditLogger.detectSuspiciousActivity(log);

    // Persist if reaching limit
    if (AuditLogger.logs.length >= AuditLogger.maxLogsInMemory) {
      AuditLogger.persistLogs();
    }

    // For critical events, immediately persist
    if (log.severity === SeverityLevel.CRITICAL) {
      AuditLogger.persistLogs();
      AuditLogger.alertSecurityTeam(log);
    }
  }

  private static updateMetrics(log: AuditLog): void {
    switch (log.type) {
      case SecurityEventType.LOGIN_FAILURE:
        AuditLogger.metrics.failedLoginAttempts++;
        break;
      case SecurityEventType.LOGIN_SUCCESS:
        AuditLogger.metrics.successfulLogins++;
        AuditLogger.metrics.activeSessions++;
        break;
      case SecurityEventType.LOGOUT:
      case SecurityEventType.SESSION_TIMEOUT:
        AuditLogger.metrics.activeSessions = Math.max(0, AuditLogger.metrics.activeSessions - 1);
        break;
      case SecurityEventType.DATA_ACCESS:
      case SecurityEventType.DATA_MODIFICATION:
      case SecurityEventType.DATA_DELETION:
        AuditLogger.metrics.dataAccessEvents++;
        break;
      case SecurityEventType.SUSPICIOUS_ACTIVITY:
        AuditLogger.metrics.suspiciousActivities++;
        AuditLogger.metrics.lastSecurityIncident = Date.now();
        break;
    }
  }

  private static detectSuspiciousActivity(log: AuditLog): void {
    // Check for multiple failed login attempts
    const recentFailedLogins = AuditLogger.logs.filter(
      l => l.type === SecurityEventType.LOGIN_FAILURE &&
           l.userEmail === log.userEmail &&
           l.timestamp > Date.now() - 300000 // Last 5 minutes
    );

    if (recentFailedLogins.length >= 3) {
      AuditLogger.log({
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: SeverityLevel.WARNING,
        userId: log.userId,
        userEmail: log.userEmail,
        action: "Multiple failed login attempts detected",
        details: { attemptCount: recentFailedLogins.length },
        success: false
      });
    }

    // Check for unusual access patterns
    if (log.type === SecurityEventType.DATA_ACCESS) {
      const recentAccess = AuditLogger.logs.filter(
        l => l.type === SecurityEventType.DATA_ACCESS &&
             l.userId === log.userId &&
             l.timestamp > Date.now() - 60000 // Last minute
      );

      if (recentAccess.length > 20) {
        AuditLogger.log({
          type: SecurityEventType.SUSPICIOUS_ACTIVITY,
          severity: SeverityLevel.WARNING,
          userId: log.userId,
          userEmail: log.userEmail,
          action: "Unusual data access pattern detected",
          details: { accessCount: recentAccess.length },
          success: false
        });
      }
    }
  }

  private static persistLogs(): void {
    if (!AuditLogger.encryptionKey || typeof window === "undefined") return;

    try {
      const logsToStore = AuditLogger.logs.slice(-AuditLogger.maxLogsInMemory);
      const encrypted = AES256Encryption.encryptObject(
        { logs: logsToStore, metrics: AuditLogger.metrics },
        AuditLogger.encryptionKey
      );

      localStorage.setItem("hnwi_audit_logs", JSON.stringify(encrypted));
      
      // Also send to server if critical logs exist
      const criticalLogs = logsToStore.filter(l => l.severity === SeverityLevel.CRITICAL);
      if (criticalLogs.length > 0) {
        AuditLogger.sendToServer(criticalLogs);
      }
    } catch (error) {
      console.error("Failed to persist audit logs:", error);
    }
  }

  private static loadPersistedLogs(): void {
    if (!AuditLogger.encryptionKey || typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem("hnwi_audit_logs");
      if (!stored) return;

      const encrypted = JSON.parse(stored);
      const decrypted = AES256Encryption.decryptObject<{
        logs: AuditLog[];
        metrics: SecurityMetrics;
      }>(encrypted, AuditLogger.encryptionKey);

      AuditLogger.logs = decrypted.logs;
      AuditLogger.metrics = decrypted.metrics;
    } catch (error) {
      console.error("Failed to load persisted audit logs:", error);
    }
  }

  private static startPeriodicFlush(): void {
    if (typeof window === "undefined") return;

    setInterval(() => {
      AuditLogger.persistLogs();
      AuditLogger.cleanOldLogs();
    }, 300000); // Every 5 minutes
  }

  private static cleanOldLogs(): void {
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    AuditLogger.logs = AuditLogger.logs.filter(log => log.timestamp > cutoffTime);
  }

  private static async sendToServer(logs: AuditLog[]): Promise<void> {
    // Implementation would send encrypted logs to backend
    // This is a placeholder for the actual implementation
    console.log("Would send critical logs to server:", logs.length);
  }

  private static alertSecurityTeam(log: AuditLog): void {
    // Implementation would alert security team
    // This is a placeholder for the actual implementation
    console.error("SECURITY ALERT:", log);
  }

  private static getClientIP(): string | undefined {
    // In a real implementation, this would be obtained from the server
    return undefined;
  }

  private static getSessionId(): string | undefined {
    if (typeof window === "undefined") return undefined;
    return sessionStorage.getItem("session_id") || undefined;
  }

  static getMetrics(): SecurityMetrics {
    return { ...AuditLogger.metrics };
  }

  static getLogs(filters?: {
    type?: SecurityEventType;
    severity?: SeverityLevel;
    userId?: string;
    startTime?: number;
    endTime?: number;
    limit?: number;
  }): AuditLog[] {
    let filtered = [...AuditLogger.logs];

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(log => log.type === filters.type);
      }
      if (filters.severity) {
        filtered = filtered.filter(log => log.severity === filters.severity);
      }
      if (filters.userId) {
        filtered = filtered.filter(log => log.userId === filters.userId);
      }
      if (filters.startTime) {
        filtered = filtered.filter(log => log.timestamp >= filters.startTime!);
      }
      if (filters.endTime) {
        filtered = filtered.filter(log => log.timestamp <= filters.endTime!);
      }
      if (filters.limit) {
        filtered = filtered.slice(-filters.limit);
      }
    }

    return filtered;
  }

  static exportLogs(format: "json" | "csv" = "json"): string {
    const logs = AuditLogger.logs;

    if (format === "json") {
      return JSON.stringify(logs, null, 2);
    }

    // CSV format
    const headers = ["ID", "Timestamp", "Type", "Severity", "User", "Action", "Success", "Details"];
    const rows = logs.map(log => [
      log.id,
      new Date(log.timestamp).toISOString(),
      log.type,
      log.severity,
      log.userEmail || log.userId || "N/A",
      log.action,
      log.success ? "Yes" : "No",
      JSON.stringify(log.details || {})
    ]);

    return [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
  }
}