// components/decision-memo/memo/MemoLastPage.tsx
// Ultra-Premium PDF Last Page - SFO Standard (Print Optimized)
// Clean, minimal luxury design optimized for PDF export

"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ViaNegativaContext } from '@/lib/decision-memo/memo-types';

interface MemoLastPageProps {
  intakeId: string;
  precedentCount?: number;
  generatedAt?: string;
  viaNegativa?: ViaNegativaContext;
}

export function MemoLastPage({
  intakeId,
  precedentCount = 0,
  generatedAt,
  viaNegativa
}: MemoLastPageProps) {
  const currentYear = new Date().getFullYear();

  return (
    <motion.div
      className="relative min-h-[100vh] bg-[#0d0d0d] flex-col items-center justify-center overflow-hidden hidden print:flex print:break-before-page print:h-[277mm] print:max-h-[277mm] print:min-h-[277mm] print:w-[180mm] print:overflow-hidden print:mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Top gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600" />

      {/* Corner accents */}
      <div className="absolute top-8 left-8 w-16 h-16">
        <div className="absolute top-0 left-0 w-12 h-[1px] bg-amber-500/50" />
        <div className="absolute top-0 left-0 w-[1px] h-12 bg-amber-500/50" />
      </div>
      <div className="absolute top-8 right-8 w-16 h-16">
        <div className="absolute top-0 right-0 w-12 h-[1px] bg-amber-500/50" />
        <div className="absolute top-0 right-0 w-[1px] h-12 bg-amber-500/50" />
      </div>
      <div className="absolute bottom-8 left-8 w-16 h-16">
        <div className="absolute bottom-0 left-0 w-12 h-[1px] bg-amber-500/50" />
        <div className="absolute bottom-0 left-0 w-[1px] h-12 bg-amber-500/50" />
      </div>
      <div className="absolute bottom-8 right-8 w-16 h-16">
        <div className="absolute bottom-0 right-0 w-12 h-[1px] bg-amber-500/50" />
        <div className="absolute bottom-0 right-0 w-[1px] h-12 bg-amber-500/50" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-12 max-w-2xl">

        {/* Logo */}
        <div className="mb-6">
          <Image
            src="/logo.png"
            alt="HNWI Chronicles"
            width={100}
            height={100}
            className="mx-auto"
            priority
          />
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-bold tracking-wider mb-3">
          <span className="text-amber-500">HNWI</span>
          {' '}
          <span className="text-gray-300">CHRONICLES</span>
        </h1>

        {/* Tagline */}
        <p className="text-sm text-gray-500 tracking-[0.3em] uppercase mb-10">
          Private Intelligence Division
        </p>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="w-16 h-[1px] bg-amber-500/60" />
          <div className="w-2 h-2 rotate-45 border border-amber-500/80" />
          <div className="w-16 h-[1px] bg-amber-500/60" />
        </div>

        {/* Copyright */}
        <p className="text-sm font-medium text-gray-400 tracking-wide mb-12">
          © {currentYear} HNWI Chronicles. All Rights Reserved.
        </p>

        {/* Via Negativa: Buy Bridge CTA */}
        {viaNegativa?.isActive && (
          <div className="mb-10 p-6 sm:p-8 border-2 border-amber-500/40 rounded-xl bg-amber-500/[0.03]">
            <h3 className="text-xl sm:text-2xl font-bold text-amber-500 tracking-wide text-center mb-3">
              {viaNegativa.ctaHeadline}
            </h3>
            <p className="text-xs text-gray-400 text-center mb-6 max-w-md mx-auto leading-relaxed">
              {viaNegativa.ctaBody}
            </p>

            {/* Scarcity */}
            <p className="text-center text-[11px] font-semibold text-amber-500/80 tracking-wider uppercase mb-4">
              {viaNegativa.ctaScarcity}
            </p>

            {/* CTA Button */}
            <div className="text-center mb-6">
              <a
                href={viaNegativa.ctaButtonUrl}
                className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 text-black font-bold rounded-lg tracking-wide text-sm hover:bg-amber-400 transition-colors"
              >
                {viaNegativa.ctaButtonText}
              </a>
            </div>

            {/* Context Note */}
            <div className="p-4 border border-white/10 rounded-lg bg-white/[0.02]">
              <p className="text-[10px] text-gray-500 leading-relaxed text-center">
                {viaNegativa.ctaContextNote}
                Your specific jurisdiction pair receives identical institutional-grade analysis.
              </p>
            </div>
          </div>
        )}

        {/* Legal Sections */}
        <div className="space-y-6 mb-12">
          {/* Confidentiality Notice */}
          <div className="p-6 border border-amber-500/20 rounded-lg bg-white/[0.02]">
            <h3 className="text-[11px] font-bold text-amber-500 uppercase tracking-[0.2em] mb-3">
              Confidentiality Notice
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              This Pattern Audit report is confidential and proprietary to HNWI Chronicles.
              Unauthorized distribution, reproduction, or disclosure is strictly prohibited.
            </p>
          </div>

          {/* Two column notices */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 border border-white/10 rounded-lg bg-white/[0.02]">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
                Intelligence Base
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Powered by {precedentCount.toLocaleString()}+ analyzed HNWI developments and regulatory precedents.
              </p>
            </div>

            <div className="p-5 border border-white/10 rounded-lg bg-white/[0.02]">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
                Important Notice
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                For execution, consult your legal, tax, and financial advisory teams.
              </p>
            </div>
          </div>
        </div>

        {/* Reference */}
        <p className="text-xs text-gray-500 tracking-[0.15em] mb-4">
          Reference: <span className="font-mono text-gray-400">{intakeId.slice(10, 22).toUpperCase()}</span>
        </p>

        {/* Website */}
        <p className="text-sm font-semibold text-amber-500 tracking-wide">
          app.hnwichronicles.com
        </p>
      </div>

      {/* Bottom gold accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600" />
    </motion.div>
  );
}

export default MemoLastPage;
