"use client";

/**
 * SectionReveal — World-Class Scroll-Triggered Section Animation
 *
 * Wraps any section to provide premium scroll-triggered entrance.
 * Uses Intersection Observer (via framer-motion's useInView) for
 * performance — only animates when scrolled into viewport.
 *
 * Usage:
 *   <SectionReveal>
 *     <Page2AuditVerdict ... />
 *   </SectionReveal>
 *
 *   <SectionReveal direction="left" delay={0.2}>
 *     <CrisisResilienceSection ... />
 *   </SectionReveal>
 */

import React, { useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { EASE_OUT_EXPO, DURATION } from '@/lib/animations/motion-variants';

interface SectionRevealProps {
  children: React.ReactNode;
  /** Animation direction: 'up' (default), 'down', 'left', 'right', 'scale' */
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  /** Additional delay in seconds (stacks with direction animation) */
  delay?: number;
  /** Duration override */
  duration?: number;
  /** Viewport margin for trigger (negative = trigger earlier) */
  margin?: string;
  /** Additional className */
  className?: string;
  /** Disable animation (useful for SSR or reduced-motion) */
  disabled?: boolean;
}

const getVariants = (
  direction: SectionRevealProps['direction'],
  delay: number,
  duration: number
): Variants => {
  const baseTransition = {
    duration,
    ease: EASE_OUT_EXPO,
    delay,
  };

  switch (direction) {
    case 'down':
      return {
        hidden: { opacity: 0, y: -40 },
        visible: { opacity: 1, y: 0, transition: baseTransition },
      };
    case 'left':
      return {
        hidden: { opacity: 0, x: -40 },
        visible: { opacity: 1, x: 0, transition: baseTransition },
      };
    case 'right':
      return {
        hidden: { opacity: 0, x: 40 },
        visible: { opacity: 1, x: 0, transition: baseTransition },
      };
    case 'scale':
      return {
        hidden: { opacity: 0, scale: 0.92 },
        visible: { opacity: 1, scale: 1, transition: baseTransition },
      };
    case 'up':
    default:
      return {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: baseTransition },
      };
  }
};

export const SectionReveal: React.FC<SectionRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = DURATION.slower,
  margin = '-80px',
  className = '',
  disabled = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: margin as any });

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  const variants = getVariants(direction, delay, duration);

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default SectionReveal;
