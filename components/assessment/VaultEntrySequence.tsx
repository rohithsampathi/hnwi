// =============================================================================
// VAULT ENTRY SEQUENCE
// GenZ + Old Money aesthetic - Minimal luxury meets modern fintech
// =============================================================================

"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with map libraries
const InteractiveWorldMap = dynamic(
  () => import('../interactive-world-map').then(mod => mod.InteractiveWorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading map...</div>
      </div>
    )
  }
);

interface VaultEntrySequenceProps {
  onComplete: () => void;
  briefCount?: number;
  opportunities?: any[];
}

const loadingSteps = [
  { text: 'Verifying credentials', duration: 1200 },
  { text: 'Accessing intelligence vault', duration: 1400 },
  { text: 'Loading pattern library', duration: 1300 },
  { text: 'Calibrating opportunity scanner', duration: 1200 },
  { text: 'Initializing', duration: 800 },
];

// Module-level flag - prevents animation restart on remounts
let vaultSequenceHasRun = false;

export const VaultEntrySequence: React.FC<VaultEntrySequenceProps> = ({
  onComplete,
  briefCount = 1875,
  opportunities = []
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const hasStartedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Progress through loading steps
  useEffect(() => {
    if (vaultSequenceHasRun) {
      setIsComplete(true);
      onCompleteRef.current();
      return;
    }

    let isMounted = true;
    const intervals: NodeJS.Timeout[] = [];
    const timeouts: NodeJS.Timeout[] = [];

    const startDelay = setTimeout(() => {
      if (hasStartedRef.current || vaultSequenceHasRun) return;
      hasStartedRef.current = true;
      vaultSequenceHasRun = true;

      const runStep = (stepIndex: number) => {
        if (!isMounted || stepIndex >= loadingSteps.length) return;

        const stepDuration = loadingSteps[stepIndex].duration;
        const startTime = Date.now();

        const interval = setInterval(() => {
          if (!isMounted) {
            clearInterval(interval);
            return;
          }

          const elapsed = Date.now() - startTime;
          const stepProgress = Math.min((elapsed / stepDuration) * 100, 100);
          const totalProgress = ((stepIndex * 100) + stepProgress) / loadingSteps.length;
          setProgress(totalProgress);

          if (stepProgress >= 100) {
            clearInterval(interval);
            if (stepIndex < loadingSteps.length - 1) {
              setCurrentStep(stepIndex + 1);
              const timeout = setTimeout(() => {
                if (isMounted) runStep(stepIndex + 1);
              }, 50);
              timeouts.push(timeout);
            } else {
              const unlockTimeout = setTimeout(() => {
                if (isMounted) setIsUnlocking(true);
              }, 200);
              timeouts.push(unlockTimeout);

              const completeTimeout = setTimeout(() => {
                if (isMounted) {
                  setIsComplete(true);
                  const finalTimeout = setTimeout(() => {
                    if (isMounted) onCompleteRef.current();
                  }, 600);
                  timeouts.push(finalTimeout);
                }
              }, 1200);
              timeouts.push(completeTimeout);
            }
          }
        }, 16);

        intervals.push(interval);
      };

      runStep(0);
    }, 100);

    return () => {
      clearTimeout(startDelay);
      isMounted = false;
      intervals.forEach(clearInterval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] bg-background flex items-center justify-center overflow-hidden"
        >
          {/* World Map Background with Opportunities */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: isUnlocking ? 0.8 : 0.5 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute inset-0">
              <InteractiveWorldMap
                showControls={false}
                cities={opportunities}
              />
            </div>
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/40" />
          </motion.div>

          {/* Minimal Elegant Loader */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Monogram Seal */}
            <motion.div
              className="relative mb-10"
              style={{ width: 120, height: 120 }}
              animate={isUnlocking ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.6 }}
            >
              {/* Outer decorative ring - subtle rotation */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 140,
                  height: 140,
                  left: -10,
                  top: -10,
                  border: '1px solid',
                  borderColor: 'hsl(var(--primary) / 0.15)'
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />

              {/* Main monogram circle - matches progress arc size */}
              <motion.div
                className="relative w-[120px] h-[120px] rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
                  boxShadow: '0 4px 30px hsl(var(--primary) / 0.1), inset 0 1px 0 hsl(var(--primary) / 0.1)'
                }}
                animate={isUnlocking ? {
                  boxShadow: [
                    '0 4px 30px hsl(var(--primary) / 0.1)',
                    '0 4px 60px hsl(var(--primary) / 0.3)',
                    '0 4px 30px hsl(var(--primary) / 0.1)'
                  ]
                } : {}}
                transition={{ duration: 0.8 }}
              >
                {/* Inner decorative border */}
                <div
                  className="absolute rounded-full"
                  style={{
                    inset: 8,
                    border: '1px solid hsl(var(--primary) / 0.2)'
                  }}
                />

                {/* HC Monogram */}
                <motion.span
                  className="text-2xl font-bold tracking-[0.2em] text-foreground"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  animate={isUnlocking ? { scale: [1, 1.05, 1] } : {}}
                >
                  HC
                </motion.span>
              </motion.div>

              {/* Progress arc - wraps exactly around the circle */}
              <svg
                className="absolute inset-0"
                width="120"
                height="120"
              >
                {/* Background track */}
                <circle
                  cx="60"
                  cy="60"
                  r="56"
                  fill="none"
                  stroke="hsl(var(--primary) / 0.1)"
                  strokeWidth="2"
                />
                {/* Progress indicator */}
                <motion.circle
                  cx="60"
                  cy="60"
                  r="56"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={352}
                  strokeDashoffset={352 - (352 * progress) / 100}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                  transition={{ duration: 0.1 }}
                />
              </svg>
            </motion.div>

            {/* Status Text - Minimal Typography */}
            <div className="text-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={isUnlocking ? 'unlocked' : currentStep}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm tracking-[0.3em] uppercase text-foreground/80 font-medium"
                >
                  {isUnlocking ? 'Access Granted' : loadingSteps[currentStep]?.text}
                </motion.p>
              </AnimatePresence>

              {/* Subtle animated dots */}
              {!isUnlocking && (
                <motion.div
                  className="flex justify-center gap-1.5 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 rounded-full bg-primary/60"
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1, 0.8]
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </motion.div>
              )}

              {/* Brief count - appears during loading */}
              {currentStep >= 2 && !isUnlocking && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-muted-foreground mt-6 tracking-wider"
                >
                  {briefCount.toLocaleString()} intelligence briefs loaded
                </motion.p>
              )}
            </div>

            {/* Unlocking animation - elegant fade */}
            {isUnlocking && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-8"
              >
                <div className="flex items-center gap-2 text-primary">
                  <motion.div
                    className="w-5 h-[1px] bg-primary"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                  <span className="text-xs tracking-[0.4em] uppercase">Entering Vault</span>
                  <motion.div
                    className="w-5 h-[1px] bg-primary"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Subtle corner accents - Old Money touch */}
          <div className="absolute top-8 left-8 w-12 h-12 pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-[1px] bg-gradient-to-r from-primary/30 to-transparent" />
            <div className="absolute top-0 left-0 w-[1px] h-8 bg-gradient-to-b from-primary/30 to-transparent" />
          </div>
          <div className="absolute top-8 right-8 w-12 h-12 pointer-events-none">
            <div className="absolute top-0 right-0 w-8 h-[1px] bg-gradient-to-l from-primary/30 to-transparent" />
            <div className="absolute top-0 right-0 w-[1px] h-8 bg-gradient-to-b from-primary/30 to-transparent" />
          </div>
          <div className="absolute bottom-8 left-8 w-12 h-12 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-8 h-[1px] bg-gradient-to-r from-primary/30 to-transparent" />
            <div className="absolute bottom-0 left-0 w-[1px] h-8 bg-gradient-to-t from-primary/30 to-transparent" />
          </div>
          <div className="absolute bottom-8 right-8 w-12 h-12 pointer-events-none">
            <div className="absolute bottom-0 right-0 w-8 h-[1px] bg-gradient-to-l from-primary/30 to-transparent" />
            <div className="absolute bottom-0 right-0 w-[1px] h-8 bg-gradient-to-t from-primary/30 to-transparent" />
          </div>

          {/* Bottom security note - minimal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground/50"
          >
            256-bit encrypted
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
