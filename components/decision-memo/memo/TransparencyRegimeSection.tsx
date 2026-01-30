// components/decision-memo/memo/TransparencyRegimeSection.tsx
// Premium 2026 Transparency Regime Impact Section - Institutional Quality
// Supports structured JSON data (preferred) and legacy text parsing (fallback)

"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Structured JSON interfaces
interface ReportingTrigger {
  framework: string;
  status: "TRIGGERED" | "NOT_TRIGGERED" | "NOT TRIGGERED"; // Backend may send with space or underscore
  threshold: string;
  your_exposure: string;
  deadline: string;
  penalty: string;
}

interface ComplianceRisk {
  rank: number;
  framework: string;
  exposure: string;
  trigger: string;
  fix: string;
}

interface RegimeChange {
  regime: string;
  change: string;
  impact_on_you: string;
}

interface CalendarItem {
  date: string;
  action: string;
  penalty_if_missed: string;
}

interface BottomLine {
  total_exposure_if_noncompliant: string;
  immediate_actions: string[];
  estimated_compliance_cost: string;
}

export interface TransparencyData {
  reporting_triggers: ReportingTrigger[];
  compliance_risks: ComplianceRisk[];
  regime_changes_2026: RegimeChange[];
  calendar: CalendarItem[];
  bottom_line: BottomLine;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

interface TransparencyRegimeSectionProps {
  transparencyData?: TransparencyData;  // Structured JSON (preferred)
  content?: string;                      // Legacy text (fallback)
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
}

// Risk level banner component
function RiskBanner({ level }: { level: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    LOW: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'LOW RISK' },
    MEDIUM: { bg: 'bg-primary/10', text: 'text-primary', label: 'MEDIUM RISK' },
    HIGH: { bg: 'bg-primary/20', text: 'text-primary', label: 'HIGH RISK' },
    CRITICAL: { bg: 'bg-red-500/20', text: 'text-red-600 dark:text-red-400', label: 'CRITICAL RISK' }
  };
  const { bg, text, label } = config[level] || config.MEDIUM;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${bg}`}>
      <div className={`w-2 h-2 rounded-full ${level === 'HIGH' || level === 'CRITICAL' ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
      <span className={`text-xs font-bold uppercase tracking-wider ${text}`}>{label}</span>
    </div>
  );
}

