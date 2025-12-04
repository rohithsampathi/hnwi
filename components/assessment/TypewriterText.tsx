// components/assessment/TypewriterText.tsx
// Typewriter effect component for gamified assessment experience

"use client";

import { useState, useEffect, useRef } from 'react';
import { TextWithTooltips } from './TextWithTooltips';

interface TypewriterTextProps {
  text: string;
  speed?: number; // milliseconds per character
  delay?: number; // initial delay before starting
  onComplete?: () => void;
  className?: string;
  showTooltips?: boolean;
  excludeTerms?: Set<string>;
  onTermsFound?: (terms: Set<string>) => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 20,
  delay = 0,
  onComplete,
  className = '',
  showTooltips = false,
  excludeTerms,
  onTermsFound
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const hasCalledCompleteRef = useRef(false);

  // Keep ref updated without triggering re-renders
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText('');
    setIsComplete(false);
    setHasStarted(false);
    hasCalledCompleteRef.current = false;

    // Initial delay before starting
    const startTimer = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [text, delay]);

  useEffect(() => {
    if (!hasStarted || isComplete) return;

    let currentIndex = 0;

    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
        // Call onComplete only once using ref
        if (onCompleteRef.current && !hasCalledCompleteRef.current) {
          hasCalledCompleteRef.current = true;
          onCompleteRef.current();
        }
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, hasStarted, isComplete]);

  // Show tooltips only when complete (to avoid partial matching)
  if (showTooltips && isComplete) {
    return (
      <span className={className}>
        <TextWithTooltips
          text={text}
          excludeTerms={excludeTerms}
          onTermsFound={onTermsFound}
        />
      </span>
    );
  }

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  );
};
