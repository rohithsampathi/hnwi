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
  { text: 'Verifying credentials', duration: 2000 },
  { text: 'Accessing intelligence vault', duration: 2400 },
  { text: 'Loading pattern library', duration: 2200 },
  { text: 'Calibrating opportunity scanner', duration: 2000 },
  { text: 'Initializing', duration: 1400 },
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
          const linear = Math.min(elapsed / stepDuration, 1);
          // Ease-out curve: fast start, gentle deceleration
          const eased = 1 - Math.pow(1 - linear, 2.5);
          const stepProgress = eased * 100;
          const totalProgress = ((stepIndex * 100) + stepProgress) / loadingSteps.length;
          setProgress(totalProgress);

          if (stepProgress >= 100) {
            clearInterval(interval);
            if (stepIndex < loadingSteps.length - 1) {
              setCurrentStep(stepIndex + 1);
              const timeout = setTimeout(() => {
                if (isMounted) runStep(stepIndex + 1);
              }, 300);
              timeouts.push(timeout);
            } else {
              const unlockTimeout = setTimeout(() => {
                if (isMounted) setIsUnlocking(true);
              }, 500);
              timeouts.push(unlockTimeout);

              const completeTimeout = setTimeout(() => {
                if (isMounted) {
                  setIsComplete(true);
                  const finalTimeout = setTimeout(() => {
                    if (isMounted) onCompleteRef.current();
                  }, 800);
                  timeouts.push(finalTimeout);
                }
              }, 2000);
              timeouts.push(completeTimeout);
            }
          }
        }, 16);

        intervals.push(interval);
      };

      runStep(0);
    }, 400);

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
          transition={{ duration: 1, ease: "easeInOut" }}
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

          {/* Vault Loader */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Monogram Seal */}
            <motion.div
              className="relative mb-2"
              style={{ width: 140, height: 140 }}
              animate={isUnlocking ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.6 }}
            >
              {/* Solid circular backdrop — only behind inner circle, blocks map */}
              <div
                style={{
                  position: 'absolute',
                  left: 22, top: 22,
                  width: 96, height: 96,
                  borderRadius: '50%',
                  background: 'hsl(var(--background))',
                }}
              />

              {/* White circle — bounded to inner progress arc only */}
              <motion.div
                className="flex items-center justify-center"
                style={{
                  position: 'absolute',
                  left: 22, top: 22,
                  width: 96, height: 96,
                  borderRadius: '50%',
                  background: 'white',
                  boxShadow: '0 4px 30px hsl(var(--primary) / 0.1), inset 0 1px 0 hsl(var(--primary) / 0.1)',
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
                {/* HC Monogram — original font */}
                <motion.span
                  className="text-2xl font-bold tracking-[0.2em] text-zinc-900"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  animate={isUnlocking ? { scale: [1, 1.05, 1] } : {}}
                >
                  HC
                </motion.span>
              </motion.div>

              {/* Outer orbit ring + traveling dot */}
              <motion.div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                {/* The orbiting dot — positioned at top-center of the ring path */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 10,
                    width: 8,
                    height: 8,
                    marginLeft: -4,
                    borderRadius: '50%',
                    background: 'hsl(var(--primary))',
                    boxShadow: '0 0 8px 2px hsl(var(--primary) / 0.5)',
                  }}
                />
              </motion.div>

              {/* Static thin orbit track */}
              <div
                style={{
                  position: 'absolute',
                  left: 12, top: 12,
                  width: 116, height: 116,
                  borderRadius: '50%',
                  border: '1px solid hsl(var(--primary) / 0.1)',
                  pointerEvents: 'none',
                }}
              />

              {/* SVG — progress on inner circle */}
              <svg
                style={{ position: 'absolute', inset: 0 }}
                width="140"
                height="140"
                viewBox="0 0 140 140"
              >
                {/* Inner progress track */}
                <circle
                  cx="70" cy="70" r="48"
                  fill="none"
                  stroke="hsl(var(--primary) / 0.1)"
                  strokeWidth="2"
                />

                {/* Inner progress arc */}
                <motion.circle
                  cx="70" cy="70" r="48"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={301.6}
                  strokeDashoffset={301.6 - (301.6 * progress) / 100}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                  transition={{ duration: 0.1 }}
                />
              </svg>
            </motion.div>

            {/* Status Text */}
            <div className="text-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={isUnlocking ? 'unlocked' : currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
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
                      style={{ width: 4, height: 4, borderRadius: '50%', background: 'hsl(var(--primary) / 0.6)' }}
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

              {/* Brief count */}
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

            {/* Unlocking animation */}
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

          {/* Corner accents */}
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

          {/* Bottom security note */}
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
