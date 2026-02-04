// =============================================================================
// CONSTRAINTS INPUT
// Section 2: Constraints - What cannot change?
// =============================================================================

"use client";

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import {
  Constraints,
  LIQUIDITY_HORIZONS,
  JURISDICTIONS,
  PURCHASE_VEHICLES
} from '@/lib/decision-memo/pattern-audit-types';

interface ConstraintsInputProps {
  value: Partial<Constraints> | undefined;
  onChange: (data: Partial<Constraints>) => void;
}

export function ConstraintsInput({ value, onChange }: ConstraintsInputProps) {
  const [prohibitionInput, setProhibitionInput] = useState('');
  const [dealBreakerInput, setDealBreakerInput] = useState('');
  const [liquidityEventInput, setLiquidityEventInput] = useState('');

  // Add prohibition
  const addProhibition = () => {
    if (!prohibitionInput.trim()) return;
    onChange({
      prohibitions: [...(value?.prohibitions || []), prohibitionInput.trim()]
    });
    setProhibitionInput('');
  };

  // Remove prohibition
  const removeProhibition = (index: number) => {
    onChange({
      prohibitions: (value?.prohibitions || []).filter((_, i) => i !== index)
    });
  };

  // Add deal breaker
  const addDealBreaker = () => {
    if (!dealBreakerInput.trim()) return;
    onChange({
      dealBreakers: [...(value?.dealBreakers || []), dealBreakerInput.trim()]
    });
    setDealBreakerInput('');
  };

  // Remove deal breaker
  const removeDealBreaker = (index: number) => {
    onChange({
      dealBreakers: (value?.dealBreakers || []).filter((_, i) => i !== index)
    });
  };

  // Add liquidity event
  const addLiquidityEvent = () => {
    if (!liquidityEventInput.trim()) return;
    onChange({
      liquidityEvents: [...(value?.liquidityEvents || []), liquidityEventInput.trim()]
    });
    setLiquidityEventInput('');
  };

  // Remove liquidity event
  const removeLiquidityEvent = (index: number) => {
    onChange({
      liquidityEvents: (value?.liquidityEvents || []).filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-5">
      {/* Liquidity Horizon */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          When might you need access to this capital?
        </label>
        <select
          value={value?.liquidityHorizon || ''}
          onChange={(e) => onChange({ liquidityHorizon: e.target.value })}
          className="w-full px-3 py-2.5 bg-background border border-border rounded-lg
                     text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">Select horizon...</option>
          {LIQUIDITY_HORIZONS.map(h => (
            <option key={h.id} value={h.id}>{h.label}</option>
          ))}
        </select>
      </div>

      {/* Destination Property Count */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Properties already owned at destination (optional)
        </label>
        <select
          value={value?.destinationPropertyCount ?? ''}
          onChange={(e) => onChange({
            destinationPropertyCount: e.target.value ? parseInt(e.target.value, 10) : undefined
          })}
          className="w-full px-3 py-2.5 bg-background border border-border rounded-lg
                     text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">Not specified</option>
          <option value="0">0 (first property)</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3+</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Affects stamp duty / ABSD tier calculations.
        </p>
      </div>

      {/* Purchase Vehicle */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Purchase vehicle
        </label>
        <select
          value={value?.purchaseVehicle || ''}
          onChange={(e) => onChange({ purchaseVehicle: e.target.value || undefined })}
          className="w-full px-3 py-2.5 bg-background border border-border rounded-lg
                     text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">Not specified</option>
          {PURCHASE_VEHICLES.map(pv => (
            <option key={pv.id} value={pv.id}>{pv.label}</option>
          ))}
        </select>
      </div>

      {/* Relocation Intent */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={value?.isRelocating || false}
              onChange={(e) => onChange({ isRelocating: e.target.checked })}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-border rounded bg-background
                          peer-checked:bg-primary peer-checked:border-primary
                          peer-focus:ring-2 peer-focus:ring-primary/40
                          transition-all duration-200" />
            <svg
              className="absolute top-0.5 left-0.5 w-4 h-4 text-primary-foreground opacity-0
                        peer-checked:opacity-100 transition-opacity pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              Planning to relocate to destination jurisdiction
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              Critical for structure optimization. If relocating, different tax treatments may apply.
            </p>
          </div>
        </label>
      </div>

      {/* Liquidity Events */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Forcing events (with deadlines)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={liquidityEventInput}
            onChange={(e) => setLiquidityEventInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addLiquidityEvent()}
            placeholder="ABSD remission window Q2 2026, Trust restructuring before US tax year end..."
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg
                       text-foreground placeholder:text-muted-foreground/50
                       focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="button"
            onClick={addLiquidityEvent}
            className="px-3 py-2 bg-muted border border-border rounded-lg
                       text-foreground hover:bg-muted/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {/* Event Tags */}
        {(value?.liquidityEvents?.length || 0) > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {value?.liquidityEvents?.map((event, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10
                           text-amber-700 dark:text-amber-400 text-sm rounded-full"
              >
                {event}
                <button
                  type="button"
                  onClick={() => removeLiquidityEvent(i)}
                  className="hover:text-amber-900 dark:hover:text-amber-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          These create hard constraints on timing.
        </p>
      </div>

      {/* Hard Prohibitions */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          What will you NOT do? (Hard prohibitions)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={prohibitionInput}
            onChange={(e) => setProhibitionInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addProhibition()}
            placeholder="No off-plan purchases, No developer financing above 50%..."
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg
                       text-foreground placeholder:text-muted-foreground/50
                       focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="button"
            onClick={addProhibition}
            className="px-3 py-2 bg-muted border border-border rounded-lg
                       text-foreground hover:bg-muted/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {/* Prohibition Tags */}
        {(value?.prohibitions?.length || 0) > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {value?.prohibitions?.map((p, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/10
                           text-red-700 dark:text-red-400 text-sm rounded-full"
              >
                {p}
                <button
                  type="button"
                  onClick={() => removeProhibition(i)}
                  className="hover:text-red-900 dark:hover:text-red-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Deal Breakers */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Deal breakers (if discovered, walk away)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={dealBreakerInput}
            onChange={(e) => setDealBreakerInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDealBreaker()}
            placeholder="Title disputes, Developer insolvency risk, FATCA reporting failures..."
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg
                       text-foreground placeholder:text-muted-foreground/50
                       focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="button"
            onClick={addDealBreaker}
            className="px-3 py-2 bg-muted border border-border rounded-lg
                       text-foreground hover:bg-muted/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {/* Deal Breaker Tags */}
        {(value?.dealBreakers?.length || 0) > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {value?.dealBreakers?.map((db, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500/10
                           text-orange-700 dark:text-orange-400 text-sm rounded-full"
              >
                {db}
                <button
                  type="button"
                  onClick={() => removeDealBreaker(i)}
                  className="hover:text-orange-900 dark:hover:text-orange-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Current Jurisdictions */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Where does your capital currently sit?
        </label>
        <div className="flex flex-wrap gap-2">
          {JURISDICTIONS.slice(0, 12).map(j => {
            const isSelected = value?.currentJurisdictions?.includes(j);
            return (
              <button
                key={j}
                type="button"
                onClick={() => {
                  const current = value?.currentJurisdictions || [];
                  if (isSelected) {
                    onChange({ currentJurisdictions: current.filter(c => c !== j) });
                  } else {
                    onChange({ currentJurisdictions: [...current, j] });
                  }
                }}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                  ${isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                  }
                `}
              >
                {j}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prohibited Jurisdictions */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Jurisdictions you want to avoid
        </label>
        <input
          type="text"
          value={value?.prohibitedJurisdictions?.join(', ') || ''}
          onChange={(e) => onChange({
            prohibitedJurisdictions: e.target.value
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
          })}
          placeholder="Russia, Belarus, North Korea..."
          className="w-full px-3 py-2 bg-background border border-border rounded-lg
                     text-foreground placeholder:text-muted-foreground/50
                     focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
      </div>
    </div>
  );
}

export default ConstraintsInput;
