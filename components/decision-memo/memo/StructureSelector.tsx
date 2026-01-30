"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, AlertTriangle, Sparkles } from 'lucide-react';

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
    <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
      {/* Top accent */}
      <div className="h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

      <div className="p-4 sm:p-5">
        {/* Header row with dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Projection Vehicle
            </span>
          </div>

          <select
            value={selectedStructureName}
            onChange={(e) => onSelect(e.target.value)}
            className="flex-1 px-3 py-2.5 bg-muted/30 border border-border rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
          >
            {structures.map((structure) => {
              const isOpt = structure.name === optimalStructureName;
              return (
                <option key={structure.name} value={structure.name}>
                  {structure.name} {isOpt ? '★' : ''} ({formatBenefit(structure.net_benefit_10yr)})
                </option>
              );
            })}
          </select>
        </div>

        {/* Selected structure context */}
        {selectedStructure && (
          <motion.div
            key={selectedStructureName}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Badge row */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {isOptimal && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/20">
                  <Sparkles className="w-3 h-3" />
                  RECOMMENDED
                </span>
              )}
              {!isViable && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold rounded-full border border-red-500/20">
                  <AlertTriangle className="w-3 h-3" />
                  NOT VIABLE
                </span>
              )}
              <span className={`text-xs font-bold font-mono ${benefitPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                {formatBenefit(selectedStructure.net_benefit_10yr)} 10yr
              </span>
              <span className="text-[10px] text-muted-foreground">•</span>
              <span className="text-[10px] text-muted-foreground">{selectedStructure.type.replace(/_/g, ' ')}</span>
            </div>

            {/* Tax rates grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="bg-muted/30 rounded-lg p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Rental Tax</p>
                <p className="text-sm font-bold text-foreground font-mono">{(selectedStructure.rental_income_rate ?? 0).toFixed(1)}%</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">CGT</p>
                <p className="text-sm font-bold text-foreground font-mono">{(selectedStructure.capital_gains_rate ?? 0).toFixed(1)}%</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Estate</p>
                <p className="text-sm font-bold text-foreground font-mono">{(selectedStructure.estate_tax_rate ?? 0).toFixed(1)}%</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Setup</p>
                <p className="text-sm font-bold text-foreground font-mono">{formatCurrency(selectedStructure.setup_cost ?? 0)}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Annual</p>
                <p className="text-sm font-bold text-foreground font-mono">{formatCurrency(selectedStructure.annual_cost ?? 0)}</p>
              </div>
            </div>

            {/* Warning (top 1) */}
            {selectedStructure.warnings && selectedStructure.warnings.length > 0 && (
              <div className="mt-3 flex items-start gap-2 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">{selectedStructure.warnings[0]}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StructureSelector;
