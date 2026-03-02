// components/ask-rohith-jarvis/PremiumLoader.tsx
// Premium intelligence processing loader with sophisticated animations

'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const LOADING_STAGES = [
  'Receiving query',
  'Accessing knowledge graph',
  'Pattern matching',
  'Cross-referencing developments',
  'Synthesizing intelligence',
  'Preparing response'
];

export default function PremiumLoader() {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % LOADING_STAGES.length);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Background gradient pulse */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5 rounded-lg"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.02, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative px-6 py-4 border border-gold/20 rounded-lg backdrop-blur-sm">
        {/* Scanning line effect */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
          animate={{
            y: [0, 60, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <div className="flex items-center gap-4">
          {/* Animated dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-gold rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Stage text with fade transition */}
          <div className="flex-1">
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-foreground/80 font-light"
            >
              {LOADING_STAGES[currentStage]}
            </motion.div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-surface-hover rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gold via-gold-muted to-gold"
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom glow */}
        <motion.div
          className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent blur-sm"
          animate={{
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );
}
