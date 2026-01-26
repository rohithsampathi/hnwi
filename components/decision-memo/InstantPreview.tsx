// components/decision-memo/InstantPreview.tsx
// Instant preview page showing stress test results

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, DollarSign, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { BlindSpotCard } from './BlindSpotCard';
import { PaymentWall } from './PaymentWall';

interface InstantPreviewProps {
  previewData?: any;
  onPaymentSuccess: () => void;
}

export function InstantPreview({ previewData, onPaymentSuccess }: InstantPreviewProps) {
  const [showOpportunities, setShowOpportunities] = useState(false);

  // Get preview data from sessionStorage if not passed as prop
  const getPreviewData = () => {
    if (previewData) return previewData;

    if (typeof window !== 'undefined') {
      const storedPreview = sessionStorage.getItem('decision_memo_preview');
      if (storedPreview) {
        return JSON.parse(storedPreview);
      }
    }

    return null;
  };

  const preview = getPreviewData();

  // If no preview data, show error
  if (!preview) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Preview Data Not Found</h2>
          <p className="text-muted-foreground">
            Unable to load your stress test results. Please complete the assessment again.
          </p>
        </div>
      </div>
    );
  }

  const exposureColor = {
    HIGH: 'red',
    MEDIUM: 'orange',
    LOW: 'green',
  }[preview.exposure_class];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500 rounded-lg mb-4">
            <span className="text-amber-500 font-semibold text-sm uppercase tracking-wide">
              Stress Test Complete
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            YOUR ALLOCATION STRESS TEST RESULTS
          </h1>
        </motion.div>

        {/* Exposure Class */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`bg-${exposureColor}-500/10 border-2 border-${exposureColor}-500 rounded-xl p-8 mb-8`}
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <div className="text-sm uppercase tracking-wide text-muted-foreground mb-2">
                Exposure Class
              </div>
              <div className={`text-5xl font-bold text-${exposureColor}-500`}>
                {preview.exposure_class}
              </div>
              <div className="text-muted-foreground mt-2 max-w-md">
                {preview.exposure_description}
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm uppercase tracking-wide text-muted-foreground mb-2">
                Coordination Risk Score
              </div>
              <div className={`text-6xl font-bold text-${exposureColor}-500`}>
                {preview.coordination_risk_score}
                <span className="text-3xl text-muted-foreground">/15</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
            <Metric label="Jurisdictions" value={preview.jurisdictions_analyzed} />
            <Metric label="Advisors" value={preview.advisors_involved} />
            <Metric label="Forcing Events" value={preview.forcing_events_count} />
          </div>
        </motion.div>

        {/* Prevented Losses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-green-500/10 border-2 border-green-500 rounded-xl p-8 mb-8 text-center"
        >
          <div className="text-sm uppercase tracking-wide text-muted-foreground mb-2">
            Prevented Losses (Estimated)
          </div>
          <div className="text-5xl font-bold text-green-500 mb-2">
            ${preview.prevented_loss_estimate.toLocaleString()}
          </div>
          <div className="text-muted-foreground">
            Based on {preview.blind_spots.length} blind spots detected
          </div>
        </motion.div>

        {/* Blind Spots Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <span className="text-amber-500 mr-3">⚠️</span>
            CRITICAL BLIND SPOTS
          </h2>

          <div className="space-y-6">
            {preview.blind_spots.map((blindSpot: any) => (
              <BlindSpotCard
                key={blindSpot.number}
                number={blindSpot.number}
                title={blindSpot.title}
                description={blindSpot.description}
                preventedLoss={blindSpot.prevented_loss}
              />
            ))}
          </div>
        </motion.div>

        {/* Next Move */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-green-500/10 border-2 border-green-500 rounded-xl p-8 mb-12"
        >
          <h3 className="text-2xl font-bold mb-4 flex items-center">
            <span className="mr-3">✅</span>
            NEXT MOVE (7-21 days)
          </h3>
          <p className="text-lg leading-relaxed">
            {preview.next_move}
          </p>
        </motion.div>

        {/* Market Context - Collapsible (SUPPLEMENTARY VALUE) */}
        {preview.matched_opportunities && preview.matched_opportunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mb-12"
          >
            <button
              onClick={() => setShowOpportunities(!showOpportunities)}
              className="w-full bg-card border border-border rounded-xl p-6 hover:border-amber-500/30 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">
                      💼 Market Context (Optional)
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {preview.matched_opportunities.length} opportunities matched to your allocation moves
                    </div>
                  </div>
                </div>
                {showOpportunities ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {showOpportunities && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4"
                >
                  <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-muted-foreground">
                    Based on your allocation moves, here's what others in similar situations are considering.
                    <strong className="block mt-2">This is market context, not investment advice.</strong>
                  </div>

                  {preview.matched_opportunities.map((match: any, index: number) => (
                    <div
                      key={index}
                      className="bg-card border border-border rounded-xl p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg mb-1">
                            {match.opportunity.title}
                          </h4>
                          <div className="text-sm text-muted-foreground">
                            {match.opportunity.location} • {match.opportunity.category}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                            Alignment
                          </div>
                          <div className="text-2xl font-bold text-amber-500">
                            {Math.round(match.alignment_score)}%
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        {match.opportunity.analysis?.substring(0, 200)}...
                      </p>

                      <div className="flex gap-2 flex-wrap">
                        {match.matched_preferences && Object.keys(match.matched_preferences).map((key) => (
                          <span
                            key={key}
                            className="px-2 py-1 bg-amber-500/10 text-amber-500 text-xs rounded"
                          >
                            {key.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Value Demonstration Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="border-t border-border pt-8 mb-12"
        >
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">VALUE DEMONSTRATED ✓</div>
            <div className="text-muted-foreground">
              This preview is 10% of your full memo
            </div>
          </div>
        </motion.div>

        {/* Payment Wall */}
        <PaymentWall
          previewId={typeof window !== 'undefined' ? sessionStorage.getItem('decision_memo_preview_id') || '' : ''}
          preventedLoss={preview.prevented_loss_estimate}
          onPaymentSuccess={onPaymentSuccess}
        />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
