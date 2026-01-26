// =============================================================================
// RAILS INPUT
// Section 3: Control & Rails - Who decides? What exists?
// =============================================================================

"use client";

import React from 'react';
import { X, Plus } from 'lucide-react';
import {
  ControlAndRails,
  Advisor,
  DECISION_MAKERS,
  ADVISOR_TYPES,
  JURISDICTIONS
} from '@/lib/decision-memo/pattern-audit-types';

interface RailsInputProps {
  value: Partial<ControlAndRails> | undefined;
  onChange: (data: Partial<ControlAndRails>) => void;
}

export function RailsInput({ value, onChange }: RailsInputProps) {
  // Add advisor
  const addAdvisor = () => {
    onChange({
      advisors: [...(value?.advisors || []), { type: '', jurisdiction: '' }]
    });
  };

  // Update advisor
  const updateAdvisor = (index: number, field: keyof Advisor, fieldValue: string) => {
    const updated = [...(value?.advisors || [])];
    updated[index] = { ...updated[index], [field]: fieldValue };
    onChange({ advisors: updated });
  };

  // Remove advisor
  const removeAdvisor = (index: number) => {
    onChange({
      advisors: (value?.advisors || []).filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-5">
      {/* Decision Authority */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Who makes the final decision?
        </label>
        <select
          value={value?.finalDecisionMaker || 'principal'}
          onChange={(e) => {
            const maker = e.target.value as ControlAndRails['finalDecisionMaker'];
            onChange({
              finalDecisionMaker: maker,
              decisionMakersCount:
                maker === 'principal' ? 1 :
                maker === 'spouse_partner' ? 2 : 3
            });
          }}
          className="w-full px-3 py-2.5 bg-background border border-border rounded-lg
                     text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {DECISION_MAKERS.map(dm => (
            <option key={dm.id} value={dm.id}>{dm.label}</option>
          ))}
        </select>
      </div>

      {/* Veto Holders (only show if not sole principal) */}
      {value?.finalDecisionMaker !== 'principal' && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Who can veto?
          </label>
          <input
            type="text"
            value={value?.vetoHolders?.join(', ') || ''}
            onChange={(e) => onChange({
              vetoHolders: e.target.value
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
            })}
            placeholder="Spouse, Parents..."
            className="w-full px-3 py-2 bg-background border border-border rounded-lg
                       text-foreground placeholder:text-muted-foreground/50
                       focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
        </div>
      )}

      {/* Approval Threshold */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Approval required above (optional)
        </label>
        <input
          type="text"
          value={value?.approvalRequiredAbove || ''}
          onChange={(e) => onChange({ approvalRequiredAbove: e.target.value })}
          placeholder="$500K requires spouse approval..."
          className="w-full px-3 py-2 bg-background border border-border rounded-lg
                     text-foreground placeholder:text-muted-foreground/50
                     focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Advisors */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Current advisor stack
        </label>

        <div className="space-y-2">
          {(value?.advisors || []).map((advisor, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select
                value={advisor.type}
                onChange={(e) => updateAdvisor(i, 'type', e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg
                           text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Type...</option>
                {ADVISOR_TYPES.map(at => (
                  <option key={at.id} value={at.id}>{at.label}</option>
                ))}
              </select>

              <input
                type="text"
                value={advisor.name || ''}
                onChange={(e) => updateAdvisor(i, 'name', e.target.value)}
                placeholder="Name (optional)"
                className="w-28 px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg
                           text-foreground placeholder:text-muted-foreground/50
                           focus:outline-none focus:ring-2 focus:ring-primary/40"
              />

              <input
                type="text"
                value={advisor.jurisdiction}
                onChange={(e) => updateAdvisor(i, 'jurisdiction', e.target.value)}
                placeholder="Jurisdiction"
                className="w-24 px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg
                           text-foreground placeholder:text-muted-foreground/50
                           focus:outline-none focus:ring-2 focus:ring-primary/40"
              />

              <button
                type="button"
                onClick={() => removeAdvisor(i)}
                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addAdvisor}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 mt-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add advisor
        </button>
      </div>

      {/* Existing Infrastructure */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Existing infrastructure
        </label>
        <div className="space-y-2">
          {/* Entities Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={(value?.existingEntities?.length || 0) > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange({
                    existingEntities: [{ type: '', jurisdiction: '' }]
                  });
                } else {
                  onChange({ existingEntities: [] });
                }
              }}
              className="w-4 h-4 rounded border-border text-primary
                         focus:ring-primary/40"
            />
            <span className="text-sm text-foreground">
              Existing entities (LLC, Trust, etc.)
            </span>
          </label>

          {/* Entity Details (if checked) */}
          {(value?.existingEntities?.length || 0) > 0 && (
            <div className="pl-6 space-y-2">
              {value?.existingEntities?.map((entity, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={entity.type}
                    onChange={(e) => {
                      const updated = [...(value?.existingEntities || [])];
                      updated[i] = { ...updated[i], type: e.target.value };
                      onChange({ existingEntities: updated });
                    }}
                    placeholder="Type (LLC, Trust...)"
                    className="flex-1 px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg
                               text-foreground placeholder:text-muted-foreground/50
                               focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    type="text"
                    value={entity.jurisdiction}
                    onChange={(e) => {
                      const updated = [...(value?.existingEntities || [])];
                      updated[i] = { ...updated[i], jurisdiction: e.target.value };
                      onChange({ existingEntities: updated });
                    }}
                    placeholder="Jurisdiction"
                    className="w-28 px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg
                               text-foreground placeholder:text-muted-foreground/50
                               focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        existingEntities: (value?.existingEntities || []).filter((_, idx) => idx !== i)
                      });
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  onChange({
                    existingEntities: [...(value?.existingEntities || []), { type: '', jurisdiction: '' }]
                  });
                }}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                + Add another entity
              </button>
            </div>
          )}

          {/* Banking Rails */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={(value?.bankingRails?.length || 0) > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange({
                    bankingRails: [{ bank: '', jurisdiction: '', status: 'active' }]
                  });
                } else {
                  onChange({ bankingRails: [] });
                }
              }}
              className="w-4 h-4 rounded border-border text-primary
                         focus:ring-primary/40"
            />
            <span className="text-sm text-foreground">
              Banking rails in target jurisdiction
            </span>
          </label>

          {/* IPS */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value?.hasFormalIPS || false}
              onChange={(e) => onChange({ hasFormalIPS: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary
                         focus:ring-primary/40"
            />
            <span className="text-sm text-foreground">
              Formal Investment Policy Statement
            </span>
          </label>

          {/* IPS Notes (if checked) */}
          {value?.hasFormalIPS && (
            <div className="pl-6">
              <textarea
                value={value?.ipsNotes || ''}
                onChange={(e) => onChange({ ipsNotes: e.target.value })}
                placeholder="Key points from your IPS..."
                rows={2}
                className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg
                           text-foreground placeholder:text-muted-foreground/50
                           focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RailsInput;
