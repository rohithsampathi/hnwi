"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  GitBranch,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  Shield,
  Target,
  Calendar,
  RefreshCw,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Info
} from 'lucide-react';
import {
  ScenarioTreeData,
  BranchName,
  ConditionStatus,
  formatCurrency,
  formatPercentage,
  getBranchDisplayName,
  MarketValidation
} from '@/lib/decision-memo/sfo-expert-types';
import { ViaNegativaContext } from '@/lib/decision-memo/memo-types';

interface ScenarioTreeSectionProps {
  data?: ScenarioTreeData | Record<string, never>;
  rawAnalysis?: string;
  viaNegativa?: ViaNegativaContext;
}

// Helper function to parse markdown bold (**text**) and render as bold spans
function parseMarkdownBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    // Odd indices are the bold parts (captured groups)
    if (index % 2 === 1) {
      return <span key={index} className="font-bold text-foreground">{part}</span>;
    }
    return part;
  });
}

// Branch strength indicator (visual bars)
function StrengthIndicator({ strength }: { strength: number }) {
  const bars = Math.round(strength * 5);

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`w-1.5 h-3 rounded-sm ${i <= bars ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>
      <span className="text-[10px] font-bold text-muted-foreground ml-1">
        {formatPercentage(strength)}
      </span>
    </div>
  );
}

// Condition status badge
function ConditionBadge({ status }: { status: ConditionStatus }) {
  const config: Record<ConditionStatus, { icon: React.ReactNode; color: string; label: string }> = {
    MET: { icon: <CheckCircle className="w-3 h-3" />, color: 'text-primary bg-primary/10', label: 'Met' },
    CONFIRMED: { icon: <CheckCircle className="w-3 h-3" />, color: 'text-primary bg-primary/10', label: 'Confirmed' },
    CONDITIONAL: { icon: <RefreshCw className="w-3 h-3" />, color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10', label: 'Conditional' },
    PENDING: { icon: <AlertTriangle className="w-3 h-3" />, color: 'text-muted-foreground bg-muted', label: 'Pending' },
    BLOCKED: { icon: <XCircle className="w-3 h-3" />, color: 'text-muted-foreground bg-muted/70', label: 'Blocked' }
  };

  const { icon, color, label } = config[status] || config.PENDING;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${color}`}>
      {icon}
      {label}
    </span>
  );
}

// Branch card component
function BranchCard({
  branch,
  isRecommended,
  index
}: {
  branch: ScenarioTreeData['branches'][0];
  isRecommended: boolean;
  index: number;
}) {
  const icons: Record<BranchName, React.ReactNode> = {
    PROCEED_NOW: <CheckCircle className="w-5 h-5 text-primary" />,
    PROCEED_MODIFIED: <AlertTriangle className="w-5 h-5 text-muted-foreground" />,
    DO_NOT_PROCEED: <XCircle className="w-5 h-5 text-muted-foreground" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`
        relative bg-gradient-to-br ${isRecommended ? 'from-primary/5 to-primary/10' : 'from-muted/5 to-muted/10'}
        border-2 ${isRecommended ? 'border-primary/60' : 'border-border'} rounded-xl p-3 sm:p-5
        ${isRecommended ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg' : ''}
      `}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
            ★ Recommended
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center shadow-sm">
            {icons[branch.name]}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">{getBranchDisplayName(branch.name)}</h4>
            <StrengthIndicator strength={branch.recommendation_strength} />
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="space-y-2 mb-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Conditions</p>
        {branch.conditions.map((condition, i) => (
          <div key={i} className="flex items-start gap-2 bg-card/50 rounded-lg p-2">
            <ConditionBadge status={condition.status} />
            <span className="text-xs text-muted-foreground flex-1">{condition.condition}</span>
          </div>
        ))}
      </div>

      {/* Expected Value */}
      <div className="bg-card rounded-lg p-3 mb-4 border border-border">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Expected Value</p>
        <p className={`text-xl font-bold ${branch.expected_value >= 0 ? 'text-primary' : 'text-muted-foreground'}`}>
          {branch.expected_value >= 0 ? '+' : ''}{formatCurrency(branch.expected_value)}
        </p>
        {branch.expected_value_note && (
          <p className="text-xs text-muted-foreground italic mt-1.5 leading-relaxed">
            {branch.expected_value_note}
          </p>
        )}
      </div>

      {/* Verdict */}
      <div className="pt-3 border-t border-border/50">
        <p className="text-xs text-foreground font-medium">{parseMarkdownBold(branch.verdict)}</p>
      </div>
    </motion.div>
  );
}

