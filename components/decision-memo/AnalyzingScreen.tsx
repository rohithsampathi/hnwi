// components/decision-memo/AnalyzingScreen.tsx
// Analyzing screen during stress test processing

"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Globe, Brain, TrendingUp, Shield, Zap } from 'lucide-react';

const ANALYSIS_STEPS = [
  { id: 'dependencies', label: 'Mapping coordination dependencies...', icon: Activity },
  { id: 'liquidity', label: 'Detecting liquidity mismatches...', icon: TrendingUp },
  { id: 'cascade', label: 'Calculating cascade exposure...', icon: Zap },
  { id: 'precedents', label: 'Cross-referencing 1,875 precedents...', icon: Globe },
  { id: 'opportunities', label: 'Matching opportunities to your profile...', icon: Brain },
  { id: 'losses', label: 'Quantifying prevented losses...', icon: Shield },
];

export function AnalyzingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 500);

    return () => clearInterval(stepInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-3xl w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header Card */}
          <div className="bg-card rounded-2xl shadow-2xl border border-border mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <Zap className="w-8 h-8" />
                    ANALYZING YOUR ALLOCATION
                  </h1>
                  <p className="text-primary-foreground/90">
                    Processing against 1,875 developments + 159 failure modes
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-mono font-bold">
                    {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-primary-foreground/80">Elapsed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Spinner */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <motion.div
                className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </div>

          {/* Analysis Steps */}
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Processing Pipeline
            </h2>

            <div className="space-y-3">
              {ANALYSIS_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isComplete = index < currentStep;
                const isActive = index === currentStep;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    {isComplete ? (
                      <span className="text-primary text-xl">✓</span>
                    ) : isActive ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="text-xl"
                      >
                        ⟳
                      </motion.span>
                    ) : (
                      <span className="text-muted-foreground text-xl">○</span>
                    )}
                    <Icon className={`w-5 h-5 ${isComplete || isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={isComplete || isActive ? 'text-foreground' : 'text-muted-foreground'}>
                      {step.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Live Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <MetricCard label="Developments" value={Math.min(1875, Math.floor(elapsedTime * 312))} />
            <MetricCard label="Patterns" value={Math.min(159, Math.floor(elapsedTime * 26))} />
            <MetricCard label="Links" value={Math.min(414127, Math.floor(elapsedTime * 69021))} suffix="+" />
          </div>

        </motion.div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="bg-card rounded-xl p-4 border border-border text-center"
    >
      <motion.div
        className="text-2xl font-bold text-primary"
        key={value}
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {value.toLocaleString()}{suffix}
      </motion.div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </motion.div>
  );
}
