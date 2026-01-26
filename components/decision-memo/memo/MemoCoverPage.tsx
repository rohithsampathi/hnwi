// components/decision-memo/memo/MemoCoverPage.tsx
// Ultra-Premium PDF Cover Page - SFO Standard (Print Optimized)
// Clean, minimal luxury design optimized for PDF export

"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';

interface MemoCoverPageProps {
  intakeId: string;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  generatedAt: string;
  exposureClass?: string;
  totalSavings?: string;
}

export function MemoCoverPage({
  intakeId,
  sourceJurisdiction,
  destinationJurisdiction,
  generatedAt,
  exposureClass,
  totalSavings
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
      className="relative min-h-[100vh] bg-[#0d0d0d] flex-col items-center justify-center overflow-hidden hidden print:flex print:break-after-page print:h-[277mm] print:max-h-[277mm] print:min-h-[277mm] print:w-[180mm] print:overflow-hidden print:mx-auto"
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
      <div className="relative z-10 text-center px-12 max-w-3xl">

        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="HNWI Chronicles"
            width={140}
            height={140}
            className="mx-auto"
            priority
          />
        </div>

        {/* Brand Name */}
        <h1 className="text-5xl sm:text-6xl font-bold tracking-wider mb-4">
          <span className="text-amber-500">HNWI</span>
          {' '}
          <span className="text-gray-300">CHRONICLES</span>
        </h1>

        {/* Division Tag */}
        <p className="text-sm text-gray-500 tracking-[0.4em] uppercase mb-16">
          Private Intelligence Division
        </p>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <div className="w-20 h-[1px] bg-amber-500/60" />
          <div className="w-2 h-2 rotate-45 border border-amber-500/80" />
          <div className="w-20 h-[1px] bg-amber-500/60" />
        </div>

        {/* Report Title */}
        <h2 className="text-4xl sm:text-5xl font-semibold text-white tracking-wide mb-16">
          SFO Pattern Audit
        </h2>

        {/* Jurisdiction Corridor */}
        {sourceJurisdiction && destinationJurisdiction && (
          <div className="mb-12">
            <div className="inline-flex items-center gap-8 px-12 py-8 border border-amber-500/30 rounded-xl bg-white/[0.02]">
              <div className="text-right">
                <p className="text-[11px] text-gray-500 uppercase tracking-[0.2em] mb-2">Origin</p>
                <p className="text-2xl font-semibold text-white">
                  {cleanJurisdiction(sourceJurisdiction)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-[1px] bg-amber-500/50" />
                <span className="text-amber-500 text-2xl">→</span>
                <div className="w-8 h-[1px] bg-amber-500/50" />
              </div>

              <div className="text-left">
                <p className="text-[11px] text-gray-500 uppercase tracking-[0.2em] mb-2">Destination</p>
                <p className="text-2xl font-semibold text-white">
                  {cleanJurisdiction(destinationJurisdiction)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        {(exposureClass || totalSavings) && (
          <div className="flex justify-center gap-8 mb-16">
            {exposureClass && (
              <div className="text-center px-8 py-6 border border-white/10 rounded-lg bg-white/[0.02] min-w-[180px]">
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-3">Risk Profile</p>
                <p className="text-lg font-semibold text-amber-500">
                  {exposureClass}
                </p>
              </div>
            )}
            {totalSavings && (
              <div className="text-center px-8 py-6 border border-white/10 rounded-lg bg-white/[0.02] min-w-[180px]">
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-3">Value Creation</p>
                <p className="text-lg font-semibold text-emerald-500">
                  {totalSavings}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reference & Date */}
        <div className="space-y-2 mb-10">
          <p className="text-xs text-gray-500 tracking-[0.15em]">
            Reference: <span className="font-mono text-gray-400">{intakeId.slice(10, 22).toUpperCase()}</span>
          </p>
          <p className="text-xs text-gray-500 tracking-[0.1em]">
            {formatDate(generatedAt)}
          </p>
        </div>

        {/* Confidential Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 border border-amber-500/40 rounded-full bg-amber-500/5">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-xs font-semibold text-amber-500 tracking-[0.2em] uppercase">
            Confidential
          </span>
        </div>
      </div>

      {/* Bottom gold accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600" />
    </motion.div>
  );
}

export default MemoCoverPage;