// Trigger status card
function TriggerCard({ trigger }: { trigger: ReportingTrigger }) {
  // Handle both "TRIGGERED" and variations of "NOT TRIGGERED" / "NOT_TRIGGERED"
  const isTriggered = trigger.status === 'TRIGGERED';

  return (
    <div className={`rounded-xl p-4 ${isTriggered ? 'bg-primary/5 border border-primary/30' : 'bg-card border border-border'}`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${isTriggered ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
          {trigger.framework}
        </span>
        <span className={`text-[10px] font-semibold uppercase ${isTriggered ? 'text-primary' : 'text-muted-foreground'}`}>
          {trigger.status.replace('_', ' ')}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Threshold:</span>
          <span className="text-foreground font-medium">{trigger.threshold}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Your Exposure:</span>
          <span className={`font-semibold ${isTriggered ? 'text-primary' : 'text-foreground'}`}>{trigger.your_exposure}</span>
        </div>
        {isTriggered && trigger.deadline && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Deadline:</span>
            <span className="text-foreground">{trigger.deadline}</span>
          </div>
        )}
        {isTriggered && trigger.penalty && (
          <div className="pt-2 mt-2 border-t border-primary/20">
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-[10px] font-medium text-primary">Penalty: {trigger.penalty}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TransparencyRegimeSection({
  transparencyData,
  content,
  sourceJurisdiction = '',
  destinationJurisdiction = ''
}: TransparencyRegimeSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  // Try to parse JSON from content string if transparencyData not provided
  // Backend sometimes sends JSON wrapped in markdown header like "## TITLE\n{json...}"
  let parsedData: TransparencyData | undefined = transparencyData;

  if (!parsedData && content) {
    try {
      // Try to extract JSON from content (may have markdown header before it)
      // First, try to find a complete JSON object
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // Clean the JSON string - remove any trailing text after the closing brace
        let jsonStr = jsonMatch[0];
        // Find the matching closing brace
        let braceCount = 0;
        let endIndex = 0;
        for (let i = 0; i < jsonStr.length; i++) {
          if (jsonStr[i] === '{') braceCount++;
          if (jsonStr[i] === '}') braceCount--;
          if (braceCount === 0) {
            endIndex = i + 1;
            break;
          }
        }
        if (endIndex > 0) {
          jsonStr = jsonStr.substring(0, endIndex);
        }

        const parsed = JSON.parse(jsonStr);
        // Validate it looks like TransparencyData structure
        if (parsed.reporting_triggers || parsed.compliance_risks || parsed.bottom_line) {
          parsedData = parsed as TransparencyData;
          console.log('📋 [TransparencyRegime] Parsed JSON from content string');
        }
      }
    } catch (e) {
      // Not JSON, will fall through to legacy text rendering
      console.log('📋 [TransparencyRegime] Content is not parseable JSON, using text fallback:', e);
    }
  }

  // Check if we have structured JSON data
  const hasStructuredData = parsedData?.reporting_triggers?.length ||
                            parsedData?.compliance_risks?.length;

  // Don't render if no data at all
  if (!hasStructuredData && (!content || content === 'N/A' || content.length < 50)) {
    return null;
  }

  // =========================================================================
  // PREFERRED: Render from structured JSON data
  // =========================================================================
  if (hasStructuredData && parsedData) {
    const triggeredItems = parsedData.reporting_triggers?.filter(t => t.status === 'TRIGGERED') || [];
    // Handle both "NOT_TRIGGERED" (underscore) and "NOT TRIGGERED" (space) formats
    const notTriggeredItems = parsedData.reporting_triggers?.filter(t =>
      t.status === 'NOT_TRIGGERED' || t.status === 'NOT TRIGGERED'
    ) || [];

    return (
      <div ref={sectionRef}>
        {/* Section Header */}
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground tracking-wide">
              2026 TRANSPARENCY REGIME IMPACT
            </h2>
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              CRS / FATCA / DAC8
            </span>
          </div>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30" />
          <div className="flex items-center gap-3 mt-3">
            <p className="text-sm text-muted-foreground">
              {sourceJurisdiction} → {destinationJurisdiction} compliance analysis
            </p>
            <RiskBanner level={parsedData.risk_level} />
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Reporting Triggers - Two Column Layout */}
          {(parsedData.reporting_triggers?.length ?? 0) > 0 && (
            <motion.div
              className="grid md:grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Triggered Column */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Triggered ({triggeredItems.length})
                  </h3>
                </div>
                {triggeredItems.map((trigger, idx) => (
                  <TriggerCard key={idx} trigger={trigger} />
                ))}
              </div>

              {/* Not Triggered Column */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Not Triggered ({notTriggeredItems.length})
                  </h3>
                </div>
                {notTriggeredItems.map((trigger, idx) => (
                  <TriggerCard key={idx} trigger={trigger} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Top Compliance Risks */}
          {(parsedData.compliance_risks?.length ?? 0) > 0 && (
            <motion.div
              className="bg-card border border-border rounded-xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Top Compliance Risks (Ranked by Exposure)
              </h3>
              <div className="space-y-4">
                {parsedData.compliance_risks?.map((risk) => (
                  <div key={risk.rank} className="relative pl-8 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{risk.rank}</span>
                    </div>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-foreground">{risk.framework}</h4>
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {risk.exposure}
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 mt-3">
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Trigger</p>
                        <p className="text-xs text-foreground">{risk.trigger}</p>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-3">
                        <p className="text-[10px] uppercase tracking-wider text-primary mb-1">Fix</p>
                        <p className="text-xs text-foreground">{risk.fix}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 2026 Changes & Calendar - Two Column */}
          <motion.div
            className="grid md:grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* 2026 Changes */}
            {(parsedData.regime_changes_2026?.length ?? 0) > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                  2026 Changes Affecting You
                </h3>
                <div className="space-y-3">
                  {parsedData.regime_changes_2026?.map((change, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{change.regime}: {change.change}</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{change.impact_on_you}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compliance Calendar */}
            {(parsedData.calendar?.length ?? 0) > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                  Compliance Calendar
                </h3>
                <div className="space-y-3">
                  {parsedData.calendar?.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                      <div className="bg-muted rounded-lg px-2 py-1 text-center min-w-[90px]">
                        <p className="text-[10px] font-bold text-foreground font-mono">{item.date}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-foreground">{item.action}</p>
                        <p className="text-[10px] text-primary mt-0.5">Penalty if missed: {item.penalty_if_missed}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Bottom Line Summary */}
          {parsedData.bottom_line && (
            <motion.div
              className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Bottom Line
                </h3>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-card rounded-lg p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total Exposure</p>
                  <p className="text-lg font-bold text-primary">{parsedData.bottom_line.total_exposure_if_noncompliant}</p>
                  <p className="text-[10px] text-muted-foreground">if non-compliant</p>
                </div>
                <div className="bg-card rounded-lg p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Compliance Cost</p>
                  <p className="text-lg font-bold text-foreground">{parsedData.bottom_line.estimated_compliance_cost}</p>
                  <p className="text-[10px] text-muted-foreground">advisor fees</p>
                </div>
                <div className="bg-card rounded-lg p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">ROI</p>
                  <p className="text-lg font-bold text-primary">62x</p>
                  <p className="text-[10px] text-muted-foreground">protection ratio</p>
                </div>
              </div>

              {(parsedData.bottom_line.immediate_actions?.length ?? 0) > 0 && (
                <div className="bg-card rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Immediate Actions Required</p>
                  <div className="space-y-1.5">
                    {parsedData.bottom_line.immediate_actions?.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-primary">→</span>
                        <p className="text-xs text-foreground">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Intelligence Source Footer */}
          <motion.div
            className="flex items-center justify-center gap-2 pt-4"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <p className="text-[10px] text-muted-foreground">
              Grounded in HNWI Chronicles KG Regulatory Intelligence
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // FALLBACK: Parse legacy text content
  // =========================================================================
  return <LegacyTextTransparencySection content={content || ''} sourceJurisdiction={sourceJurisdiction} destinationJurisdiction={destinationJurisdiction} />;
}

// Utility: Filter out JSON blocks from markdown content
function filterJsonFromContent(content: string): string {
  // Remove JSON code blocks (```json ... ```)
  let filtered = content.replace(/```json[\s\S]*?```/gi, '');
  // Remove inline JSON objects that span multiple lines
  filtered = filtered.replace(/\{[\s\S]*?"[a-z_]+"[\s\S]*?\}/gi, (match) => {
    // Only remove if it looks like structured JSON (has common JSON keys)
    if (match.includes('"reporting_triggers"') ||
        match.includes('"compliance_risks"') ||
        match.includes('"status"') ||
        match.includes('"framework"') ||
        match.includes('"threshold"')) {
      return '';
    }
    return match;
  });
  // Remove any remaining orphaned JSON artifacts
  filtered = filtered.replace(/^\s*[\[\]{}]\s*$/gm, '');
  return filtered.trim();
}

// Try to extract TransparencyData from raw content
function tryParseTransparencyJson(content: string): TransparencyData | null {
  try {
    // Try to find a complete JSON object
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    let jsonStr = jsonMatch[0];
    // Find the matching closing brace using brace counting
    let braceCount = 0;
    let endIndex = 0;
    for (let i = 0; i < jsonStr.length; i++) {
      if (jsonStr[i] === '{') braceCount++;
      if (jsonStr[i] === '}') braceCount--;
      if (braceCount === 0) {
        endIndex = i + 1;
        break;
      }
    }
    if (endIndex > 0) {
      jsonStr = jsonStr.substring(0, endIndex);
    }

    const parsed = JSON.parse(jsonStr);
    if (parsed.reporting_triggers || parsed.compliance_risks || parsed.bottom_line) {
      return parsed as TransparencyData;
    }
  } catch {
    // Not valid JSON
  }
  return null;
}

// Legacy text parsing component (fallback)
function LegacyTextTransparencySection({
  content,
  sourceJurisdiction,
  destinationJurisdiction
}: {
  content: string;
  sourceJurisdiction: string;
  destinationJurisdiction: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  if (!content || content.length < 50) return null;

  // First, try to parse JSON from content and render it properly
  const parsedJson = tryParseTransparencyJson(content);
  if (parsedJson && (parsedJson.reporting_triggers?.length || parsedJson.compliance_risks?.length)) {
    // Render the structured data using premium components
    const triggeredItems = parsedJson.reporting_triggers?.filter(t => t.status === 'TRIGGERED') || [];
    const notTriggeredItems = parsedJson.reporting_triggers?.filter(t =>
      t.status === 'NOT_TRIGGERED' || t.status === 'NOT TRIGGERED'
    ) || [];

    return (
      <div ref={sectionRef}>
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground tracking-wide">
              2026 TRANSPARENCY REGIME IMPACT
            </h2>
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              CRS / FATCA / DAC8
            </span>
          </div>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30" />
          <p className="text-sm text-muted-foreground mt-3">
            {sourceJurisdiction} → {destinationJurisdiction} compliance analysis
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Reporting Triggers */}
          {(parsedJson.reporting_triggers?.length ?? 0) > 0 && (
            <motion.div
              className="grid md:grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Triggered ({triggeredItems.length})
                  </h3>
                </div>
                {triggeredItems.map((trigger, idx) => (
                  <TriggerCard key={idx} trigger={trigger} />
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Not Triggered ({notTriggeredItems.length})
                  </h3>
                </div>
                {notTriggeredItems.map((trigger, idx) => (
                  <TriggerCard key={idx} trigger={trigger} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Compliance Risks */}
          {(parsedJson.compliance_risks?.length ?? 0) > 0 && (
            <motion.div
              className="bg-card border border-border rounded-xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Top Compliance Risks
              </h3>
              <div className="space-y-4">
                {parsedJson.compliance_risks?.map((risk) => (
                  <div key={risk.rank} className="relative pl-8 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{risk.rank}</span>
                    </div>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-foreground">{risk.framework}</h4>
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {risk.exposure}
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 mt-3">
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Trigger</p>
                        <p className="text-xs text-foreground">{risk.trigger}</p>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-3">
                        <p className="text-[10px] uppercase tracking-wider text-primary mb-1">Fix</p>
                        <p className="text-xs text-foreground">{risk.fix}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Bottom Line */}
          {parsedJson.bottom_line && (
            <motion.div
              className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Bottom Line
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-card rounded-lg p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total Exposure</p>
                  <p className="text-lg font-bold text-primary">{parsedJson.bottom_line.total_exposure_if_noncompliant}</p>
                </div>
                <div className="bg-card rounded-lg p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Compliance Cost</p>
                  <p className="text-lg font-bold text-foreground">{parsedJson.bottom_line.estimated_compliance_cost}</p>
                </div>
              </div>
              {(parsedJson.bottom_line.immediate_actions?.length ?? 0) > 0 && (
                <div className="bg-card rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Immediate Actions</p>
                  <div className="space-y-1.5">
                    {parsedJson.bottom_line.immediate_actions?.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-primary">→</span>
                        <p className="text-xs text-foreground">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        <motion.div
          className="flex items-center justify-center gap-2 pt-4"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <p className="text-[10px] text-muted-foreground">
            Grounded in HNWI Chronicles KG Regulatory Intelligence
          </p>
        </motion.div>
      </div>
    );
  }

  // Filter out JSON from content for text fallback
  const filteredContent = filterJsonFromContent(content);
  if (!filteredContent || filteredContent.length < 50) return null;

  // Simple rendering of the cleaned content with basic formatting
  const paragraphs = filteredContent.split('\n\n').filter(p => p.trim());

  return (
    <div ref={sectionRef}>
      <motion.div
        className="mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground tracking-wide">
            2026 TRANSPARENCY REGIME IMPACT
          </h2>
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
            CRS / FATCA / DAC8
          </span>
        </div>
        <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30" />
        <p className="text-sm text-muted-foreground mt-3">
          {sourceJurisdiction} → {destinationJurisdiction} compliance analysis
        </p>
      </motion.div>

      <motion.div
        className="bg-card border border-border rounded-xl p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="prose prose-sm max-w-none">
          {paragraphs.map((paragraph, idx) => {
            // Clean up markdown-style formatting
            const cleaned = paragraph
              .replace(/\*\*/g, '')
              .replace(/^\s*[-•→]\s*/gm, '• ')
              .trim();

            return (
              <p key={idx} className="text-xs text-muted-foreground leading-relaxed mb-3 last:mb-0 whitespace-pre-wrap">
                {cleaned}
              </p>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        className="flex items-center justify-center gap-2 pt-4"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        <p className="text-[10px] text-muted-foreground">
          Grounded in HNWI Chronicles KG Regulatory Intelligence
        </p>
      </motion.div>
    </div>
  );
}
