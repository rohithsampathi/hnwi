// =============================================================================
// THESIS INPUT
// Section 1: Decision Thesis - What move? What outcome?
// =============================================================================

"use client";

import React from 'react';
import {
  DecisionThesis,
  MOVE_TYPES,
  TIMELINES,
  JURISDICTIONS
} from '@/lib/decision-memo/pattern-audit-types';

interface ThesisInputProps {
  value: Partial<DecisionThesis> | undefined;
  onChange: (data: Partial<DecisionThesis>) => void;
}

export function ThesisInput({ value, onChange }: ThesisInputProps) {
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
          placeholder="Acquire luxury penthouse in Singapore for US $6.16M from NYC-based Single Family Office..."
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
          placeholder="9% annual rental yield with 16% capital appreciation, APAC portfolio diversification..."
          rows={2}
          className="w-full px-3 py-2.5 bg-background border border-border rounded-lg
                     text-foreground placeholder:text-muted-foreground/50
                     focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40
                     resize-none transition-all"
        />
      </div>

      {/* Structural Details */}
      <div className="space-y-3 pt-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Structural Details
        </p>

        {/* Move Type */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Move Type *
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

        {/* Target Locations */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Target Locations *
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
            placeholder="Singapore, Orchard Road, Marina Bay, Sentosa Cove"
            className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg
                       text-foreground placeholder:text-muted-foreground/50
                       focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <p className="text-xs text-muted-foreground mt-0.5">Comma-separated</p>
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Timeline *
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

        {/* Source Jurisdiction */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Source Jurisdiction (where capital sits) *
          </label>
          <select
            value={JURISDICTIONS.includes(value?.sourceJurisdiction as any) ? value?.sourceJurisdiction || '' : value?.sourceJurisdiction ? '__other__' : ''}
            onChange={(e) => {
              if (e.target.value === '__other__') {
                onChange({ sourceJurisdiction: '' });
              } else {
                onChange({ sourceJurisdiction: e.target.value || undefined });
              }
            }}
            className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg
                       text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Select...</option>
            {JURISDICTIONS.map(j => (
              <option key={j} value={j}>{j}</option>
            ))}
            <option value="__other__">Other</option>
          </select>
          {value?.sourceJurisdiction !== undefined && !JURISDICTIONS.includes(value?.sourceJurisdiction as any) && (
            <input
              type="text"
              value={value?.sourceJurisdiction || ''}
              onChange={(e) => onChange({ sourceJurisdiction: e.target.value })}
              placeholder="Enter jurisdiction..."
              className="w-full mt-1.5 px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg
                         text-foreground placeholder:text-muted-foreground/50
                         focus:outline-none focus:ring-2 focus:ring-primary/40"
              autoFocus
            />
          )}
        </div>

        {/* Source State (if US) */}
        {value?.sourceJurisdiction === 'United States' && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Source State *
            </label>
            <input
              type="text"
              value={value?.sourceState || ''}
              onChange={(e) => onChange({ sourceState: e.target.value })}
              placeholder="New York"
              className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg
                         text-foreground placeholder:text-muted-foreground/50
                         focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        )}

        {/* Destination Jurisdiction */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Destination Jurisdiction (where capital is going) *
          </label>
          <select
            value={JURISDICTIONS.includes(value?.destinationJurisdiction as any) ? value?.destinationJurisdiction || '' : value?.destinationJurisdiction !== undefined ? '__other__' : ''}
            onChange={(e) => {
              if (e.target.value === '__other__') {
                onChange({ destinationJurisdiction: '' });
              } else {
                onChange({ destinationJurisdiction: e.target.value || undefined });
              }
            }}
            className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg
                       text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Select...</option>
            {JURISDICTIONS.map(j => (
              <option key={j} value={j}>{j}</option>
            ))}
            <option value="__other__">Other</option>
          </select>
          {value?.destinationJurisdiction !== undefined && !JURISDICTIONS.includes(value?.destinationJurisdiction as any) && (
            <input
              type="text"
              value={value?.destinationJurisdiction || ''}
              onChange={(e) => onChange({ destinationJurisdiction: e.target.value })}
              placeholder="Enter jurisdiction..."
              className="w-full mt-1.5 px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg
                         text-foreground placeholder:text-muted-foreground/50
                         focus:outline-none focus:ring-2 focus:ring-primary/40"
              autoFocus
            />
          )}
        </div>

        {/* Destination State (if US) */}
        {value?.destinationJurisdiction === 'United States' && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Destination State *
            </label>
            <input
              type="text"
              value={value?.destinationState || ''}
              onChange={(e) => onChange({ destinationState: e.target.value })}
              placeholder="Texas, Florida..."
              className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg
                         text-foreground placeholder:text-muted-foreground/50
                         focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ThesisInput;
