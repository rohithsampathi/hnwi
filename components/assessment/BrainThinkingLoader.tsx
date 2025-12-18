// components/assessment/BrainThinkingLoader.tsx
// Skeleton loader for question area only - keeps map visible

"use client";

import { motion } from 'framer-motion';

interface BrainThinkingLoaderProps {
  isVisible: boolean;
  message?: string;
}

export const BrainThinkingLoader: React.FC<BrainThinkingLoaderProps> = ({
  isVisible,
  message = "Analyzing your strategic DNA..."
}) => {
  if (!isVisible) return null;

  return (
    <div className="space-y-6 animate-pulse">
      {/* Question card skeleton */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-lg">
        {/* Scenario badge skeleton */}
        <div className="mb-4 sm:mb-6">
          <div className="w-24 h-6 bg-primary/10 rounded-full mb-3 sm:mb-4" />

          {/* Title skeleton */}
          <div className="space-y-2 mb-3 sm:mb-4">
            <div className="h-6 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-1/2" />
          </div>
        </div>

        {/* Scenario box skeleton */}
        <div className="mb-4 p-3 sm:p-4 bg-muted/50 border border-border rounded-lg">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-4/6" />
          </div>
        </div>

        {/* Question text skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>
      </div>

      {/* Analyzing message */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <motion.div
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }}
        />
        <motion.div
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4
          }}
        />
        <span className="text-sm text-muted-foreground ml-2">{message}</span>
      </div>

      {/* Informational message about map updates */}
      <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl p-4 mb-4">
        <p className="text-sm text-muted-foreground text-center leading-relaxed">
          Once your response is processed, signals executed by individuals that match your thinking style will be updated on the map below. Click on the dot to explore each signal.
        </p>
      </div>

      {/* Choice cards skeleton */}
      <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
        <div className="h-4 bg-muted rounded w-48 mb-2 sm:mb-3" />

        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-4/5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit button skeleton */}
      <div className="flex justify-center">
        <div className="w-full sm:w-auto h-12 sm:h-14 bg-muted rounded-xl" style={{ width: '200px' }} />
      </div>
    </div>
  );
};
