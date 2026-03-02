// components/decision-memo/memo/MemoLastPage.tsx
// Closing Page — "Money Talking" Design Language
// Elegant, quiet, confident. Bookend to the Cover Page.

"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ViaNegativaContext } from '@/lib/decision-memo/memo-types';
import { EASE_OUT_EXPO } from '@/lib/animations/motion-variants';

interface MemoLastPageProps {
  intakeId: string;
  precedentCount?: number;
  generatedAt?: string;
  viaNegativa?: ViaNegativaContext;
}

// Choreographed animation presets (mirror of cover page)
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

export function MemoLastPage({
  intakeId,
  precedentCount = 0,
  generatedAt,
  viaNegativa
}: MemoLastPageProps) {
  const currentYear = new Date().getFullYear();

  return (
    <motion.div
      className="relative min-h-[100vh] bg-[#0A0A0A] flex-col items-center justify-center overflow-hidden hidden print:flex print:break-before-page print:h-[277mm] print:max-h-[277mm] print:min-h-[277mm] print:w-[180mm] print:overflow-hidden print:mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ambient gold glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.03] via-transparent to-gold/[0.02] pointer-events-none" />

      {/* Top gold accent line — wipes in from right */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
        {...lineWipe(0.1, false)}
      />

      {/* Corner accents — staggered fade */}
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
          transition={{ duration: 0.8, delay: 0.5 + i * 0.08, ease: EASE_OUT_EXPO }}
        >
          <div className={`absolute ${corner.h} w-12 h-[1px] bg-gold/20`} />
          <div className={`absolute ${corner.v} w-[1px] h-12 bg-gold/20`} />
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-center px-5 sm:px-16 max-w-2xl">

        {/* Logo — scale fade entrance */}
        <motion.div className="mb-8" {...scaleFade(0.2)}>
          <Image
            src="/logo.png"
            alt="HNWI Chronicles"
            width={90}
            height={90}
            className="mx-auto opacity-70"
            priority
          />
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          className="text-3xl sm:text-4xl font-normal tracking-tight mb-3"
          {...fadeUp(0.3)}
        >
          <span className="text-gold/80">HNWI</span>
          {' '}
          <span className="text-gray-300/70">CHRONICLES</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-xs text-muted-foreground/60 tracking-[0.4em] uppercase mb-14"
          {...fadeUp(0.4)}
        >
          Private Intelligence Division
        </motion.p>

        {/* Divider — center outward with rotating diamond */}
        <motion.div
          className="flex items-center justify-center gap-6 mb-14"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE_OUT_EXPO }}
        >
          <div className="w-20 h-[1px] bg-gradient-to-r from-transparent to-gold/25" />
          <motion.div
            className="w-1.5 h-1.5 rotate-45 border border-gold/35"
            animate={{ rotate: [45, 225, 45] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <div className="w-20 h-[1px] bg-gradient-to-l from-transparent to-gold/25" />
        </motion.div>

        {/* End of Document Badge — subtle */}
        <motion.div {...fadeUp(0.55)}>
          <div className="inline-flex items-center gap-3 px-6 py-2.5 mb-10">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-gold/40"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(201,162,39,0)',
                  '0 0 6px 2px rgba(201,162,39,0.15)',
                  '0 0 0 0 rgba(201,162,39,0)',
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="text-xs tracking-[0.3em] uppercase font-medium text-muted-foreground/60">
              End of Document
            </span>
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-gold/40"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(201,162,39,0)',
                  '0 0 6px 2px rgba(201,162,39,0.15)',
                  '0 0 0 0 rgba(201,162,39,0)',
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1.25 }}
            />
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.p
          className="text-sm font-normal text-muted-foreground/60 tracking-wide mb-12"
          {...fadeUp(0.6)}
        >
          &copy; {currentYear} HNWI Chronicles. All Rights Reserved.
        </motion.p>

        {/* Via Negativa: Buy Bridge CTA */}
        {viaNegativa?.isActive && (
          <motion.div
            className="mb-12 relative rounded-2xl border border-gold/20 overflow-hidden px-4 sm:px-10 py-6 sm:py-10"
            {...fadeUp(0.65)}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
            <div className="relative">
              <h3 className="text-xl sm:text-2xl font-normal text-gold/80 tracking-tight text-center mb-4">
                {viaNegativa.ctaHeadline}
              </h3>
              <p className="text-sm text-muted-foreground/60 text-center mb-8 max-w-md mx-auto leading-relaxed font-normal">
                {viaNegativa.ctaBody}
              </p>

              {/* Scarcity */}
              <p className="text-center text-xs tracking-[0.2em] uppercase font-medium text-gold/70 mb-5">
                {viaNegativa.ctaScarcity}
              </p>

              {/* CTA Button */}
              <div className="text-center mb-8">
                <a
                  href={viaNegativa.ctaButtonUrl}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gold/90 text-black font-medium rounded-full tracking-wide text-sm hover:bg-gold transition-colors duration-300"
                >
                  {viaNegativa.ctaButtonText}
                </a>
              </div>

              {/* Context Note */}
              <div className="rounded-xl border border-border/20 bg-white/[0.01] px-5 py-4">
                <p className="text-xs text-muted-foreground/60 leading-relaxed text-center">
                  {viaNegativa.ctaContextNote}
                  Your specific jurisdiction pair receives identical institutional-grade analysis.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Legal Sections */}
        <motion.div className="space-y-6 mb-12" {...fadeUp(0.7)}>
          {/* Confidentiality Notice */}
          <div className="relative rounded-2xl border border-gold/15 overflow-hidden px-4 sm:px-6 py-5 sm:py-6 text-left">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.02] to-transparent pointer-events-none" />
            <h3 className="relative text-xs tracking-[0.25em] uppercase font-medium text-gold/70 mb-3">
              Confidentiality Notice
            </h3>
            <p className="relative text-sm text-muted-foreground/60 leading-relaxed font-normal">
              This Pattern Audit report is confidential and proprietary to HNWI Chronicles.
              Unauthorized distribution, reproduction, or disclosure is strictly prohibited.
            </p>
          </div>

          {/* Two column notices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/20 bg-card/50 px-4 sm:px-5 py-4 sm:py-5 text-left">
              <h3 className="text-xs tracking-[0.2em] uppercase font-medium text-muted-foreground/60 mb-2">
                Intelligence Base
              </h3>
              <p className="text-sm text-muted-foreground/60 leading-relaxed font-normal">
                Powered by {precedentCount.toLocaleString()}+ analyzed HNWI developments and corridor signals.
              </p>
            </div>

            <div className="rounded-xl border border-border/20 bg-card/50 px-4 sm:px-5 py-4 sm:py-5 text-left">
              <h3 className="text-xs tracking-[0.2em] uppercase font-medium text-muted-foreground/60 mb-2">
                Important Notice
              </h3>
              <p className="text-sm text-muted-foreground/60 leading-relaxed font-normal">
                For execution, consult your legal, tax, and financial advisory teams.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Reference */}
        <motion.p
          className="text-xs text-muted-foreground/20 tracking-[0.15em] mb-5"
          {...fadeUp(0.8)}
        >
          Reference: <span className="text-muted-foreground/60">{intakeId.slice(10, 22).toUpperCase()}</span>
        </motion.p>

        {/* Website */}
        <motion.p
          className="text-sm font-normal text-gold/70 tracking-wider"
          {...fadeUp(0.85)}
        >
          app.hnwichronicles.com
        </motion.p>
      </div>

      {/* Bottom gold accent line — wipes in from left */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
        {...lineWipe(0.3)}
      />
    </motion.div>
  );
}

export default MemoLastPage;
