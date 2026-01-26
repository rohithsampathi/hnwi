// =============================================================================
// THESIS INPUT
// Section 1: Decision Thesis - What move? What outcome?
// =============================================================================

"use client";

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  DecisionThesis,
  MOVE_TYPES,
  AMOUNT_RANGES,
  TIMELINES,
  JURISDICTIONS
} from '@/lib/decision-memo/pattern-audit-types';

interface ThesisInputProps {
  value: Partial<DecisionThesis> | undefined;
  onChange: (data: Partial<DecisionThesis>) => void;
}

export function ThesisInput({ value, onChange }: ThesisInputProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-4">
      {/* Move Description - Primary Input */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          What is the move you're about to make? *
        </label>
        <textarea
          value={value?.moveDescription || ''}
          onChange={(e) => onChange({ moveDescription: e.target.value })}
          placeholder="Acquire $2M apartment in Dubai Marina for Golden Visa eligibility..."
          rows={3}
          className="w-full px-3 py-2.5 bg-background border border-border rounded-lg
                     text-foreground placeholder:text-muted-foreground/50
                     focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40
                     resize-none transition-all"
        />
        <p className="text-xs text-muted-foreground mt-1">
          One paragraph max. Be specific about amount, location, and purpose.
        </p>
      </div>

      {/* Expected Outcome */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          What outcome do you expect? *
        </label>
        <textarea
          value={value?.expectedOutcome || ''}
          onChange={(e) => onChange({ expectedOutcome: e.target.value })}
          placeholder="8-12% annual rental yield with tax-free income, plus UAE residency for family..."
          rows={2}
          className="w-full px-3 py-2.5 bg-background border border-border rounded-lg
                     text-foreground placeholder:text-muted-foreground/50
                     focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40
                     resize-none transition-all"
        />
      </div>

      {/* Optional: Structured Fields */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
          />
          Add structured details (optional)
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-border">
            {/* Move Type */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Move Type
              </label>
              <select
                value={value?.moveType || ''}
                onChange={(e) => onChange({ moveType: e.target.value as any })}
                className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg
                           text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Select type...</option>
                {MOVE_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Target Amount */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Target Amount
              </label>
              <select
                value={value?.targetAmount || ''}
                onChange={(e) => onChange({ targetAmount: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg
                           text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Select range...</option>
                {AMOUNT_RANGES.map(range => (
                  <option key={range.id} value={range.id}>{range.label}</option>
                ))}
              </select>
            </div>

            {/* Target Locations */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Target Locations
              </label>
              <input
                type="text"
                value={value?.targetLocations?.join(', ') || ''}
                onChange={(e) => onChange({
                  targetLocations: e.target.value
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean)
                })}
                placeholder="Dubai, UAE"
                className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg
                           text-foreground placeholder:text-muted-foreground/50
                           focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-xs text-muted-foreground mt-0.5">Comma-separated</p>
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Timeline
              </label>
              <select
                value={value?.timeline || ''}
                onChange={(e) => onChange({ timeline: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg
                           text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Select...</option>
                {TIMELINES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ThesisInput;
