// lib/audit-logger.ts - Comprehensive audit logging for compliance (GDPR, SOC2)

import { logger } from './secure-logger';
import { anonymizeIP, sanitizeUserAgent } from './security/sanitization';

// Audit event types for HNWI application
export enum AuditEventType {
  // Authentication Events
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_LOGIN_FAILED = 'user_login_failed',
  USER_SIGNUP = 'user_signup',
  SESSION_EXPIRED = 'session_expired',
  PASSWORD_CHANGE = 'password_change',

  // Asset Management Events (Crown Vault)
  ASSET_CREATED = 'asset_created',
  ASSET_VIEWED = 'asset_viewed',
  ASSET_UPDATED = 'asset_updated',
  ASSET_DELETED = 'asset_deleted',
  ASSET_SHARED = 'asset_shared',
  HEIR_ADDED = 'heir_added',
  HEIR_REMOVED = 'heir_removed',

  // Data Access Events
  PROFILE_VIEWED = 'profile_viewed',
  PROFILE_UPDATED = 'profile_updated',
  SENSITIVE_DATA_ACCESSED = 'sensitive_data_accessed',
  EXPORT_DATA = 'export_data',
  IMPORT_DATA = 'import_data',

  // Financial Operations
  INVESTMENT_VIEWED = 'investment_viewed',
  OPPORTUNITY_ACCESSED = 'opportunity_accessed',
  FINANCIAL_REPORT_GENERATED = 'financial_report_generated',
  PAYMENT_PROCESSED = 'payment_processed',

  // Security Events
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  CSRF_VALIDATION_FAILED = 'csrf_validation_failed',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  IP_BLOCKED = 'ip_blocked',

  // Administrative Events
  ADMIN_ACTION = 'admin_action',
  DATA_RETENTION_POLICY_EXECUTED = 'data_retention_executed',
  GDPR_REQUEST_PROCESSED = 'gdpr_request_processed',
  SYSTEM_CONFIGURATION_CHANGED = 'system_config_changed'
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface AuditLogEntry {
  eventId: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action: string;
  outcome: 'success' | 'failure' | 'pending';
  details?: Record<string, any>;
  compliance: {
    gdpr: boolean;
    soc2: boolean;
    retention_days: number;
  };
  metadata: {
    request_id?: string;
    endpoint?: string;
    method?: string;
    response_status?: number;
    duration_ms?: number;
  };
}

// Audit log store (in production, use proper database/logging service)
const auditLogStore: AuditLogEntry[] = [];

// Data retention policies for different event types
const RETENTION_POLICIES = {
  [AuditEventType.USER_LOGIN]: 365, // 1 year
  [AuditEventType.USER_LOGIN_FAILED]: 90, // 3 months
  [AuditEventType.ASSET_CREATED]: 2555, // 7 years (financial records)
  [AuditEventType.ASSET_VIEWED]: 365, // 1 year
  [AuditEventType.ASSET_UPDATED]: 2555, // 7 years
  [AuditEventType.ASSET_DELETED]: 2555, // 7 years
  [AuditEventType.PROFILE_UPDATED]: 1095, // 3 years
  [AuditEventType.SENSITIVE_DATA_ACCESSED]: 2555, // 7 years
  [AuditEventType.PAYMENT_PROCESSED]: 2555, // 7 years
  [AuditEventType.RATE_LIMIT_EXCEEDED]: 30, // 30 days
  [AuditEventType.CSRF_VALIDATION_FAILED]: 90, // 3 months
  [AuditEventType.UNAUTHORIZED_ACCESS]: 365, // 1 year
  [AuditEventType.SUSPICIOUS_ACTIVITY]: 1095, // 3 years
  [AuditEventType.GDPR_REQUEST_PROCESSED]: 2555, // 7 years
  // Default retention
  default: 365
};

export class AuditLogger {
  /**
   * Log an audit event with full compliance metadata
   */
  static async logEvent(
    eventType: AuditEventType,
    action: string,
    outcome: 'success' | 'failure' | 'pending',
    options: {
      userId?: string;
      userEmail?: string;
      userRole?: string;
      sessionId?: string;
      ipAddress?: string;
      userAgent?: string;
      resource?: string;
      details?: Record<string, any>;
      requestId?: string;
      endpoint?: string;
      method?: string;
      responseStatus?: number;
      durationMs?: number;
      severity?: AuditSeverity;
    } = {}
  ): Promise<void> {
    try {
      const eventId = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      const retentionDays = RETENTION_POLICIES[eventType] || RETENTION_POLICIES.default;
      
      // Determine severity based on event type if not provided
      let severity = options.severity || AuditSeverity.LOW;
      if ([
        AuditEventType.UNAUTHORIZED_ACCESS,
        AuditEventType.SUSPICIOUS_ACTIVITY,
        AuditEventType.ASSET_DELETED,
        AuditEventType.IP_BLOCKED
      ].includes(eventType)) {
        severity = AuditSeverity.HIGH;
      } else if ([
        AuditEventType.USER_LOGIN_FAILED,
        AuditEventType.CSRF_VALIDATION_FAILED,
        AuditEventType.RATE_LIMIT_EXCEEDED
      ].includes(eventType)) {
        severity = AuditSeverity.MEDIUM;
      }

      const auditEntry: AuditLogEntry = {
        eventId,
        eventType,
        severity,
        timestamp,
        userId: options.userId,
        userEmail: options.userEmail,
        userRole: options.userRole,
        sessionId: options.sessionId,
        ipAddress: options.ipAddress ? this.sanitizeIP(options.ipAddress) : undefined,
        userAgent: options.userAgent ? this.sanitizeUserAgent(options.userAgent) : undefined,
        resource: options.resource,
        action,
        outcome,
        details: this.sanitizeDetails(options.details),
        compliance: {
          gdpr: this.isGDPRRelevant(eventType),
          soc2: this.isSOC2Relevant(eventType),
          retention_days: retentionDays
        },
        metadata: {
          request_id: options.requestId,
          endpoint: options.endpoint,
          method: options.method,
          response_status: options.responseStatus,
          duration_ms: options.durationMs
        }
      };

      // Store audit log (in production, send to proper logging service)
      auditLogStore.push(auditEntry);

      // Also log to application logger for immediate visibility
      logger.info('AUDIT_EVENT', {
        audit_event_id: eventId,
        event_type: eventType,
        severity,
        action,
        outcome,
        user_id: options.userId,
        resource: options.resource,
        compliance_gdpr: auditEntry.compliance.gdpr,
        compliance_soc2: auditEntry.compliance.soc2
      });

      // Alert on critical events
      if (severity === AuditSeverity.CRITICAL) {
        await this.sendSecurityAlert(auditEntry);
      }

    } catch (error) {
      // Never let audit logging failure break the application
      logger.error('Audit logging failed', {
        error: error instanceof Error ? error.message : String(error),
        event_type: eventType,
        action
      });
    }
  }

