// components/decision-memo/memo/MemoCoverPage.tsx
// Ultra-Premium Cover Page — "Money Talking" Design Language
// Breathtaking entry point: Bloomberg Terminal meets Patek Philippe

"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ViaNegativaContext } from '@/lib/decision-memo/memo-types';
import { EASE_OUT_EXPO } from '@/lib/animations/motion-variants';

interface MemoCoverPageProps {
  intakeId: string;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  generatedAt: string;
  exposureClass?: string;
  totalSavings?: string;
  viaNegativa?: ViaNegativaContext;
}

// Choreographed animation presets
const lineWipe = (delay: number, fromLeft = true) => ({
  initial: { scaleX: 0, originX: fromLeft ? 0 : 1 },
  animate: { scaleX: 1 },
  transition: { duration: 0.8, delay, ease: EASE_OUT_EXPO },
});

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: EASE_OUT_EXPO },
});

const scaleFade = (delay: number) => ({
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.8, delay, ease: EASE_OUT_EXPO },
});

export function MemoCoverPage({
  intakeId,
  sourceJurisdiction,
  destinationJurisdiction,
  generatedAt,
  exposureClass,
  totalSavings,
  viaNegativa
}: MemoCoverPageProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const cleanJurisdiction = (jurisdiction?: string) => {
    if (!jurisdiction) return '';
    return jurisdiction
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <motion.div
      className="relative min-h-[100vh] bg-[#0A0A0A] flex-col items-center justify-center overflow-hidden hidden print:flex print:h-[270mm] print:max-h-[270mm] print:min-h-[270mm] print:w-[180mm] print:overflow-hidden print:mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ambient gold glow — prominent on cover */}
      <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.04] via-transparent to-gold/[0.02] pointer-events-none" />

      {/* Top gold accent line — refined wipe */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
        {...lineWipe(0.1)}
      />

      {/* Corner accents — fade in with stagger */}
      {[
        { pos: 'top-10 left-10', h: 'top-0 left-0', v: 'top-0 left-0' },
        { pos: 'top-10 right-10', h: 'top-0 right-0', v: 'top-0 right-0' },
        { pos: 'bottom-10 left-10', h: 'bottom-0 left-0', v: 'bottom-0 left-0' },
        { pos: 'bottom-10 right-10', h: 'bottom-0 right-0', v: 'bottom-0 right-0' },
      ].map((corner, i) => (
        <motion.div
          key={i}
          className={`absolute ${corner.pos} w-16 h-16`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 + i * 0.08, ease: EASE_OUT_EXPO }}
        >
          <div className={`absolute ${corner.h} w-12 h-[1px] bg-gold/20`} />
          <div className={`absolute ${corner.v} w-[1px] h-12 bg-gold/20`} />
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-center px-5 sm:px-16 max-w-4xl">

        {/* Logo — scale fade entrance */}
        <motion.div className="mb-12" {...scaleFade(0.2)}>
          <Image
            src="/logo.png"
            alt="HNWI Chronicles"
            width={120}
            height={120}
            className="mx-auto opacity-80"
            priority
          />
        </motion.div>

        {/* Brand Name — massive, breathtaking */}
        <motion.h1
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight mb-4"
          {...fadeUp(0.35)}
        >
          <span className="text-gold/90">HNWI</span>
          {' '}
          <span className="text-gray-300/80">CHRONICLES</span>
        </motion.h1>

        {/* Division Tag */}
        <motion.p
          className="text-xs text-muted-foreground/60 tracking-[0.4em] uppercase mb-20"
          {...fadeUp(0.45)}
        >
          Private Intelligence Division
        </motion.p>

        {/* Divider — center outward with softened diamond */}
        <motion.div
          className="flex items-center justify-center gap-6 mb-20"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.55, ease: EASE_OUT_EXPO }}
        >
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent to-gold/30" />
          <motion.div
            className="w-1.5 h-1.5 rotate-45 border border-gold/40"
            animate={{ rotate: [45, 225, 45] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <div className="w-24 h-[1px] bg-gradient-to-l from-transparent to-gold/30" />
        </motion.div>

        {/* Report Title */}
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-normal text-white/90 tracking-tight mb-20"
          {...fadeUp(0.6)}
        >
          House-Governed Decision Memo
        </motion.h2>

        {/* Jurisdiction Corridor */}
        {sourceJurisdiction && destinationJurisdiction && (
          <motion.div className="mb-16" {...fadeUp(0.7)}>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10 px-4 sm:px-14 py-8 sm:py-10 rounded-2xl border border-border/20 bg-white/[0.01]">
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60 mb-3">Origin</p>
                <p className="text-xl sm:text-2xl font-normal text-white/90 tracking-tight">
                  {cleanJurisdiction(sourceJurisdiction)}
                </p>
              </div>

              <motion.div
                className="flex items-center gap-2"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-8 sm:w-10 h-[1px] bg-gold/20" />
                <span className="text-gold/70 text-xl font-normal">&#8594;</span>
                <div className="w-8 sm:w-10 h-[1px] bg-gold/20" />
              </motion.div>

              <div className="text-left">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60 mb-3">Destination</p>
                <p className="text-xl sm:text-2xl font-normal text-white/90 tracking-tight">
                  {cleanJurisdiction(destinationJurisdiction)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Key Metrics */}
        {(exposureClass || totalSavings) && (
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-10 mb-20"
            {...fadeUp(0.8)}
          >
            {exposureClass && (
              <motion.div
                className="text-center px-6 sm:px-10 py-8 rounded-2xl border border-border/20 bg-white/[0.01] min-w-0 transition-all duration-500 hover:border-gold/20"
                whileHover={{ y: -2 }}
              >
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60 mb-4">Risk Profile</p>
                <p className="text-xl md:text-2xl font-bold text-gold/80">
                  {exposureClass}
                </p>
              </motion.div>
            )}
            {totalSavings && (
              <motion.div
                className="text-center px-6 sm:px-10 py-8 rounded-2xl border border-border/20 bg-white/[0.01] min-w-0 transition-all duration-500 hover:border-emerald-500/20"
                whileHover={{ y: -2 }}
              >
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60 mb-4">Decision Value</p>
                <p className="text-xl md:text-2xl font-bold text-emerald-500/80">
                  {totalSavings}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Reference & Date — quiet mono */}
        <motion.div className="space-y-2 mb-14" {...fadeUp(0.9)}>
          <p className="text-xs text-muted-foreground/60 tracking-[0.15em]">
            Reference: <span className="text-muted-foreground/35">{intakeId.slice(10, 22).toUpperCase()}</span>
          </p>
          <p className="text-xs text-muted-foreground/60 tracking-[0.1em]">
            {formatDate(generatedAt)}
          </p>
        </motion.div>

        {/* Confidential Badge — subtle, not boxy */}
        <motion.div {...fadeUp(1.0)}>
          <div className="inline-flex items-center gap-3 px-6 py-2.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-gold/50"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(201,162,39,0)',
                  '0 0 6px 2px rgba(201,162,39,0.2)',
                  '0 0 0 0 rgba(201,162,39,0)',
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="text-xs tracking-[0.3em] uppercase font-medium text-gold/70">
              Confidential
            </span>
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-gold/50"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(201,162,39,0)',
                  '0 0 6px 2px rgba(201,162,39,0.2)',
                  '0 0 0 0 rgba(201,162,39,0)',
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1.25 }}
            />
          </div>
        </motion.div>
      </div>

      {/* Via Negativa: watermark overlay */}
      {viaNegativa?.isActive && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
        >
          <div
            className="text-red-500/20 text-[100px] sm:text-[160px] font-normal tracking-[0.2em] uppercase select-none"
            style={{ transform: 'rotate(-12deg)' }}
          >
            {viaNegativa.badgeLabel}
          </div>
        </motion.div>
      )}

      {/* Bottom gold accent line — refined wipe */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
        {...lineWipe(0.3, false)}
      />
    </motion.div>
  );
}

export default MemoCoverPage;
