// components/assessment/VaultEntrySequence.tsx
// Crown Vault entry animation - creates immersive theater

"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Shield, Lock, Globe, Zap, Database, Network } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with map libraries (react-globe.gl, leaflet)
const InteractiveWorldMap = dynamic(
  () => import('../interactive-world-map').then(mod => mod.InteractiveWorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
        <div className="text-sm text-muted-foreground">Loading map...</div>
      </div>
    )
  }
);

interface VaultEntrySequenceProps {
  onComplete: () => void;
  briefCount?: number;
  opportunities?: any[]; // Cities/opportunities to show on map
}

const loadingSteps = [
  { icon: Shield, text: 'Verifying access credentials', duration: 1400 },
  { icon: Lock, text: 'Initializing Crown Vault Protocol', duration: 1500 },
  { icon: Database, text: 'Loading intelligence briefs', duration: 1600 },
  { icon: Globe, text: 'Calibrating opportunity DNA scanner', duration: 1500 },
  { icon: Network, text: 'Accessing global wealth network', duration: 1400 },
];

export const VaultEntrySequence: React.FC<VaultEntrySequenceProps> = ({
  onComplete,
  briefCount = 1900,
  opportunities = []
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Debug: log opportunities
  useEffect(() => {
  }, [opportunities]);

  // Subtle sound effects (with user gesture requirement handling)
  const playSound = (type: 'step' | 'unlock') => {
    // Only play sounds if we have user interaction (skip in automated sequences)
    if (typeof window !== 'undefined' && window.AudioContext) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Check if AudioContext is running (requires user gesture)
        if (audioContext.state === 'suspended') {
          // Don't play sound if context is suspended - avoids console warnings
          return;
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'step') {
          // Subtle beep for each step
          oscillator.frequency.value = 800;
          gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        } else {
          // Unlock sound - lower, more satisfying
          oscillator.frequency.value = 400;
          gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        }

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (error) {
        // Silently ignore audio errors (e.g., when AudioContext is not allowed)
        // This prevents console warnings when user hasn't interacted yet
      }
    }
  };

  // Progress through loading steps
  useEffect(() => {
    if (currentStep < loadingSteps.length) {
      const stepDuration = loadingSteps[currentStep].duration;
      const startTime = Date.now();

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const stepProgress = Math.min((elapsed / stepDuration) * 100, 100);
        const totalProgress = ((currentStep * 100) + stepProgress) / loadingSteps.length;
        setProgress(totalProgress);

        if (stepProgress >= 100) {
          clearInterval(interval);
          if (currentStep < loadingSteps.length - 1) {
            playSound('step'); // Play sound on step change
            setCurrentStep(prev => prev + 1);
          } else {
            // Start unlocking sequence
            setTimeout(() => {
              setIsUnlocking(true);
              playSound('unlock'); // Play unlock sound
            }, 300);
            setTimeout(() => {
              setIsComplete(true);
              setTimeout(onComplete, 800);
            }, 1500);
          }
        }
      }, 16); // ~60fps

      return () => clearInterval(interval);
    }
  }, [currentStep, onComplete]);

  const CurrentIcon = loadingSteps[currentStep]?.icon || Shield;

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[9999] bg-background flex items-center justify-center overflow-hidden"
        >
          {/* Assessment Map with Opportunities as background */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: isUnlocking ? 0.9 : 0.6 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute inset-0 opacity-90">
              <InteractiveWorldMap
                showControls={false}
                cities={opportunities}
              />
            </div>
            {/* Lighter overlay to show more opportunities */}
            <div className="absolute inset-0 bg-background/30 backdrop-blur-[1px]" />
          </motion.div>

          {/* Hexagonal tech overlay pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='43.4' viewBox='0 0 50 43.4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0l12.5 7.2v14.4L25 28.8 12.5 21.6V7.2L25 0zm0 43.4l12.5-7.2V21.8L25 14.6l-12.5 7.2v14.4L25 43.4z' fill='none' stroke='hsl(var(--primary))' stroke-opacity='0.1' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '50px 43.4px'
          }} />

          {/* Data streams flowing across screen */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={`stream-${i}`}
              className="absolute w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent"
              style={{
                left: `${i * 20 + 10}%`,
                height: '100%',
              }}
              animate={{
                y: ['-100%', '200%'],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'linear',
              }}
            >
              {/* Data particles on streams */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_4px_hsl(var(--primary))]" />
            </motion.div>
          ))}

          {/* Scanning line effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, hsl(var(--primary) / 0.1) 50%, transparent 100%)',
              height: '200px'
            }}
            animate={{ y: ['0%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Vault door frame */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{
              scale: isUnlocking ? 1.02 : 1,
              opacity: 1
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-full max-w-2xl mx-auto px-4"
          >
            {/* Outer vault frame */}
            <div className="relative">
              {/* Digital corner brackets with animated glow */}
              <motion.div
                className="absolute -top-3 -left-3 w-12 h-12"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-primary to-transparent" />
                <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-primary via-primary to-transparent" />
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary shadow-[0_0_10px_hsl(var(--primary))]" />
              </motion.div>

              <motion.div
                className="absolute -top-3 -right-3 w-12 h-12"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <div className="absolute top-0 right-0 w-full h-0.5 bg-gradient-to-l from-primary via-primary to-transparent" />
                <div className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-primary via-primary to-transparent" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary shadow-[0_0_10px_hsl(var(--primary))]" />
              </motion.div>

              <motion.div
                className="absolute -bottom-3 -left-3 w-12 h-12"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-primary to-transparent" />
                <div className="absolute bottom-0 left-0 w-0.5 h-full bg-gradient-to-t from-primary via-primary to-transparent" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary shadow-[0_0_10px_hsl(var(--primary))]" />
              </motion.div>

              <motion.div
                className="absolute -bottom-3 -right-3 w-12 h-12"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              >
                <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-primary via-primary to-transparent" />
                <div className="absolute bottom-0 right-0 w-0.5 h-full bg-gradient-to-t from-primary via-primary to-transparent" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary shadow-[0_0_10px_hsl(var(--primary))]" />
              </motion.div>

              {/* Main vault container with metallic effect - ultra transparent */}
              <div className="relative bg-gradient-to-br from-card/40 via-card/30 to-card/40 backdrop-blur-sm border border-primary/60 rounded-xl p-12 shadow-[0_0_50px_-12px_hsl(var(--primary)/0.5)] overflow-hidden">
                {/* Inner glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-primary/15 rounded-xl" />

                {/* Digital circuit pattern overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='hsl(var(--primary))' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v6h6V4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '60px 60px'
                }} />

                {/* HUD horizontal lines */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                {/* Vault lock mechanism visualization */}
                <div className="flex justify-center mb-8">
                  <motion.div
                    animate={{
                      rotate: isUnlocking ? 90 : 0,
                      scale: isUnlocking ? 1.1 : 1
                    }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="relative"
                  >
                    {/* Outer ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-2 border-primary/20"
                      style={{ width: 120, height: 120, left: -10, top: -10 }}
                    />

                    {/* Lock icon */}
                    <div className="relative w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/40 flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentStep}
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CurrentIcon className="w-10 h-10 text-primary" strokeWidth={2} />
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Unlocking bolts */}
                    {isUnlocking && [0, 90, 180, 270].map((angle, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{
                          opacity: 0,
                          scale: 2,
                          x: Math.cos((angle * Math.PI) / 180) * 50,
                          y: Math.sin((angle * Math.PI) / 180) * 50
                        }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="absolute w-2 h-2 bg-primary rounded-full"
                        style={{
                          left: '50%',
                          top: '50%',
                          marginLeft: -4,
                          marginTop: -4
                        }}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Status text */}
                <div className="text-center mb-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-center gap-3"
                    >
                      <span className="text-lg font-semibold text-foreground">
                        {isUnlocking ? 'Vault Unlocked' : loadingSteps[currentStep]?.text}
                      </span>
                      {!isUnlocking && (
                        <motion.div
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="flex gap-1"
                        >
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {currentStep === 2 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-muted-foreground mt-2"
                    >
                      {briefCount.toLocaleString()}+ briefs since Feb 2023
                    </motion.p>
                  )}
                </div>

                {/* Progress bar */}
                <div className="relative h-2 bg-primary/10 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />

                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['100%', '-100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                </div>

                {/* Progress percentage */}
                <div className="text-center mt-3">
                  <span className="text-xs text-muted-foreground font-mono">
                    {Math.round(progress)}%
                  </span>
                </div>

                {/* Security badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground/70"
                >
                  <Lock className="w-3 h-3" />
                  <span>Military-grade encryption • Zero data stored</span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Particle effects */}
          {isUnlocking && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: '50vw',
                    y: '50vh'
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: `${Math.random() * 100}vw`,
                    y: `${Math.random() * 100}vh`
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.05,
                    ease: "easeOut"
                  }}
                  className="absolute w-1 h-1 bg-primary rounded-full"
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