  /**
   * Retrieve audit logs with filtering and pagination
   */
  static getAuditLogs(filters: {
    userId?: string;
    eventType?: AuditEventType;
    startDate?: Date;
    endDate?: Date;
    severity?: AuditSeverity;
    outcome?: 'success' | 'failure' | 'pending';
    limit?: number;
    offset?: number;
  } = {}): AuditLogEntry[] {
    let filteredLogs = [...auditLogStore];

    // Apply filters
    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }
    if (filters.eventType) {
      filteredLogs = filteredLogs.filter(log => log.eventType === filters.eventType);
    }
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= filters.startDate!);
    }
    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= filters.endDate!);
    }
    if (filters.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
    }
    if (filters.outcome) {
      filteredLogs = filteredLogs.filter(log => log.outcome === filters.outcome);
    }

    // Sort by timestamp (most recent first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 100;
    
    return filteredLogs.slice(offset, offset + limit);
  }

  /**
   * Clean up expired audit logs based on retention policies
   */
  static async cleanupExpiredLogs(): Promise<number> {
    const now = new Date();
    let removedCount = 0;

    for (let i = auditLogStore.length - 1; i >= 0; i--) {
      const log = auditLogStore[i];
      const logDate = new Date(log.timestamp);
      const retentionMs = log.compliance.retention_days * 24 * 60 * 60 * 1000;
      
      if (now.getTime() - logDate.getTime() > retentionMs) {
        auditLogStore.splice(i, 1);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      await this.logEvent(
        AuditEventType.DATA_RETENTION_POLICY_EXECUTED,
        'cleanup_expired_audit_logs',
        'success',
        {
          details: { removed_count: removedCount },
          severity: AuditSeverity.LOW
        }
      );
    }

    return removedCount;
  }

  /**
   * Generate audit report for compliance
   */
  static generateComplianceReport(
    startDate: Date,
    endDate: Date,
    complianceType: 'gdpr' | 'soc2' | 'all'
  ): {
    total_events: number;
    events_by_type: Record<string, number>;
    events_by_severity: Record<string, number>;
    high_risk_events: AuditLogEntry[];
    compliance_summary: {
      gdpr_events: number;
      soc2_events: number;
    };
  } {
    const logs = this.getAuditLogs({ startDate, endDate });
    
    const filteredLogs = logs.filter(log => {
      if (complianceType === 'gdpr') return log.compliance.gdpr;
      if (complianceType === 'soc2') return log.compliance.soc2;
      return true; // 'all'
    });

    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    let gdprEvents = 0;
    let soc2Events = 0;

    filteredLogs.forEach(log => {
      eventsByType[log.eventType] = (eventsByType[log.eventType] || 0) + 1;
      eventsBySeverity[log.severity] = (eventsBySeverity[log.severity] || 0) + 1;
      
      if (log.compliance.gdpr) gdprEvents++;
      if (log.compliance.soc2) soc2Events++;
    });

    const highRiskEvents = filteredLogs.filter(log => 
      log.severity === AuditSeverity.HIGH || log.severity === AuditSeverity.CRITICAL
    );

    return {
      total_events: filteredLogs.length,
      events_by_type: eventsByType,
      events_by_severity: eventsBySeverity,
      high_risk_events: highRiskEvents,
      compliance_summary: {
        gdpr_events: gdprEvents,
        soc2_events: soc2Events
      }
    };
  }

  // Private helper methods

  private static sanitizeIP(ip: string): string {
    return anonymizeIP(ip);
  }

  private static sanitizeUserAgent(userAgent: string): string {
    return sanitizeUserAgent(userAgent);
  }

  private static sanitizeDetails(details?: Record<string, any>): Record<string, any> | undefined {
    if (!details) return undefined;

    // Remove sensitive fields from audit details
    const sanitized = { ...details };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'credential'];
    
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private static isGDPRRelevant(eventType: AuditEventType): boolean {
    return [
      AuditEventType.PROFILE_VIEWED,
      AuditEventType.PROFILE_UPDATED,
      AuditEventType.SENSITIVE_DATA_ACCESSED,
      AuditEventType.EXPORT_DATA,
      AuditEventType.USER_SIGNUP,
      AuditEventType.ASSET_CREATED,
      AuditEventType.ASSET_UPDATED,
      AuditEventType.ASSET_DELETED
    ].includes(eventType);
  }

  private static isSOC2Relevant(eventType: AuditEventType): boolean {
    return [
      AuditEventType.USER_LOGIN,
      AuditEventType.USER_LOGIN_FAILED,
      AuditEventType.UNAUTHORIZED_ACCESS,
      AuditEventType.ASSET_VIEWED,
      AuditEventType.ASSET_CREATED,
      AuditEventType.ASSET_UPDATED,
      AuditEventType.ASSET_DELETED,
      AuditEventType.SUSPICIOUS_ACTIVITY,
      AuditEventType.ADMIN_ACTION,
      AuditEventType.SYSTEM_CONFIGURATION_CHANGED
    ].includes(eventType);
  }

  private static async sendSecurityAlert(auditEntry: AuditLogEntry): Promise<void> {
    // In production, integrate with alerting system (email, Slack, PagerDuty)
    logger.critical('SECURITY_ALERT', {
      event_id: auditEntry.eventId,
      event_type: auditEntry.eventType,
      severity: auditEntry.severity,
      user_id: auditEntry.userId,
      details: auditEntry.details
    });
  }

  /**
   * Get audit log statistics
   */
  static getStatistics(): {
    total_logs: number;
    logs_by_severity: Record<string, number>;
    logs_last_24h: number;
    failed_operations: number;
  } {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const logsBySeverity: Record<string, number> = {};
    let logsLast24h = 0;
    let failedOperations = 0;

    auditLogStore.forEach(log => {
      logsBySeverity[log.severity] = (logsBySeverity[log.severity] || 0) + 1;
      
      if (new Date(log.timestamp) > oneDayAgo) {
        logsLast24h++;
      }
      
      if (log.outcome === 'failure') {
        failedOperations++;
      }
    });

    return {
      total_logs: auditLogStore.length,
      logs_by_severity: logsBySeverity,
      logs_last_24h: logsLast24h,
      failed_operations: failedOperations
    };
  }
}

// Cleanup expired logs every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    AuditLogger.cleanupExpiredLogs().catch(error => {
      logger.error('Audit log cleanup failed', {
        error: error instanceof Error ? error.message : String(error)
      });
    });
  }, 60 * 60 * 1000); // 1 hour
}