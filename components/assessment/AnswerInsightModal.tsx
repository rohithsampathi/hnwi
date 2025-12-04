// components/assessment/AnswerInsightModal.tsx
// Vault door reveal with matched DEVIDs

"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Award } from 'lucide-react';

interface MatchingBrief {
  devid: string;
  title: string;
  brief_number: number;
}

interface AnswerInsightModalProps {
  insight: string;
  matchingBriefs: MatchingBrief[];
  onContinue: () => void;
}

export const AnswerInsightModal: React.FC<AnswerInsightModalProps> = ({
  insight,
  matchingBriefs,
  onContinue
}) => {
  const [autoCloseTimer, setAutoCloseTimer] = useState(5);

  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setInterval(() => {
      setAutoCloseTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onContinue]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
        onClick={onContinue}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="max-w-3xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-black border-2 border-yellow-500/30 rounded-lg overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-transparent p-6 border-b border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp size={24} className="text-yellow-500" />
                  <div>
                    <div className="text-sm font-mono text-gray-400">STRATEGIC INSIGHT</div>
                    <div className="text-xl font-bold text-white">
                      Answer Recorded
                    </div>
                  </div>
                </div>

                <button
                  onClick={onContinue}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Insight */}
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-yellow-500"></div>
                  <h3 className="text-sm font-mono text-gray-400">YOUR ANSWER REVEALS</h3>
                </div>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {insight}
                </p>
              </div>

              {/* Matched DEVIDs */}
              {matchingBriefs && matchingBriefs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Award size={16} className="text-yellow-500" />
                    <h3 className="text-sm font-mono text-gray-400">
                      MATCHED HNWI WORLD PATTERNS
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {matchingBriefs.slice(0, 3).map((brief, index) => (
                      <motion.div
                        key={brief.devid}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (index * 0.1) }}
                        className="flex items-center gap-3 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded"
                      >
                        <div className="flex-shrink-0 text-xs font-mono text-gray-500">
                          [{brief.devid}]
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-300 truncate">{brief.title}</div>
                        </div>
                        <div className="flex-shrink-0 text-xs text-gray-500">
                          Brief #{brief.brief_number}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Continue button */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <div className="text-xs text-gray-500">
                  Auto-continuing in {autoCloseTimer}s
                </div>
                <button
                  onClick={onContinue}
                  className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded transition-all"
                >
                  CONTINUE →
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