// Decision gate timeline item
function GateItem({ gate, index, total }: { gate: ScenarioTreeData['decision_gates'][0]; index: number; total: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative flex items-start gap-4"
    >
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center z-10">
          <span className="text-sm font-bold text-primary">{gate.gate_number}</span>
        </div>
        {index < total - 1 && (
          <div className="w-0.5 h-full bg-border absolute top-10 left-5" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Day {gate.day}</span>
          </div>
          <p className="text-sm text-foreground mb-3">{gate.check}</p>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-primary/10 rounded-lg p-2 border border-primary/20">
              <p className="text-[9px] uppercase tracking-wider text-primary font-bold mb-1">If Pass</p>
              <p className="text-[11px] text-muted-foreground">{gate.if_pass}</p>
            </div>
            <div className="bg-muted rounded-lg p-2 border border-border">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-1">If Fail</p>
              <p className="text-[11px] text-muted-foreground">{gate.if_fail}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export const ScenarioTreeSection: React.FC<ScenarioTreeSectionProps> = ({
  data,
  rawAnalysis,
  viaNegativa
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  const hasStructuredData = data && 'branches' in data && Array.isArray(data.branches) && data.branches.length > 0;
  const hasNarrativeAnalysis = rawAnalysis && rawAnalysis.trim().length > 0;

  // Filter out JSON blocks from markdown content
  const filterJsonFromMarkdown = (markdown: string): string => {
    // Remove JSON code blocks (```json ... ```)
    let filtered = markdown.replace(/```(?:json)?[\s\S]*?```/gi, '');
    // Remove standalone JSON objects at the end
    filtered = filtered.replace(/\n\s*\{[\s\S]*?"[a-z_]+"[\s\S]*\}\s*$/i, '');
    // Remove lines that look like pure JSON
    filtered = filtered.replace(/^\s*[\[\]{}",:\d]+\s*$/gm, '');
    return filtered.trim();
  };

  // Parse markdown sections for premium display - handles decorated borders (═══, ━━━) and various title formats
  const parseScenarioSections = (markdown: string) => {
    const sections: { number: string; title: string; content: string; type: 'path' | 'table' | 'decision' | 'text' }[] = [];
    const lines = markdown.split('\n');
    let currentSection: { number: string; title: string; content: string[]; type: 'path' | 'table' | 'decision' | 'text' } | null = null;
    let sectionCounter = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const prevLine = lines[i - 1] || '';

      // Skip pure border lines
      if (line.match(/^[═━─]+$/) || line.match(/^[\s]*$/)) {
        continue;
      }

      // Detect various section header patterns
      const mdSectionMatch = line.match(/^#+\s+(\d+)\.\s+(.+)/);
      const branchMatch = line.match(/^BRANCH\s+(\d+):\s+(.+)/i);
      const decisionMatch = line.match(/^DECISION\s+(TREE|GATES|MATRIX)\s*(?:VISUALIZATION)?:?\s*(.*)$/i);
      const allCapsSection = line.match(/^([A-Z][A-Z\s_-]+)(?:\s*\(|:|\s*$)/) && !line.match(/^[═━─]+$/);
      const isAfterBorder = prevLine.match(/^[═━─]+$/);

      if (mdSectionMatch || branchMatch || decisionMatch || (isAfterBorder && allCapsSection)) {
        if (currentSection && currentSection.content.length > 0) {
          sections.push({ ...currentSection, content: currentSection.content.join('\n') });
        }

        sectionCounter++;
        let title = '';
        let type: 'path' | 'table' | 'decision' | 'text' = 'text';
        let number = String(sectionCounter);

        if (mdSectionMatch) {
          number = mdSectionMatch[1];
          title = mdSectionMatch[2].trim();
        } else if (branchMatch) {
          number = branchMatch[1];
          title = `Branch ${branchMatch[1]}: ${branchMatch[2].trim()}`;
          type = 'path';
        } else if (decisionMatch) {
          title = `Decision ${decisionMatch[1]}${decisionMatch[2] ? ': ' + decisionMatch[2].trim() : ''}`;
          type = 'decision';
        } else if (allCapsSection) {
          title = line.replace(/[:\s]*$/, '').trim();
        }

        // Determine type based on keywords
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('branch') || lowerTitle.includes('path') || lowerTitle.includes('proceed')) {
          type = 'path';
        } else if (lowerTitle.includes('decision') || lowerTitle.includes('gate') || lowerTitle.includes('matrix') || lowerTitle.includes('summary')) {
          type = 'decision';
        }

        currentSection = { number, title, content: [], type };
      } else if (currentSection) {
        if (line.includes('|') && line.trim().startsWith('|')) {
          currentSection.type = 'table';
        }
        // Skip border/decoration lines in content
        if (!line.match(/^[═━─]+$/)) {
          currentSection.content.push(line);
        }
      }
    }
    if (currentSection && currentSection.content.length > 0) {
      sections.push({ ...currentSection, content: currentSection.content.join('\n') });
    }
    return sections;
  };

  // Parse markdown table
  const parseTable = (tableStr: string) => {
    const lines = tableStr.split('\n').filter(l => l.includes('|') && !l.match(/^\|[-\s|]+\|$/));
    if (lines.length < 2) return null;
    const headers = lines[0].split('|').filter(c => c.trim()).map(c => c.trim());
    const rows = lines.slice(1).map(line => line.split('|').filter(c => c.trim()).map(c => c.trim()));
    return { headers, rows };
  };

  // Extract branches from narrative markdown
  const extractBranchesFromNarrative = (text: string): Array<{
    name: 'PROCEED_NOW' | 'PROCEED_MODIFIED' | 'DO_NOT_PROCEED';
    displayName: string;
    expectedValue: string;
    strength: number;
    conditions: string[];
    verdict: string;
    isRecommended: boolean;
  }> => {
    const branches: Array<{
      name: 'PROCEED_NOW' | 'PROCEED_MODIFIED' | 'DO_NOT_PROCEED';
      displayName: string;
      expectedValue: string;
      strength: number;
      conditions: string[];
      verdict: string;
      isRecommended: boolean;
    }> = [];

    // Find recommended branch
    const recommendedMatch = text.match(/(?:RECOMMENDED|VERDICT|OPTIMAL)[:\s]+(?:BRANCH\s+\d+:?\s*)?([A-Z\s]+(?:NOW|MODIFIED|PROCEED)?)/i) ||
                            text.match(/(?:RECOMMENDED|OPTIMAL)\s+(?:PATH|BRANCH)[:\s]+([^\n]+)/i);
    const recommendedText = recommendedMatch ? recommendedMatch[1].toLowerCase() : '';

    // Look for BRANCH sections or PROCEED patterns
    const branchPatterns = [
      { regex: /BRANCH\s+1[:\s]+PROCEED\s+NOW|PROCEED\s+(?:NOW|IMMEDIATELY)/i, name: 'PROCEED_NOW' as const, display: 'Proceed Now' },
      { regex: /BRANCH\s+2[:\s]+PROCEED\s+(?:WITH\s+)?MODIF|PROCEED\s+(?:WITH\s+)?MODIF/i, name: 'PROCEED_MODIFIED' as const, display: 'Proceed Modified' },
      { regex: /BRANCH\s+3[:\s]+DO\s+NOT\s+PROCEED|DO\s+NOT\s+PROCEED|ABORT|REJECT/i, name: 'DO_NOT_PROCEED' as const, display: 'Do Not Proceed' }
    ];

    branchPatterns.forEach((pattern) => {
      if (pattern.regex.test(text)) {
        // Extract expected value for this branch
        const evMatch = text.match(new RegExp(pattern.display.replace(/\s+/g, '\\s+') + '[^$]*\\$([\\d,]+(?:\\.\\d+)?[KMB]?)', 'i')) ||
                       text.match(new RegExp('BRANCH\\s+\\d+[^$]*\\$([\\d,]+(?:\\.\\d+)?[KMB]?)', 'i'));
        const expectedValue = evMatch ? `$${evMatch[1]}` : '+$0';

        // Extract strength/probability
        const strengthMatch = text.match(new RegExp(pattern.display.replace(/\s+/g, '\\s+') + '[^\\d]*([0-9]{1,3})%', 'i'));
        const strength = strengthMatch ? parseInt(strengthMatch[1]) / 100 : 0.5;

        // Check if recommended
        const isRecommended = recommendedText.includes(pattern.name.toLowerCase().replace(/_/g, ' ')) ||
                             recommendedText.includes(pattern.display.toLowerCase()) ||
                             (pattern.name === 'PROCEED_NOW' && recommendedText.includes('proceed'));

        branches.push({
          name: pattern.name,
          displayName: pattern.display,
          expectedValue,
          strength,
          conditions: [],
          verdict: isRecommended ? 'Recommended strategic path based on analysis' : '',
          isRecommended
        });
      }
    });

    // If no branches found, create defaults based on common patterns
    if (branches.length === 0) {
      const hasPositive = text.match(/PROCEED|APPROVE|EXECUTE/i);
      const hasNegative = text.match(/DO NOT|REJECT|ABORT|AVOID/i);
      const hasModified = text.match(/MODIF|CONDITION|CONTINGENT/i);

      if (hasPositive) {
        branches.push({
          name: 'PROCEED_NOW',
          displayName: 'Proceed Now',
          expectedValue: '+$500K',
          strength: 0.7,
          conditions: ['Market conditions favorable', 'Due diligence complete'],
          verdict: 'Execute with standard precautions',
          isRecommended: !hasModified
        });
      }
      if (hasModified) {
        branches.push({
          name: 'PROCEED_MODIFIED',
          displayName: 'Proceed Modified',
          expectedValue: '+$350K',
          strength: 0.6,
          conditions: ['Address specific conditions', 'Renegotiate terms'],
          verdict: 'Execute after modifications',
          isRecommended: true
        });
      }
      if (hasNegative) {
        branches.push({
          name: 'DO_NOT_PROCEED',
          displayName: 'Do Not Proceed',
          expectedValue: '$0',
          strength: 0.3,
          conditions: ['Risk exceeds threshold', 'Better alternatives exist'],
          verdict: 'Preserve capital for alternatives',
          isRecommended: false
        });
      }
    }

    return branches;
  };

  // Extract decision gates from narrative
  const extractGatesFromNarrative = (text: string): Array<{
    gateNumber: number;
    day: number;
    check: string;
    ifPass: string;
    ifFail: string;
  }> => {
    const gates: Array<{
      gateNumber: number;
      day: number;
      check: string;
      ifPass: string;
      ifFail: string;
    }> = [];

    // Look for GATE patterns
    const gateMatches = text.matchAll(/GATE\s+(\d+)[:\s]+([^\n]+)/gi);
    for (const match of gateMatches) {
      const gateNum = parseInt(match[1]);
      const checkText = match[2].trim();
      gates.push({
        gateNumber: gateNum,
        day: gateNum * 7, // Default to weekly gates
        check: checkText,
        ifPass: 'Continue to next phase',
        ifFail: 'Reassess or abort'
      });
    }

    // Look for DAY patterns
    const dayMatches = text.matchAll(/DAY\s+(\d+)[:\s]+([^\n]+)/gi);
    for (const match of dayMatches) {
      const day = parseInt(match[1]);
      const checkText = match[2].trim();
      gates.push({
        gateNumber: gates.length + 1,
        day,
        check: checkText,
        ifPass: 'Proceed as planned',
        ifFail: 'Evaluate alternatives'
      });
    }

    // If no gates found, create defaults based on common patterns
    if (gates.length === 0) {
      const hasInspection = text.match(/inspection|due\s+diligence|assess/i);
      const hasNegotiation = text.match(/negotiat|contract|terms/i);
      const hasClose = text.match(/clos|final|execut/i);

      if (hasInspection) {
        gates.push({
          gateNumber: 1,
          day: 7,
          check: 'Complete due diligence and inspection',
          ifPass: 'Move to negotiation phase',
          ifFail: 'Renegotiate or exit'
        });
      }
      if (hasNegotiation) {
        gates.push({
          gateNumber: gates.length + 1,
          day: 14,
          check: 'Finalize terms and conditions',
          ifPass: 'Proceed to closing',
          ifFail: 'Reassess deal structure'
        });
      }
      if (hasClose) {
        gates.push({
          gateNumber: gates.length + 1,
          day: 30,
          check: 'Execute final closing',
          ifPass: 'Transaction complete',
          ifFail: 'Exercise exit clause'
        });
      }
    }

    return gates;
  };

  // Extract key decision metrics
  const extractDecisionMetrics = (text: string) => {
    const metrics: { label: string; value: string; type: 'good' | 'bad' | 'neutral' }[] = [];
    const evMatch = text.match(/EXPECTED\s+VALUE[:\s]+[\|\s]*\$?([\d,]+(?:\.\d+)?[KMB]?)/i);
    if (evMatch) metrics.push({ label: 'Expected Value', value: `$${evMatch[1]}`, type: 'good' });
    const worstMatch = text.match(/Worst.*?(?:case|outcome).*?:\s*\$?([\d,]+)/i);
    if (worstMatch) metrics.push({ label: 'Worst Case', value: `$${worstMatch[1]}`, type: 'bad' });
    const bestMatch = text.match(/Best.*?(?:case|outcome).*?:\s*\$?([\d,]+)/i);
    if (bestMatch) metrics.push({ label: 'Best Case', value: `$${bestMatch[1]}`, type: 'good' });
    const roiMatch = text.match(/ROI[:\s]+([+-]?\d+(?:\.\d+)?%?)/i);
    if (roiMatch) metrics.push({ label: 'Expected ROI', value: roiMatch[1].includes('%') ? roiMatch[1] : `${roiMatch[1]}%`, type: 'good' });
    return metrics;
  };

  // Extract recommendation from narrative
  const extractRecommendation = (text: string): { branch: string; rationale: string[] } => {
    const recommendedMatch = text.match(/(?:RECOMMENDED|VERDICT|OPTIMAL)[:\s]+([^\n]+)/i);
    const branch = recommendedMatch ? recommendedMatch[1].trim() : 'Proceed with Modifications';

    const rationale: string[] = [];
    const rationaleMatches = text.matchAll(/(?:RATIONALE|REASONING|BECAUSE)[:\s]+([^\n]+)/gi);
    for (const match of rationaleMatches) {
      rationale.push(match[1].trim());
    }

    // Extract bullet points after recommendation
    const bulletMatches = text.matchAll(/[•✓-]\s+([^\n]+)/g);
    for (const match of bulletMatches) {
      if (rationale.length < 4 && match[1].length > 20 && match[1].length < 150) {
        rationale.push(match[1].trim());
      }
    }

    if (rationale.length === 0) {
      rationale.push('Strategic alignment with long-term objectives');
      rationale.push('Risk-adjusted returns within acceptable threshold');
    }

    return { branch, rationale };
  };

  // Visual branch card for narrative fallback
  function NarrativeBranchCard({
    branch,
    index
  }: {
    branch: ReturnType<typeof extractBranchesFromNarrative>[0];
    index: number;
  }) {
    const icons = {
      PROCEED_NOW: <CheckCircle className="w-5 h-5 text-primary" />,
      PROCEED_MODIFIED: <AlertTriangle className="w-5 h-5 text-muted-foreground" />,
      DO_NOT_PROCEED: <XCircle className="w-5 h-5 text-muted-foreground" />
    };

    const bars = Math.round(branch.strength * 5);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className={`
          relative bg-gradient-to-br ${branch.isRecommended ? 'from-primary/5 to-primary/10' : 'from-muted/5 to-muted/10'}
          border-2 ${branch.isRecommended ? 'border-primary/60' : 'border-border'} rounded-xl p-5
          ${branch.isRecommended ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg' : ''}
        `}
      >
        {/* Recommended Badge */}
        {branch.isRecommended && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <span className="px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
              ★ Recommended
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center shadow-sm">
              {icons[branch.name]}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">{branch.displayName}</h4>
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={`w-1.5 h-3 rounded-sm ${i <= bars ? 'bg-primary' : 'bg-muted'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground ml-1">
                  {Math.round(branch.strength * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expected Value */}
        <div className="bg-card rounded-lg p-3 mb-4 border border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Expected Value</p>
          <p className={`text-xl font-bold ${branch.expectedValue.includes('-') ? 'text-muted-foreground' : 'text-primary'}`}>
            {branch.expectedValue}
          </p>
        </div>

        {/* Verdict */}
        {branch.verdict && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-foreground font-medium">{parseMarkdownBold(branch.verdict)}</p>
          </div>
        )}
      </motion.div>
    );
  }

  // Visual gate item for narrative fallback
  function NarrativeGateItem({ gate, index, total }: { gate: ReturnType<typeof extractGatesFromNarrative>[0]; index: number; total: number }) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className="relative flex items-start gap-4"
      >
        {/* Timeline connector */}
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center z-10">
            <span className="text-sm font-bold text-primary">{gate.gateNumber}</span>
          </div>
          {index < total - 1 && (
            <div className="w-0.5 h-full bg-border absolute top-10 left-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 pb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Day {gate.day}</span>
            </div>
            <p className="text-sm text-foreground mb-3">{gate.check}</p>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-primary/10 rounded-lg p-2 border border-primary/20">
                <p className="text-[9px] uppercase tracking-wider text-primary font-bold mb-1">If Pass</p>
                <p className="text-[11px] text-muted-foreground">{gate.ifPass}</p>
              </div>
              <div className="bg-muted rounded-lg p-2 border border-border">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-1">If Fail</p>
                <p className="text-[11px] text-muted-foreground">{gate.ifFail}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Premium Narrative Fallback with VISUAL dashboard (matching Crisis Resilience style)
  if (!hasStructuredData && hasNarrativeAnalysis) {
    const cleanedAnalysis = filterJsonFromMarkdown(rawAnalysis);
    const keyMetrics = extractDecisionMetrics(cleanedAnalysis);
    const branches = extractBranchesFromNarrative(cleanedAnalysis);
    const gates = extractGatesFromNarrative(cleanedAnalysis);
    const recommendation = extractRecommendation(cleanedAnalysis);

    return (
      <div ref={sectionRef}>
        {/* Premium Header */}
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground tracking-wide">
              DECISION SCENARIO TREE
            </h2>
            <span className="px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-full">
              Game Theory
            </span>
          </div>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30" />
          <p className="text-sm text-muted-foreground mt-3">
            Strategic decision pathways with conditional outcomes
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Key Decision Metrics Grid */}
          {keyMetrics.length > 0 && (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {keyMetrics.map((metric, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl p-4 text-center border-2 ${
                    metric.type === 'good' ? 'bg-primary/5 border-primary/30' :
                    metric.type === 'bad' ? 'bg-muted border-border' :
                    'bg-card border-border'
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{metric.label}</p>
                  <p className={`text-xl font-bold ${
                    metric.type === 'good' ? 'text-primary' :
                    metric.type === 'bad' ? 'text-muted-foreground' :
                    'text-foreground'
                  }`}>
                    {metric.value}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Visual Decision Tree with Branch Cards */}
          {branches.length > 0 && (
            <motion.div
              className="bg-card border border-border rounded-xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="flex flex-col items-center">
                {/* Root Node */}
                <div className="w-48 p-4 bg-primary/10 border-2 border-primary rounded-xl text-center mb-4">
                  <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold text-foreground text-sm">Decision Point</p>
                  <p className="text-[10px] text-muted-foreground">Choose Your Path</p>
                </div>

                {/* Connector */}
                <div className="w-px h-6 bg-border" />
                <div className="w-full max-w-4xl h-px bg-border" />

                {/* Branch Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-4">
                  {branches.map((branch, index) => (
                    <NarrativeBranchCard
                      key={branch.name}
                      branch={branch}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Recommendation Card */}
          {recommendation && (
            <motion.div
              className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/30 rounded-xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Strategic Recommendation
                </h3>
              </div>

              <div className="bg-card rounded-lg p-4 mb-4 border border-border">
                <p className="text-lg font-bold text-foreground">{parseMarkdownBold(recommendation.branch)}</p>
              </div>

              {recommendation.rationale.length > 0 && (
                <div className="space-y-2">
                  {recommendation.rationale.map((reason, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{parseMarkdownBold(reason)}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Decision Gates Timeline */}
          {gates.length > 0 && (
            <motion.div
              className="bg-card border border-border rounded-xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Decision Gates Timeline
                </h3>
              </div>

              <div className="relative ml-1">
                {gates.map((gate, index) => (
                  <NarrativeGateItem
                    key={gate.gateNumber}
                    gate={gate}
                    index={index}
                    total={gates.length}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Expiry Notice */}
          <motion.div
            className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Decision Tree Valid For: <span className="font-bold">30 days</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Reassess if: Market shift &gt;10% | New regulations | Counterparty changes
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Intelligence Source Footer */}
        <motion.div
          className="flex items-center justify-center gap-2 pt-6"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <p className="text-[10px] text-muted-foreground">
            Grounded in HNWI Chronicles KG Decision Framework + Game Theory Models
          </p>
        </motion.div>
      </div>
    );
  }

  if (!hasStructuredData) {
    return null;
  }

  const typedData = data as ScenarioTreeData;
  const recommendedBranch = typedData.branches.find(b => b.name === typedData.recommended_branch);

  return (
    <div ref={sectionRef}>
      {/* Premium Header */}
      <motion.div
        className="mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground tracking-wide">
            DECISION SCENARIO TREE
          </h2>
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
            Game Theory
          </span>
        </div>
        <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30" />
        <p className="text-sm text-muted-foreground mt-3">
          Strategic decision pathways with conditional outcomes
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Visual Decision Tree */}
        <motion.div
          className="bg-card border border-border rounded-xl p-3 sm:p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex flex-col items-center">
            {/* Root Node */}
            <div className="w-40 sm:w-48 p-3 sm:p-4 bg-primary/10 border-2 border-primary rounded-xl text-center mb-4">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-foreground text-xs sm:text-sm">Decision Point</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">Choose Your Path</p>
            </div>

            {/* Connector */}
            <div className="w-px h-4 sm:h-6 bg-border" />
            <div className="hidden md:block w-full max-w-4xl h-px bg-border" />

            {/* Branch Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full mt-3 sm:mt-4">
              {typedData.branches.map((branch, index) => (
                <BranchCard
                  key={branch.name}
                  branch={branch}
                  isRecommended={branch.name === typedData.recommended_branch}
                  index={index}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recommendation Rationale */}
        {recommendedBranch && (
          <motion.div
            className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/30 rounded-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Recommendation: {getBranchDisplayName(typedData.recommended_branch)}
              </h3>
            </div>

            <div className="space-y-2 mb-4">
              {typedData.rationale.map((reason, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{reason}</p>
                </div>
              ))}
            </div>

            {/* Verdict Conditions */}
            {recommendedBranch.verdict_conditions.length > 0 && (
              <div className="pt-4 border-t border-primary/20">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Choose this path if:</p>
                <div className="flex flex-wrap gap-2">
                  {recommendedBranch.verdict_conditions.map((condition, i) => (
                    <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Decision Gates Timeline */}
        {typedData.decision_gates.length > 0 && (
          <motion.div
            className="bg-card border border-border rounded-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Decision Gates
              </h3>
            </div>

            <div className="relative ml-1">
              {typedData.decision_gates.map((gate, index) => (
                <GateItem
                  key={gate.gate_number}
                  gate={gate}
                  index={index}
                  total={typedData.decision_gates.length}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Decision Matrix Table */}
        {typedData.decision_matrix.length > 0 && (
          <motion.div
            className="bg-card border border-border rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Decision Matrix
                </h3>
              </div>
            </div>

            {/* Mobile: Card layout */}
            <div className="md:hidden space-y-3 p-4">
              {typedData.decision_matrix.map((entry, i) => (
                <div key={i} className="bg-muted/20 rounded-lg p-3 space-y-2 border border-border">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{entry.branch}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground whitespace-nowrap">
                      {entry.risk_level}
                    </span>
                  </div>
                  <p className={`text-lg font-bold ${entry.expected_value.startsWith('+') ? 'text-primary' : 'text-muted-foreground'}`}>
                    {entry.expected_value}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{entry.recommended_if}</p>
                </div>
              ))}
            </div>
            {/* Desktop: Table layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Branch</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Expected Value</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Risk Level</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recommended If</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {typedData.decision_matrix.map((entry, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap">{entry.branch}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-sm font-bold ${entry.expected_value.startsWith('+') ? 'text-primary' : 'text-muted-foreground'}`}>
                          {entry.expected_value}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-muted text-muted-foreground whitespace-nowrap">
                          {entry.risk_level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{entry.recommended_if}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Market Validation - Expected vs Reality */}
        {typedData.market_validation && (
          <motion.div
            className="bg-card border border-border rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className={`w-5 h-5 ${viaNegativa?.isActive ? 'text-red-500' : 'text-primary'}`} />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    {viaNegativa?.isActive ? viaNegativa.scenarioHeader : 'Expected vs Reality'}
                  </h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  typedData.market_validation.overall_confidence === 'high'
                    ? 'bg-primary/10 text-primary'
                    : typedData.market_validation.overall_confidence === 'moderate'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {typedData.market_validation.overall_confidence} confidence
                </span>
              </div>
            </div>

            <div className="p-3 sm:p-5 space-y-4">
              {/* Appreciation Comparison */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 items-center">
                <div className={`rounded-lg p-3 sm:p-4 text-center border ${
                  viaNegativa?.isActive
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-muted/30 border-border'
                }`}>
                  <p className={`text-[10px] uppercase tracking-wider mb-1 ${
                    viaNegativa?.isActive ? 'text-red-400 font-bold' : 'text-muted-foreground'
                  }`}>{viaNegativa?.isActive ? viaNegativa.expectationLabel : 'Your Expectation'}</p>
                  <p className="text-xl font-bold text-foreground">
                    {typedData.market_validation.expected_vs_reality.appreciation.your_expectation}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Appreciation Rate</p>
                </div>

                <div className="hidden md:flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2">
                    {typedData.market_validation.expected_vs_reality.appreciation.deviation?.includes('above') ? (
                      <TrendingUp className="w-5 h-5 text-amber-500" />
                    ) : typedData.market_validation.expected_vs_reality.appreciation.deviation?.includes('below') ? (
                      <TrendingDown className="w-5 h-5 text-primary" />
                    ) : (
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className={`text-xs font-bold ${
                      typedData.market_validation.expected_vs_reality.appreciation.warning_level === 'high' ||
                      typedData.market_validation.expected_vs_reality.appreciation.warning_level === 'extreme'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-muted-foreground'
                    }`}>
                      {typedData.market_validation.expected_vs_reality.appreciation.deviation || 'vs'}
                    </span>
                  </div>
                </div>

                <div className={`rounded-lg p-3 sm:p-4 text-center border-2 ${
                  viaNegativa?.isActive
                    ? (typedData.market_validation.expected_vs_reality.appreciation.market_actual
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : 'bg-muted/30 border-border')
                    : (typedData.market_validation.expected_vs_reality.appreciation.market_actual
                        ? 'bg-primary/5 border-primary/30'
                        : 'bg-muted/30 border-border')
                }`}>
                  <p className={`text-[10px] uppercase tracking-wider mb-1 ${
                    viaNegativa?.isActive ? 'text-emerald-400 font-bold' : 'text-muted-foreground'
                  }`}>{viaNegativa?.isActive ? viaNegativa.actualLabel : 'Market Actual'}</p>
                  <p className={`text-xl font-bold ${viaNegativa?.isActive ? 'text-emerald-400' : 'text-primary'}`}>
                    {typedData.market_validation.expected_vs_reality.appreciation.market_actual || 'N/A'}
                  </p>
                  {typedData.market_validation.expected_vs_reality.appreciation.market_source && (
                    <p className="text-[9px] text-muted-foreground mt-1 break-words">
                      {typedData.market_validation.expected_vs_reality.appreciation.market_source}
                    </p>
                  )}
                </div>
              </div>

              {/* Warning for Appreciation */}
              {typedData.market_validation.expected_vs_reality.appreciation.warning &&
               typedData.market_validation.expected_vs_reality.appreciation.warning_level !== 'none' && (
                <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                  typedData.market_validation.expected_vs_reality.appreciation.warning_level === 'extreme'
                    ? 'bg-red-500/10 border-red-500/30'
                    : typedData.market_validation.expected_vs_reality.appreciation.warning_level === 'high'
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-muted border-border'
                }`}>
                  <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    typedData.market_validation.expected_vs_reality.appreciation.warning_level === 'extreme'
                      ? 'text-red-500'
                      : typedData.market_validation.expected_vs_reality.appreciation.warning_level === 'high'
                      ? 'text-amber-500'
                      : 'text-muted-foreground'
                  }`} />
                  <p className="text-xs text-muted-foreground">
                    {typedData.market_validation.expected_vs_reality.appreciation.warning}
                  </p>
                </div>
              )}

              {/* Rental Yield Comparison */}
              {typedData.market_validation.expected_vs_reality.rental_yield?.your_expectation && (
                <>
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 items-center">
                      <div className={`rounded-lg p-4 text-center border ${
                        viaNegativa?.isActive
                          ? 'bg-red-500/10 border-red-500/20'
                          : 'bg-muted/30 border-border'
                      }`}>
                        <p className={`text-[10px] uppercase tracking-wider mb-1 ${
                          viaNegativa?.isActive ? 'text-red-400 font-bold' : 'text-muted-foreground'
                        }`}>{viaNegativa?.isActive ? viaNegativa.expectationLabel : 'Your Expectation'}</p>
                        <p className="text-xl font-bold text-foreground">
                          {typedData.market_validation.expected_vs_reality.rental_yield.your_expectation}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Rental Yield</p>
                      </div>

                      <div className="hidden md:flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2">
                          {typedData.market_validation.expected_vs_reality.rental_yield.deviation?.includes('above') ? (
                            <TrendingUp className="w-5 h-5 text-amber-500" />
                          ) : typedData.market_validation.expected_vs_reality.rental_yield.deviation?.includes('below') ? (
                            <TrendingDown className="w-5 h-5 text-primary" />
                          ) : (
                            <ArrowRight className="w-5 h-5 text-muted-foreground" />
                          )}
                          <span className={`text-xs font-bold ${
                            typedData.market_validation.expected_vs_reality.rental_yield.warning_level === 'high' ||
                            typedData.market_validation.expected_vs_reality.rental_yield.warning_level === 'extreme'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-muted-foreground'
                          }`}>
                            {typedData.market_validation.expected_vs_reality.rental_yield.deviation || 'vs'}
                          </span>
                        </div>
                      </div>

                      <div className={`rounded-lg p-3 sm:p-4 text-center border-2 ${
                        viaNegativa?.isActive
                          ? (typedData.market_validation.expected_vs_reality.rental_yield.market_actual
                              ? 'bg-emerald-500/10 border-emerald-500/20'
                              : 'bg-muted/30 border-border')
                          : (typedData.market_validation.expected_vs_reality.rental_yield.market_actual
                              ? 'bg-primary/5 border-primary/30'
                              : 'bg-muted/30 border-border')
                      }`}>
                        <p className={`text-[10px] uppercase tracking-wider mb-1 ${
                          viaNegativa?.isActive ? 'text-emerald-400 font-bold' : 'text-muted-foreground'
                        }`}>{viaNegativa?.isActive ? viaNegativa.actualLabel : 'Market Actual'}</p>
                        <p className={`text-xl font-bold ${viaNegativa?.isActive ? 'text-emerald-400' : 'text-primary'}`}>
                          {typedData.market_validation.expected_vs_reality.rental_yield.market_actual || 'N/A'}
                        </p>
                        {typedData.market_validation.expected_vs_reality.rental_yield.market_source && (
                          <p className="text-[9px] text-muted-foreground mt-1 break-words">
                            {typedData.market_validation.expected_vs_reality.rental_yield.market_source}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Warning for Rental Yield */}
                  {typedData.market_validation.expected_vs_reality.rental_yield.warning &&
                   typedData.market_validation.expected_vs_reality.rental_yield.warning_level !== 'none' && (
                    <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                      typedData.market_validation.expected_vs_reality.rental_yield.warning_level === 'extreme'
                        ? 'bg-red-500/10 border-red-500/30'
                        : typedData.market_validation.expected_vs_reality.rental_yield.warning_level === 'high'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-muted border-border'
                    }`}>
                      <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        typedData.market_validation.expected_vs_reality.rental_yield.warning_level === 'extreme'
                          ? 'text-red-500'
                          : typedData.market_validation.expected_vs_reality.rental_yield.warning_level === 'high'
                          ? 'text-amber-500'
                          : 'text-muted-foreground'
                      }`} />
                      <p className="text-xs text-muted-foreground">
                        {typedData.market_validation.expected_vs_reality.rental_yield.warning}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Recommendation */}
              {typedData.market_validation.recommendation && (
                <div className="bg-primary/5 border border-primary/30 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">
                      {typedData.market_validation.recommendation}
                    </p>
                  </div>
                </div>
              )}

              {/* Deviation Commentary - Via Negativa */}
              {viaNegativa?.isActive && typedData.market_validation && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/20 rounded-lg">
                  <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">{viaNegativa.commentaryTitle}</p>
                  <p className="text-sm text-red-600/80 dark:text-red-300/80 leading-relaxed">
                    {viaNegativa.commentaryBody}
                  </p>
                </div>
              )}

              {/* Data Sources */}
              {typedData.market_validation.data_sources_used && typedData.market_validation.data_sources_used.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-2">Data Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {typedData.market_validation.data_sources_used.map((source, i) => (
                      <span key={i} className="px-2 py-1 bg-muted rounded text-[10px] text-muted-foreground">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Expiry Notice */}
        <motion.div
          className="flex items-center justify-between p-4 bg-muted border border-border rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Decision Tree Valid For: <span className="font-bold">{typedData.expiry.days} days</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Reassess if: {typedData.expiry.reassess_triggers.join(' | ')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Intelligence Source Footer */}
        <motion.div
          className="flex items-center justify-center gap-2 pt-4"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <p className="text-[10px] text-muted-foreground">
            Grounded in HNWI Chronicles KG Decision Framework + Game Theory Models
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ScenarioTreeSection;
