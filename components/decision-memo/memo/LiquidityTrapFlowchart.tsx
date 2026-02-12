// components/decision-memo/memo/LiquidityTrapFlowchart.tsx
// "The Liquidity Prison" — Visual flowchart showing capital trapped by barriers
// Converts abstract risk into a physical system diagram that eats cash

"use client";

import { motion } from 'framer-motion';
import { Lock, ArrowDown, AlertTriangle } from 'lucide-react';

interface LiquidityTrapProps {
  /** Capital deployed (e.g. $2.27M) */
  capitalIn: number;
  /** Recoverable capital after barriers */
  capitalOut: number;
  /** Primary barrier label (e.g. "ABSD 60%") */
  primaryBarrier: string;
  /** Primary barrier cost */
  primaryBarrierCost: number;
  /** Secondary barrier label (e.g. "US Tax Drag") */
  secondaryBarrier?: string;
  /** Secondary barrier cost */
  secondaryBarrierCost?: number;
  /** Day-one loss percentage (stamp duty as % of property value) */
  dayOneLossPct: number;
  /** Stamp duty methodology note (e.g. "BSD as % of property value — IRAS tiered rates (1–6%)") */
  dayOneLossNote?: string;
  /** Property/asset label */
  assetLabel?: string;
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export function LiquidityTrapFlowchart({
  capitalIn,
  capitalOut,
  primaryBarrier,
  primaryBarrierCost,
  secondaryBarrier,
  secondaryBarrierCost,
  dayOneLossPct,
  dayOneLossNote,
  assetLabel = 'Singapore Residential Property',
}: LiquidityTrapProps) {
  const totalLoss = capitalIn - capitalOut;
  // Use API-provided BSD % of property value (IRAS tiered), not stamp/total-acq
  const lossPct = dayOneLossPct > 0 ? dayOneLossPct : ((totalLoss / capitalIn) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center flex-shrink-0">
          <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            The Liquidity Prison
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Capital Flow Analysis: Where Your Money Gets Trapped
          </p>
        </div>
      </motion.div>

      {/* Flowchart */}
      <motion.div
        className="bg-card border border-border rounded-2xl p-6 sm:p-8 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="max-w-sm mx-auto space-y-0">

          {/* ═══ BOX 1: CAPITAL INPUT ═══ */}
          <motion.div
            className="relative bg-primary/5 border-2 border-primary/30 rounded-xl p-4 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1">Capital Deployed</p>
            <p className="text-2xl sm:text-3xl font-bold text-primary font-mono">{formatCurrency(capitalIn)}</p>
          </motion.div>

          {/* ═══ ARROW DOWN ═══ */}
          <motion.div
            className="flex flex-col items-center py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <ArrowDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>

          {/* ═══ ASSET BOX ═══ */}
          <motion.div
            className="relative bg-muted/30 border border-border rounded-xl p-3 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-xs font-medium text-muted-foreground">{assetLabel}</p>
          </motion.div>

          {/* ═══ ARROW DOWN ═══ */}
          <motion.div
            className="flex flex-col items-center py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <ArrowDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>

          {/* ═══ BARRIER WALL (THE RED BAR) ═══ */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
          >
            {/* The red barrier */}
            <div className="bg-destructive/10 border-2 border-destructive/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-destructive">
                  Barrier Zone
                </span>
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>

              {/* Primary Barrier */}
              <div className="flex items-center justify-between px-3 py-2 bg-destructive/5 rounded-lg border border-destructive/20">
                <span className="text-xs font-semibold text-foreground">{primaryBarrier}</span>
                <span className="text-sm font-bold text-destructive font-mono">
                  -{formatCurrency(primaryBarrierCost)}
                </span>
              </div>

              {/* Secondary Barrier */}
              {secondaryBarrier && !!secondaryBarrierCost && secondaryBarrierCost > 0 && (
                <div className="flex items-center justify-between px-3 py-2 bg-destructive/5 rounded-lg border border-destructive/20">
                  <span className="text-xs font-semibold text-foreground">{secondaryBarrier}</span>
                  <span className="text-sm font-bold text-destructive font-mono">
                    -{formatCurrency(secondaryBarrierCost)}
                  </span>
                </div>
              )}

              {/* Total Destroyed */}
              <div className="flex items-center justify-between px-3 py-2 bg-destructive/10 rounded-lg border border-destructive/30">
                <span className="text-xs font-bold text-destructive uppercase tracking-wide">Capital Destroyed</span>
                <span className="text-base font-bold text-destructive font-mono">
                  -{formatCurrency(totalLoss)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* ═══ ARROW DOWN ═══ */}
          <motion.div
            className="flex flex-col items-center py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <ArrowDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>

          {/* ═══ BOX 2: RECOVERABLE OUTPUT ═══ */}
          <motion.div
            className="relative bg-muted/20 border-2 border-muted rounded-xl p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Recoverable Capital</p>
            <p className="text-2xl sm:text-3xl font-bold text-muted-foreground font-mono">{formatCurrency(capitalOut)}</p>
            <p className="text-xs text-destructive font-semibold mt-1">
              {lossPct.toFixed(2)}% trapped on Day One
            </p>
            {dayOneLossNote && (
              <p className="text-[9px] text-muted-foreground mt-0.5">
                {dayOneLossNote}
              </p>
            )}
          </motion.div>
        </div>

        {/* Bottom label */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-destructive/60">
            Immediate Equity Destruction Upon Acquisition
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default LiquidityTrapFlowchart;
