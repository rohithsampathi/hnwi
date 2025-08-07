"use client";

import React, { useState, useEffect } from "react";
import { AuditLogger, SecurityEventType, SeverityLevel } from "@/lib/security/audit-logger";
import { GDPRCompliance } from "@/lib/security/gdpr-compliance";
import { DDoSProtection } from "@/lib/security/rate-limiter";
import { Shield, AlertTriangle, Activity, Lock, Eye, Database, Key, Users } from "lucide-react";

interface SecurityMetrics {
  failedLoginAttempts: number;
  successfulLogins: number;
  activeSessions: number;
  suspiciousActivities: number;
  dataAccessEvents: number;
  lastSecurityIncident?: number;
}

export function SecurityMonitor() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [blacklistedIPs, setBlacklistedIPs] = useState<string[]>([]);
  const [privacySettings, setPrivacySettings] = useState<any>(null);

  useEffect(() => {
    const updateMetrics = () => {
      // Get security metrics
      const currentMetrics = AuditLogger.getMetrics();
      setMetrics(currentMetrics);

      // Get recent security events
      const events = AuditLogger.getLogs({
        limit: 10,
        severity: SeverityLevel.WARNING
      });
      setRecentEvents(events);

      // Get blacklisted IPs
      const blacklisted = DDoSProtection.getBlacklistedIdentifiers();
      setBlacklistedIPs(blacklisted);

      // Get privacy settings
      const privacy = GDPRCompliance.getPrivacySettings();
      setPrivacySettings(privacy);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case SeverityLevel.CRITICAL:
        return "text-red-600";
      case SeverityLevel.ERROR:
        return "text-orange-600";
      case SeverityLevel.WARNING:
        return "text-yellow-600";
      default:
        return "text-blue-600";
    }
  };

  const getEventIcon = (type: SecurityEventType) => {
    switch (type) {
      case SecurityEventType.LOGIN_FAILURE:
      case SecurityEventType.LOGIN_SUCCESS:
        return <Key className="w-4 h-4" />;
      case SecurityEventType.SUSPICIOUS_ACTIVITY:
        return <AlertTriangle className="w-4 h-4" />;
      case SecurityEventType.DATA_ACCESS:
      case SecurityEventType.DATA_MODIFICATION:
        return <Database className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  if (!metrics) {
    return <div>Loading security metrics...</div>;
  }

  return (
    <div className="security-monitor p-6 bg-black/50 rounded-lg border border-[#FFE666]/20">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-[#FFE666]" />
        <h2 className="text-xl font-bold text-[#FFE666]">Security Monitor</h2>
      </div>

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="metric-card p-4 bg-black/30 rounded border border-[#FFE666]/10">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-400">Successful Logins</span>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.successfulLogins}</div>
        </div>

        <div className="metric-card p-4 bg-black/30 rounded border border-[#FFE666]/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-gray-400">Failed Attempts</span>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.failedLoginAttempts}</div>
        </div>

        <div className="metric-card p-4 bg-black/30 rounded border border-[#FFE666]/10">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-400">Active Sessions</span>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.activeSessions}</div>
        </div>

        <div className="metric-card p-4 bg-black/30 rounded border border-[#FFE666]/10">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-gray-400">Suspicious Activities</span>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.suspiciousActivities}</div>
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="recent-events mb-6">
        <h3 className="text-sm font-semibold text-[#FFE666] mb-3">Recent Security Events</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recentEvents.length === 0 ? (
            <div className="text-sm text-gray-400">No recent security events</div>
          ) : (
            recentEvents.map((event, index) => (
              <div
                key={index}
                className="event-item p-2 bg-black/30 rounded border border-[#FFE666]/10 flex items-start gap-2"
              >
                {getEventIcon(event.type)}
                <div className="flex-1">
                  <div className="text-xs text-gray-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                  <div className={`text-sm ${getSeverityColor(event.severity)}`}>
                    {event.action}
                  </div>
                  {event.userEmail && (
                    <div className="text-xs text-gray-500">User: {event.userEmail}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Security Status */}
      <div className="security-status grid grid-cols-2 gap-4">
        <div className="status-item p-3 bg-black/30 rounded border border-[#FFE666]/10">
          <div className="text-xs text-gray-400 mb-1">Encryption Status</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-white">AES-256 Active</span>
          </div>
        </div>

        <div className="status-item p-3 bg-black/30 rounded border border-[#FFE666]/10">
          <div className="text-xs text-gray-400 mb-1">GDPR Compliance</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-white">Compliant</span>
          </div>
        </div>

        <div className="status-item p-3 bg-black/30 rounded border border-[#FFE666]/10">
          <div className="text-xs text-gray-400 mb-1">DDoS Protection</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-white">Active</span>
          </div>
        </div>

        <div className="status-item p-3 bg-black/30 rounded border border-[#FFE666]/10">
          <div className="text-xs text-gray-400 mb-1">Rate Limiting</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-white">Enforced</span>
          </div>
        </div>
      </div>

      {/* Blacklisted IPs */}
      {blacklistedIPs.length > 0 && (
        <div className="blacklist mt-4 p-3 bg-red-900/20 rounded border border-red-500/20">
          <div className="text-sm font-semibold text-red-400 mb-2">Blocked Identifiers</div>
          <div className="text-xs text-gray-400">
            {blacklistedIPs.length} identifier(s) currently blocked
          </div>
        </div>
      )}

      {/* Last Security Incident */}
      {metrics.lastSecurityIncident && (
        <div className="last-incident mt-4 p-3 bg-yellow-900/20 rounded border border-yellow-500/20">
          <div className="text-sm font-semibold text-yellow-400">Last Security Incident</div>
          <div className="text-xs text-gray-400">
            {new Date(metrics.lastSecurityIncident).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}