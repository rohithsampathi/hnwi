// components/decision-memo/StressTestIntro.tsx
// Stress test introduction screen - "This is not a survey"

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Target, TrendingUp, Zap } from 'lucide-react';

interface StressTestIntroProps {
  onStart: () => void;
}

export const StressTestIntro: React.FC<StressTestIntroProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/10 rounded-full border-2 border-amber-500/30 mb-6"
            >
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </motion.div>

            <h1 className="text-5xl font-bold mb-6">
              ALLOCATION STRESS TEST
            </h1>
            <div className="h-1 w-32 bg-amber-500 mx-auto mb-8" />
          </div>

          {/* Main Message */}
          <div className="bg-card border border-border rounded-2xl p-8 mb-8">
            <p className="text-3xl font-bold mb-6 text-center">
              This is not a survey. This is a stress test.
            </p>

            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              In the next 3-5 minutes, you'll answer 10 questions designed to expose
              coordination blind spots that cause six-figure mistakes.
            </p>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
              <p className="text-lg">
                <strong className="text-amber-500">Most HNWIs fail on Q6</strong> (liquidity timeline)
                and <strong className="text-amber-500">Q8</strong> (advisor coordination).
              </p>
              <p className="text-muted-foreground mt-3">
                60% select "730+ days" when they have a forced deadline in 180 days.
              </p>
            </div>
          </div>

          {/* Stress Test Against */}
          <div className="bg-card border border-border rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6">Your allocation will be stress tested against:</h3>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-amber-500 mb-2">1,875</div>
                <div className="text-sm text-muted-foreground">Precedent Developments</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-amber-500 mb-2">159</div>
                <div className="text-sm text-muted-foreground">Failure Mode Patterns</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-amber-500 mb-2">414,127</div>
                <div className="text-sm text-muted-foreground">Pattern Links</div>
              </div>
            </div>
          </div>

          {/* What We'll Detect */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <DetectionCard
              icon={Target}
              title="Timeline Mismatches"
              description="Forced liquidity events that don't align with your asset structure"
            />
            <DetectionCard
              icon={TrendingUp}
              title="Coordination Gaps"
              description="Advisor dependencies that add 7-14 days per decision"
            />
            <DetectionCard
              icon={AlertTriangle}
              title="Regulatory Collisions"
              description="Jurisdiction changes that trigger unexpected tax events"
            />
            <DetectionCard
              icon={Zap}
              title="Sequencing Errors"
              description="Actions taken in wrong order, causing irreversible mistakes"
            />
          </div>

          {/* CTA */}
          <div className="text-center">
            <motion.button
              onClick={onStart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-12 py-6 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xl rounded-xl transition-all shadow-xl shadow-amber-500/20"
            >
              Begin Stress Test →
            </motion.button>
            <p className="text-sm text-muted-foreground mt-4">
              10 questions • 3-5 minutes
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

function DetectionCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-amber-500/30 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-2">{title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
