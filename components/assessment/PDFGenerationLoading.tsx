// components/assessment/PDFGenerationLoading.tsx
// Spectacular 8-satellite intelligence gathering theater

"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Satellite } from 'lucide-react';
import { usePDFPolling } from '@/lib/hooks/usePDFPolling';

interface PDFGenerationLoadingProps {
  sessionId: string;
  onComplete: () => void;
}

const SATELLITES = [
  { name: 'KG v2', id: 'kg_v2' },
  { name: 'MoEv4', id: 'moev4' },
  { name: 'Command Ctr', id: 'command' },
  { name: 'Katherine', id: 'katherine' },
  { name: 'HNWI World', id: 'hnwi' },
  { name: 'Crown Vault', id: 'crown' },
  { name: 'Elite Pulse', id: 'pulse' },
  { name: 'Social Hub', id: 'social' },
];

export const PDFGenerationLoading: React.FC<PDFGenerationLoadingProps> = ({
  sessionId,
  onComplete
}) => {
  const { isPolling, isReady, progress, stage, error } = usePDFPolling(sessionId, true);

  // Call onComplete when ready
  if (isReady) {
    setTimeout(onComplete, 500);
  }

  const getSatelliteProgress = (index: number) => {
    const baseProgress = (progress / 100) * 8;
    if (baseProgress > index + 1) return 100;
    if (baseProgress < index) return 0;
    return Math.round(((baseProgress - index) * 100));
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center p-4">
      {/* Background orbital effect */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            'radial-gradient(circle at 30% 30%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 70%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 70%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 30%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 30%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 max-w-4xl w-full">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-3">
            GENERATING STRATEGIC INTELLIGENCE BRIEF
          </h1>
          <div className="inline-block h-px w-64 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mb-4" />
          <p className="text-gray-400">
            {stage}
          </p>
        </motion.div>

        {/* Satellites */}
        <div className="space-y-3 mb-8">
          {SATELLITES.map((satellite, index) => {
            const satProgress = getSatelliteProgress(index);
            const isActive = satProgress > 0 && satProgress < 100;
            const isComplete = satProgress === 100;

            return (
              <motion.div
                key={satellite.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                {/* Satellite icon */}
                <motion.div
                  animate={isActive ? {
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
                  }}
                  className={`flex-shrink-0 ${
                    isComplete ? 'text-green-500' :
                    isActive ? 'text-yellow-500' :
                    'text-gray-700'
                  }`}
                >
                  <Satellite size={20} />
                </motion.div>

                {/* Name */}
                <div className="flex-shrink-0 w-32 text-sm font-mono text-gray-400">
                  {satellite.name}
                </div>

                {/* Progress bar */}
                <div className="flex-1 h-1.5 bg-gray-900 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      isComplete ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${satProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>

                {/* Status */}
                <div className="flex-shrink-0 w-16 text-xs font-mono text-right">
                  {isComplete ? (
                    <span className="text-green-500">✓</span>
                  ) : isActive ? (
                    <span className="text-yellow-500">↻</span>
                  ) : (
                    <span className="text-gray-700">{satProgress}%</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress circle */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative w-32 h-32">
            {/* Background circle */}
            <svg className="absolute inset-0 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="4"
                fill="none"
              />
              {/* Progress circle */}
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                stroke="#D4AF37"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 56}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - progress / 100) }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </svg>

            {/* Percentage */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-yellow-500">{progress}%</span>
            </div>

            {/* Radar sweep */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute top-1/2 left-1/2 w-14 h-0.5 bg-gradient-to-r from-yellow-500 to-transparent origin-left" />
            </motion.div>
          </div>
        </div>

        {/* Intelligence counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">DEVIDs</div>
            <div className="text-2xl font-bold text-yellow-500">
              <motion.span
                key={Math.floor(progress * 15.62)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {Math.floor(progress * 15.62)}/1,562
              </motion.span>
            </div>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">Patterns</div>
            <div className="text-2xl font-bold text-yellow-500">
              <motion.span
                key={Math.floor(progress * 0.87)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {Math.floor(progress * 0.87)}
              </motion.span>
            </div>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">Blind Spots</div>
            <div className="text-2xl font-bold text-yellow-500">
              <motion.span
                key={Math.floor(progress * 0.12)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {Math.floor(progress * 0.12)}
              </motion.span>
            </div>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">Insights</div>
            <div className="text-2xl font-bold text-yellow-500">
              <motion.span
                key={Math.floor(progress * 0.23)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {Math.floor(progress * 0.23)}
              </motion.span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="text-center text-sm text-gray-500">
          <p>This process cannot be rushed.</p>
          <p>Your report is built from live intelligence, not cached templates.</p>
        </div>
      </div>
    </div>
  );
};
