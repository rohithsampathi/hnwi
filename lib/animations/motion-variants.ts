/**
 * Shared Motion Variants — World-Class Animation System
 * Centralized animation definitions for framer-motion
 *
 * Usage:
 *   import { fadeInUp, staggerContainer } from '@/lib/animations/motion-variants';
 *   <motion.div variants={fadeInUp} initial="hidden" animate="visible" />
 */

import { Variants, Transition } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// TIMING SYSTEM — Consistent easing & duration across the app
// ═══════════════════════════════════════════════════════════════

export const EASE_OUT_EXPO: Transition["ease"] = [0.16, 1, 0.3, 1];
export const EASE_OUT_QUART: Transition["ease"] = [0.25, 1, 0.5, 1];
export const EASE_IN_OUT: Transition["ease"] = [0.4, 0, 0.2, 1];

export const DURATION = {
  fast: 0.3,
  normal: 0.5,
  slow: 0.7,
  slower: 0.9,
  hero: 1.2,
} as const;

// ═══════════════════════════════════════════════════════════════
// CORE VARIANTS — Reusable across all components
// ═══════════════════════════════════════════════════════════════

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.normal },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO },
  },
};

// ═══════════════════════════════════════════════════════════════
// STAGGER VARIANTS — Parent containers that orchestrate children
// ═══════════════════════════════════════════════════════════════

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE_OUT_EXPO },
  },
};

// ═══════════════════════════════════════════════════════════════
// SECTION REVEAL — For page-level scroll orchestration
// ═══════════════════════════════════════════════════════════════

export const sectionReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.slower,
      ease: EASE_OUT_EXPO,
    },
  },
};

export const sectionRevealWithChildren: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.slower,
      ease: EASE_OUT_EXPO,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// HERO VARIANTS — For impactful first-impression elements
// ═══════════════════════════════════════════════════════════════

export const heroNumber: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: DURATION.hero,
      ease: EASE_OUT_EXPO,
    },
  },
};

export const heroLine: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: DURATION.hero,
      ease: EASE_OUT_QUART,
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// MICRO-INTERACTIONS — Hover states, pulses, breathing
// ═══════════════════════════════════════════════════════════════

export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.01,
    y: -2,
    transition: { duration: 0.25, ease: EASE_OUT_QUART },
  },
};

export const badgePulse: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.85, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const breathe: Variants = {
  animate: {
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const shimmer: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// PROGRESS ANIMATIONS — For bars, gauges, counters
// ═══════════════════════════════════════════════════════════════

export const progressFill = (targetWidth: number): Variants => ({
  hidden: { width: 0 },
  visible: {
    width: `${targetWidth}%`,
    transition: {
      duration: DURATION.hero,
      ease: EASE_OUT_QUART,
      delay: 0.3,
    },
  },
});

export const counterTransition: Transition = {
  duration: 1.5,
  ease: EASE_OUT_EXPO,
};
