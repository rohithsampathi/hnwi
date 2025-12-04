// components/assessment/ProgressiveReveal.tsx
// Progressive reveal wrapper for staggered animations

"use client";

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ProgressiveRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const ProgressiveReveal: React.FC<ProgressiveRevealProps> = ({
  children,
  delay = 0,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggeredListProps {
  children: ReactNode[];
  staggerDelay?: number; // delay between each item
  initialDelay?: number; // delay before starting
  className?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerDelay = 0.15,
  initialDelay = 0,
  className = ''
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <ProgressiveReveal
          key={index}
          delay={initialDelay + (index * staggerDelay)}
        >
          {child}
        </ProgressiveReveal>
      ))}
    </div>
  );
};
