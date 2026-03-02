"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronDown, Sparkles } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/animations/motion-variants';

interface Structure {
  name: string;
  type: string;
  net_benefit_10yr: number;
  tax_savings_pct: number;
  viable: boolean;
  verdict: string;
  warnings: string[];
  setup_cost?: number;
  annual_cost?: number;
  rental_income_rate?: number;
  capital_gains_rate?: number;
  estate_tax_rate?: number;
}

interface StructureSelectorProps {
  structures: Structure[];
  selectedStructureName: string;
  optimalStructureName?: string;
  onSelect: (structureName: string) => void;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatBenefit(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs >= 1000000
    ? `$${(abs / 1000000).toFixed(2)}M`
    : abs >= 1000
    ? `$${(abs / 1000).toFixed(0)}K`
    : `$${abs.toFixed(0)}`;
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

export const StructureSelector: React.FC<StructureSelectorProps> = ({
  structures,
  selectedStructureName,
  optimalStructureName,
  onSelect
}) => {
  const selectedStructure = structures.find(s => s.name === selectedStructureName);
  const isOptimal = selectedStructureName === optimalStructureName;
  const isViable = selectedStructure?.viable ?? false;
  const benefitPositive = (selectedStructure?.net_benefit_10yr ?? 0) >= 0;

  return (
    <div className="relative rounded-2xl border border-border/30 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

      <div className="relative px-5 sm:px-8 md:px-12 py-10 md:py-12">
        {/* Header row with dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <span className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium flex-shrink-0">
            Projection Vehicle
          </span>

          <div className="relative flex-1">
            <select
              value={selectedStructureName}
              onChange={(e) => onSelect(e.target.value)}
              className="w-full appearance-none px-4 pr-10 py-3 min-h-[44px] bg-surface border border-border rounded-xl text-sm font-medium text-foreground hover:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all cursor-pointer"
            >
              {structures.map((structure) => {
                const isOpt = structure.name === optimalStructureName;
                return (
                  <option key={structure.name} value={structure.name}>
                    {structure.name} {isOpt ? '*' : ''} ({formatBenefit(structure.net_benefit_10yr)})
                  </option>
                );
              })}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Gold accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-6" />

        {/* Selected structure context */}
        {selectedStructure && (
          <motion.div
            key={selectedStructureName}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          >
            {/* Badge row */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              {isOptimal && (
                <span className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-gold/20 text-gold/80 inline-flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  RECOMMENDED
                </span>
              )}
              {!isViable && (
                <span className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-red-500/20 text-red-500/80 inline-flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" />
                  NOT VIABLE
                </span>
              )}
              <span className={`text-base font-medium tabular-nums ${benefitPositive ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
                {formatBenefit(selectedStructure.net_benefit_10yr)} 10yr
              </span>
              <span className="text-muted-foreground/20">&middot;</span>
              <span className="text-xs text-muted-foreground/60 font-normal">{selectedStructure.type.replace(/_/g, ' ')}</span>
            </div>

            {/* Tax rates grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Rental Tax', value: `${(selectedStructure.rental_income_rate ?? 0).toFixed(1)}%` },
                { label: 'CGT', value: `${(selectedStructure.capital_gains_rate ?? 0).toFixed(1)}%` },
                { label: 'Estate', value: `${(selectedStructure.estate_tax_rate ?? 0).toFixed(1)}%` },
                { label: 'Setup', value: formatCurrency(selectedStructure.setup_cost ?? 0) },
                { label: 'Annual', value: formatCurrency(selectedStructure.annual_cost ?? 0) },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border/20 bg-card/50 p-3 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">{item.label}</p>
                  <p className="text-base font-medium tabular-nums text-foreground">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Warning (top 1) */}
            {selectedStructure.warnings && selectedStructure.warnings.length > 0 && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-gold/15 bg-gold/[0.02] px-4 py-3">
                <AlertTriangle className="w-3.5 h-3.5 text-gold/70 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground/60 font-normal">{selectedStructure.warnings[0]}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StructureSelector;
