// components/assessment/AssessmentResults.tsx
// Main results orchestrator - routes to unlock or upgrade

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AssessmentResults as ResultsType } from '@/lib/hooks/useAssessmentState';
import { HighConfidenceUnlock } from './HighConfidenceUnlock';
import { GamifiedUpgrade } from './GamifiedUpgrade';
import { Download, Home, ArrowRight } from 'lucide-react';
import { isAuthenticated } from '@/lib/secure-api';

interface AssessmentResultsProps {
  results: ResultsType;
  sessionId: string;
  onDownloadPDF: () => void;
  onCreateAccount: () => void;
  onUpgrade: (tier: 'architect' | 'operator' | 'observer') => void;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  results,
  sessionId,
  onDownloadPDF,
  onCreateAccount,
  onUpgrade
}) => {
  const [loading, setLoading] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const isUserAuthenticated = isAuthenticated();
  const confidence = results.classification.confidence;
  const tier = results.classification.tier;

  // ≥98% confidence = free unlock
  const qualifiesForFree = confidence >= 0.98;

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      await onDownloadPDF();
      setPdfDownloaded(true);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      await onCreateAccount();
    } catch (error) {
      setLoading(false);
    }
  };

  const handleUpgrade = async (selectedTier: 'architect' | 'operator' | 'observer') => {
    setLoading(true);
    try {
      await onUpgrade(selectedTier);
    } catch (error) {
      setLoading(false);
    }
  };

  // Existing user - just show results + PDF download
  if (isUserAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-transparent border border-yellow-500/30 rounded-2xl p-8 md:p-12">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                {tier === 'ARCHITECT' ? '🏛️' : tier === 'OPERATOR' ? '⚡' : '👁️'}
              </div>
              <h1 className="text-4xl font-bold text-yellow-500 mb-3">
                {tier}
              </h1>
              <p className="text-gray-400 text-lg">
                Confidence: {Math.round(confidence * 100)}%
              </p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="text-gray-300 text-center leading-relaxed">
                {results.description}
              </p>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-black/40 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-500 mb-1">Architect</div>
                <div className="text-2xl font-bold text-yellow-500">
                  {results.classification.scores.architect.toFixed(1)}
                </div>
              </div>
              <div className="bg-black/40 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-500 mb-1">Operator</div>
                <div className="text-2xl font-bold text-blue-500">
                  {results.classification.scores.operator.toFixed(1)}
                </div>
              </div>
              <div className="bg-black/40 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-500 mb-1">Observer</div>
                <div className="text-2xl font-bold text-purple-500">
                  {results.classification.scores.observer.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={handleDownloadPDF}
                disabled={loading || pdfDownloaded}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2
                  ${loading || pdfDownloaded
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-black hover:scale-[1.02]'
                  }
                `}
              >
                <Download size={20} />
                {loading ? 'Downloading...' : pdfDownloaded ? 'PDF Downloaded ✓' : 'Download Strategic Intelligence Brief'}
              </button>

              <a
                href="/dashboard"
                className="w-full py-4 rounded-xl font-bold text-lg border-2 border-yellow-500/30 hover:border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Home size={20} />
                Return to Dashboard
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // New user with ≥98% confidence - free unlock
  if (qualifiesForFree) {
    return (
      <HighConfidenceUnlock
        tier={tier}
        confidence={confidence}
        onCreateAccount={handleCreateAccount}
        loading={loading}
      />
    );
  }

  // New user with <98% confidence - gamified upgrade
  return (
    <GamifiedUpgrade
      tier={tier}
      confidence={confidence}
      onUpgrade={handleUpgrade}
      onDownloadOnly={handleDownloadPDF}
      loading={loading}
    />
  );
};
