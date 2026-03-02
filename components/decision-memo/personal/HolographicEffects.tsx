'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Animated circuit board background
 */
export function CircuitBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="personal-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <motion.path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="rgba(212, 168, 67, 0.15)"
              strokeWidth="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
          </pattern>
          <pattern id="personal-dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.5" fill="rgba(212, 168, 67, 0.3)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#personal-grid)" />
        <rect width="100%" height="100%" fill="url(#personal-dots)" />
      </svg>

      {/* Animated lines */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(212, 168, 67, 0.05) 100px, rgba(212, 168, 67, 0.05) 101px)',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '100px 0px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
}

/**
 * Scanning line effect
 */
export function ScanningLine({ direction = 'horizontal' }: { direction?: 'horizontal' | 'vertical' }) {
  return (
    <motion.div
      className={`absolute ${direction === 'horizontal' ? 'left-0 right-0 h-px' : 'top-0 bottom-0 w-px'}`}
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(212, 168, 67, 0.8) 50%, transparent 100%)',
      }}
      animate={direction === 'horizontal' ? {
        top: ['0%', '100%'],
        opacity: [0, 1, 0],
      } : {
        left: ['0%', '100%'],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
}

/**
 * Holographic shimmer overlay
 */
export function HolographicShimmer() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        background: 'linear-gradient(45deg, transparent 30%, rgba(212, 168, 67, 0.1) 50%, transparent 70%)',
      }}
      animate={{
        x: ['-200%', '200%'],
        y: ['-200%', '200%'],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  );
}

/**
 * Floating particles effect
 */
export function FloatingParticles({ count = 20 }: { count?: number }) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
    }));
    setParticles(newParticles);
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full bg-gold/50"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, 50, 0],
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

/**
 * Pulsing ring effect
 */
export function PulsingRings({ color = 'gold', count = 3 }: { color?: string; count?: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute inset-0 rounded-full border-2 border-${color}`}
          style={{ borderColor: color }}
          animate={{
            scale: [1, 1.5],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 0.4,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
}

/**
 * Glowing border effect
 */
export function GlowingBorder({ color = '#D4A843', intensity = 0.3 }: { color?: string; intensity?: number }) {
  return (
    <>
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          boxShadow: `0 0 20px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{
          border: `1px solid ${color}`,
          opacity: 0.3,
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </>
  );
}

/**
 * Data stream effect
 */
export function DataStream() {
  const streams = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    left: 20 + i * 15,
    delay: i * 0.3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      {streams.map(stream => (
        <motion.div
          key={stream.id}
          className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold to-transparent"
          style={{ left: `${stream.left}%` }}
          animate={{
            y: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            delay: stream.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
}

/**
 * Hexagonal grid background
 */
export function HexGrid() {
  return (
    <div className="absolute inset-0 opacity-10 pointer-events-none">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
            <polygon
              points="24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2"
              fill="none"
              stroke="rgba(212, 168, 67, 0.2)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>
    </div>
  );
}

/**
 * Loading DNA helix
 */
export function LoadingHelix() {
  return (
    <div className="relative w-20 h-20">
      <motion.div
        className="absolute inset-0 border-4 border-gold/20 rounded-full"
      />
      <motion.div
        className="absolute inset-2 border-4 border-t-gold border-r-transparent border-b-transparent border-l-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-4 border-4 border-b-gold border-l-transparent border-t-transparent border-r-transparent rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

/**
 * Corner brackets (HUD style)
 */
export function CornerBrackets({ size = 20, thickness = 2, color = '#D4A843' }: {
  size?: number;
  thickness?: number;
  color?: string;
}) {
  return (
    <>
      {/* Top Left */}
      <svg className="absolute top-0 left-0 w-8 h-8" viewBox="0 0 32 32">
        <path
          d={`M ${thickness} ${size} L ${thickness} ${thickness} L ${size} ${thickness}`}
          stroke={color}
          strokeWidth={thickness}
          fill="none"
        />
      </svg>

      {/* Top Right */}
      <svg className="absolute top-0 right-0 w-8 h-8" viewBox="0 0 32 32">
        <path
          d={`M ${32 - size} ${thickness} L ${32 - thickness} ${thickness} L ${32 - thickness} ${size}`}
          stroke={color}
          strokeWidth={thickness}
          fill="none"
        />
      </svg>

      {/* Bottom Left */}
      <svg className="absolute bottom-0 left-0 w-8 h-8" viewBox="0 0 32 32">
        <path
          d={`M ${thickness} ${32 - size} L ${thickness} ${32 - thickness} L ${size} ${32 - thickness}`}
          stroke={color}
          strokeWidth={thickness}
          fill="none"
        />
      </svg>

      {/* Bottom Right */}
      <svg className="absolute bottom-0 right-0 w-8 h-8" viewBox="0 0 32 32">
        <path
          d={`M ${32 - size} ${32 - thickness} L ${32 - thickness} ${32 - thickness} L ${32 - thickness} ${32 - size}`}
          stroke={color}
          strokeWidth={thickness}
          fill="none"
        />
      </svg>
    </>
  );
}

/**
 * Cyber grid overlay - futuristic wireframe background
 */
export function CyberGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
      {/* Perspective grid */}
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          {/* Neon glow filter */}
          <filter id="neon-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Animated gradient */}
          <linearGradient id="cyber-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 255, 255, 0.3)">
              <animate attributeName="stop-color" values="rgba(0,255,255,0.3); rgba(212,168,67,0.3); rgba(0,255,255,0.3)" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="rgba(212, 168, 67, 0.3)">
              <animate attributeName="stop-color" values="rgba(212,168,67,0.3); rgba(0,255,255,0.3); rgba(212,168,67,0.3)" dur="6s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {Array.from({ length: 20 }).map((_, i) => {
          const y = (i / 19) * 100;
          const opacity = 1 - Math.abs(i - 10) / 10;
          return (
            <motion.line
              key={`h-${i}`}
              x1="0%"
              y1={`${y}%`}
              x2="100%"
              y2={`${y}%`}
              stroke="url(#cyber-gradient)"
              strokeWidth="1"
              opacity={opacity * 0.4}
              filter="url(#neon-glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: i * 0.05, ease: 'easeOut' }}
            />
          );
        })}

        {/* Vertical grid lines with perspective */}
        {Array.from({ length: 30 }).map((_, i) => {
          const x = (i / 29) * 100;
          const opacity = 1 - Math.abs(i - 15) / 15;
          return (
            <motion.line
              key={`v-${i}`}
              x1={`${x}%`}
              y1="0%"
              x2={`${x}%`}
              y2="100%"
              stroke="url(#cyber-gradient)"
              strokeWidth="0.5"
              opacity={opacity * 0.3}
              filter="url(#neon-glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: i * 0.03, ease: 'easeOut' }}
            />
          );
        })}

        {/* Animated pulse circles */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.circle
            key={`pulse-${i}`}
            cx="50%"
            cy="50%"
            r="0"
            stroke="rgba(212, 168, 67, 0.5)"
            strokeWidth="2"
            fill="none"
            filter="url(#neon-glow)"
            animate={{
              r: ['0', '800'],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 8,
              delay: i * 2.67,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}
      </svg>

      {/* Diagonal scan lines */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0, 255, 255, 0.03) 10px, rgba(0, 255, 255, 0.03) 20px)',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '40px 40px'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    </div>
  );
}
