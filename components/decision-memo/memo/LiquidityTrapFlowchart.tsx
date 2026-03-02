// components/decision-memo/memo/LiquidityTrapFlowchart.tsx
// "The Liquidity Prison" — Visual flowchart showing capital trapped by barriers
// Converts abstract risk into a physical system diagram that eats cash

"use client";

import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/animations/motion-variants';

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
    <div className="space-y-8 sm:space-y-12">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
      >
        <h3 className="text-2xl font-semibold text-foreground tracking-tight mb-3">
          The Liquidity Prison
        </h3>
        <div className="h-px bg-border" />
      </motion.div>

      {/* Flowchart */}
      <motion.div
        className="relative rounded-2xl border border-border/30 overflow-hidden px-5 sm:px-8 md:px-12 py-10 md:py-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT_EXPO }}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

        <div className="relative max-w-sm mx-auto space-y-0">

          {/* BOX 1: CAPITAL INPUT */}
          <motion.div
            className="relative rounded-xl border border-emerald-500/20 bg-card/50 p-5 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: EASE_OUT_EXPO }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Capital Deployed</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums tracking-tight text-emerald-500">{formatCurrency(capitalIn)}</p>
          </motion.div>

          {/* ARROW DOWN */}
          <motion.div
            className="flex flex-col items-center py-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7, ease: EASE_OUT_EXPO }}
          >
            <ArrowDown className="w-4 h-4 text-muted-foreground/60" />
          </motion.div>

          {/* ASSET BOX */}
          <motion.div
            className="relative rounded-xl border border-border/20 bg-card/50 p-3 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7, ease: EASE_OUT_EXPO }}
          >
            <p className="text-xs font-normal text-muted-foreground/60">{assetLabel}</p>
          </motion.div>

          {/* ARROW DOWN */}
          <motion.div
            className="flex flex-col items-center py-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.7, ease: EASE_OUT_EXPO }}
          >
            <ArrowDown className="w-4 h-4 text-muted-foreground/60" />
          </motion.div>

          {/* BARRIER WALL */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.7, ease: EASE_OUT_EXPO }}
          >
            <div className="rounded-xl border border-destructive/20 bg-card/50 p-5 space-y-3">
              {/* Gold accent line */}
              <div className="h-px bg-gradient-to-r from-transparent via-destructive/30 to-transparent mb-4" />

              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs tracking-[0.25em] uppercase font-medium text-destructive/80">
                  Barrier Zone
                </span>
              </div>

              {/* Primary Barrier */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-destructive/15 bg-destructive/[0.03]">
                <span className="text-xs font-normal text-foreground">{primaryBarrier}</span>
                <span className="text-base font-medium tabular-nums text-destructive">
                  -{formatCurrency(primaryBarrierCost)}
                </span>
              </div>

              {/* Secondary Barrier */}
              {secondaryBarrier && !!secondaryBarrierCost && secondaryBarrierCost > 0 && (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-destructive/15 bg-destructive/[0.03]">
                  <span className="text-xs font-normal text-foreground">{secondaryBarrier}</span>
                  <span className="text-base font-medium tabular-nums text-destructive">
                    -{formatCurrency(secondaryBarrierCost)}
                  </span>
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent" />

              {/* Total Destroyed */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-destructive/25 bg-destructive/[0.05]">
                <span className="text-xs tracking-[0.15em] uppercase font-medium text-destructive/80">Capital Destroyed</span>
                <span className="text-xl md:text-2xl font-medium text-destructive">
                  -{formatCurrency(totalLoss)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* ARROW DOWN */}
          <motion.div
            className="flex flex-col items-center py-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.7, ease: EASE_OUT_EXPO }}
          >
            <ArrowDown className="w-4 h-4 text-muted-foreground/60" />
          </motion.div>

          {/* BOX 2: RECOVERABLE OUTPUT */}
          <motion.div
            className="relative rounded-xl border border-border/20 bg-card/50 p-5 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.7, ease: EASE_OUT_EXPO }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Recoverable Capital</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums tracking-tight text-muted-foreground">{formatCurrency(capitalOut)}</p>
            <p className="text-xs text-destructive/70 font-normal mt-2">
              {lossPct.toFixed(2)}% trapped on Day One
            </p>
            {dayOneLossNote && (
              <p className="text-xs text-muted-foreground/60 mt-1 leading-relaxed">
                {dayOneLossNote}
              </p>
            )}
          </motion.div>
        </div>

        {/* Bottom label */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.7, ease: EASE_OUT_EXPO }}
        >
          <p className="text-xs uppercase tracking-[0.25em] text-destructive/60 font-medium">
            Immediate Equity Destruction Upon Acquisition
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default LiquidityTrapFlowchart;
