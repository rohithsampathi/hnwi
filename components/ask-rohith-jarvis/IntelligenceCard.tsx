// Inline intelligence card component for displaying KG intelligence visually

import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Map, Calendar, Users, Scale, Shield, Globe } from 'lucide-react';

interface IntelligenceCardProps {
  category: string;
  jurisdiction: string;
  label: string;
  intelligence?: string;
  source?: string;
  onClick?: () => void;
}

/**
 * Parse structured intelligence data and render visually
 */
function parseIntelligence(intelligence: string, category: string) {
  if (!intelligence) return null;

  // Tax rates parsing
  if (category === 'tax_rates') {
    const rates: { label: string; value: string }[] = [];
    const advantages: string[] = [];
    const changes: string[] = [];

    // Extract rates (e.g., "Income Tax: 37%")
    const ratePattern = /([^:|]+):\s*([0-9.]+%|N\/A)/g;
    let match;
    while ((match = ratePattern.exec(intelligence)) !== null) {
      rates.push({ label: match[1].trim(), value: match[2] });
    }

    // Extract advantages
    const advMatch = intelligence.match(/Key advantages:\s*([^.]+)/);
    if (advMatch) {
      advantages.push(...advMatch[1].split(';').map(s => s.trim()));
    }

    // Extract changes
    const changeMatch = intelligence.match(/Recent changes:\s*([^.]+)/);
    if (changeMatch) {
      changes.push(changeMatch[1].trim());
    }

    return { rates, advantages, changes };
  }

  // Migration data parsing
  if (category === 'migration' || category === 'corridor') {
    const metrics: { label: string; value: string }[] = [];
    const drivers: string[] = [];

    // Extract volume/flow metrics
    const volumeMatch = intelligence.match(/([0-9,]+)\s*HNWIs/);
    if (volumeMatch) {
      metrics.push({ label: 'Volume', value: volumeMatch[1] });
    }

    // Extract drivers
    const driverMatch = intelligence.match(/Drivers?:\s*([^.]+)/);
    if (driverMatch) {
      drivers.push(...driverMatch[1].split(',').map(s => s.trim()));
    }

    return { metrics, drivers };
  }

  // Regulatory calendar parsing
  if (category === 'regulatory_calendar') {
    const deadline = intelligence.match(/\[([\d-]+)\]/)?.[1];
    const event = intelligence.split(']:')[0]?.split(': ')[1];
    const impact = intelligence.match(/HNWI Impact:\s*([^.]+)/)?.[1];
    const action = intelligence.match(/Action:\s*([^.]+)/)?.[1];
    const penalty = intelligence.match(/Penalty:\s*([^.]+)/)?.[1];

    return { deadline, event, impact, action, penalty };
  }

  return null;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'tax_rates': return Scale;
    case 'migration': return TrendingUp;
    case 'corridor': return Map;
    case 'regulatory_calendar': return Calendar;
    case 'peer_intelligence': return Users;
    case 'jurisdiction_drivers': return Globe;
    case 'succession': return Shield;
    case 'teci_cascades': return AlertTriangle;
    default: return Globe;
  }
}

function getCategoryColor(category: string) {
  // Using design system colors: #D4A843 gold, #22C55E proceed, #EF4444 abort, #F59E0B risk-high
  switch (category) {
    case 'tax_rates': return 'text-gold bg-gold/10 border-gold/20';
    case 'migration': return 'text-verdict-proceed bg-verdict-proceed/10 border-verdict-proceed/20';
    case 'corridor': return 'text-gold-muted bg-gold-muted/10 border-gold-muted/20';
    case 'regulatory_calendar': return 'text-verdict-abort bg-verdict-abort/10 border-verdict-abort/20';
    case 'peer_intelligence': return 'text-gold bg-gold/10 border-gold/20';
    case 'jurisdiction_drivers': return 'text-gold bg-gold/10 border-gold/20';
    case 'succession': return 'text-gold-muted bg-gold-muted/10 border-gold-muted/20';
    case 'teci_cascades': return 'text-risk-high bg-risk-high/10 border-risk-high/20';
    default: return 'text-gold bg-gold/10 border-gold/20';
  }
}

export default function IntelligenceCard({
  category,
  jurisdiction,
  label,
  intelligence,
  source,
  onClick
}: IntelligenceCardProps) {
  const Icon = getCategoryIcon(category);
  const colorClass = getCategoryColor(category);
  const parsed = intelligence ? parseIntelligence(intelligence, category) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all ${colorClass}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-1">
            {jurisdiction}
          </div>
          <div className="font-medium text-sm leading-tight">
            {label}
          </div>
        </div>
      </div>

      {/* Parsed Data */}
      {parsed && (
        <div className="space-y-2 mt-3 pt-3 border-t border-border/10">
          {/* Tax Rates */}
          {'rates' in parsed && parsed.rates && (
            <div className="grid grid-cols-2 gap-2">
              {parsed.rates.slice(0, 4).map((rate, i) => (
                <div key={i} className="text-xs">
                  <span className="text-muted-foreground">{rate.label}:</span>
                  <span className="ml-1 font-mono font-semibold">{rate.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Migration Metrics */}
          {'metrics' in parsed && parsed.metrics && (
            <div className="space-y-1">
              {parsed.metrics.map((metric, i) => (
                <div key={i} className="text-xs flex justify-between">
                  <span className="text-muted-foreground">{metric.label}:</span>
                  <span className="font-mono font-semibold">{metric.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Regulatory Deadline */}
          {'deadline' in parsed && parsed.deadline && (
            <div className="space-y-1">
              <div className="text-xs font-mono font-semibold text-verdict-abort">
                Deadline: {parsed.deadline}
              </div>
              {parsed.impact && (
                <div className="text-xs text-muted-foreground">
                  {parsed.impact}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Click hint */}
      <div className="mt-3 pt-2 border-t border-border/10">
        <div className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">
          Click for full intelligence
        </div>
      </div>
    </motion.div>
  );
}
