// components/assessment/TypewriterHeadline.tsx
// Ultra-premium typewriter effect for HNWI intelligence declassification aesthetic

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterHeadlineProps {
  text: string;
  highlightText?: string; // Optional text to highlight (e.g., "their strategic DNA")
  delay?: number; // Delay before starting typewriter
  speed?: number; // Milliseconds per character
  className?: string;
  highlightClassName?: string;
}

export const TypewriterHeadline: React.FC<TypewriterHeadlineProps> = ({
  text,
  highlightText,
  delay = 0,
  speed = 100,
  className = '',
  highlightClassName = ''
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHighlight, setShowHighlight] = useState(false);

  useEffect(() => {
    // Wait for initial delay
    const startTimeout = setTimeout(() => {
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, speed);

        return () => clearTimeout(timeout);
      } else if (highlightText && !showHighlight) {
        // Show highlight text after main text is complete
        setTimeout(() => setShowHighlight(true), 300);
      }
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [currentIndex, text, delay, speed, highlightText, showHighlight]);

  return (
    <h1 className={className}>
      {displayedText.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          {char}
        </motion.span>
      ))}
      {currentIndex >= text.length && highlightText && (
        <>
          <br />
          <motion.span
            className={highlightClassName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: showHighlight ? 1 : 0, y: showHighlight ? 0 : 10 }}
            transition={{ duration: 0.6 }}
          >
            {highlightText}
          </motion.span>
        </>
      )}
    </h1>
  );
};
