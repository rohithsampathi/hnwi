// components/assessment/TextWithTooltips.tsx
// Renders text with tooltips for terms provided by backend

"use client";

import React, { useMemo, useEffect, useRef } from 'react';
import { TermTooltip } from './TermTooltip';
import { useTooltip } from './TooltipContext';
import type { TermDefinition } from '@/lib/hooks/useAssessmentState';

interface TextWithTooltipsProps {
  text: string;
  className?: string;
  terms?: TermDefinition[]; // Terms provided by backend
  excludeTerms?: Set<string>; // Terms to skip (already shown elsewhere)
  onTermsFound?: (terms: Set<string>) => void; // Callback to report found terms
}

// Empty set constant to avoid recreating on every render
const EMPTY_SET = new Set<string>();

export const TextWithTooltips: React.FC<TextWithTooltipsProps> = ({
  text,
  className,
  terms = [],
  excludeTerms,
  onTermsFound
}) => {
  const { shownTerms, addShownTerm } = useTooltip();
  const excludeTermsSet = excludeTerms || EMPTY_SET;

  // For scenario text, we want to always show tooltips (ignore shownTerms)
  // Check if this is being called from a scenario by seeing if excludeTerms is provided
  const isScenarioText = excludeTermsSet.size === 0;

  // Ref to track which terms we've already processed to avoid calling addShownTerm multiple times
  const processedTermsRef = useRef<Set<string>>(new Set());

  // Reset processed terms when text changes
  useEffect(() => {
    processedTermsRef.current.clear();
  }, [text]);

  // Calculate elements to render
  const elements = useMemo(() => {
    // If no terms provided by backend, just return plain text
    if (!terms || terms.length === 0) {
      return [<React.Fragment key="text-0">{text}</React.Fragment>];
    }

    const elements: React.ReactNode[] = [];
    const foundTermsInText = new Set<string>();
    const shownInThisText = new Set<string>(); // Track terms already shown tooltip for in THIS text

    let remainingText = text;
    let position = 0;

    while (position < text.length) {
      let matched = false;

      // Check each backend term (sorted by length descending to match longest first)
      const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length);

      for (const termDef of sortedTerms) {
        const termRegex = new RegExp(`\\b${termDef.term}\\b`, 'i');
        const match = remainingText.match(termRegex);

        if (match && match.index === 0) {
          // CRITICAL FIX: Check if there's a word character before current position
          // This prevents matching "irs" within "heirs" when remainingText starts with "irs"
          const charBefore = position > 0 ? text[position - 1] : '';
          const isWordCharBefore = /\w/.test(charBefore);

          // Skip this match if there's a word character before (not a real word boundary)
          if (isWordCharBefore) {
            continue;
          }

          const termKey = termDef.term.toUpperCase();
          foundTermsInText.add(termKey);

          // Show tooltip only if: (1) not excluded from scenario, (2) not already shown globally (unless this IS the scenario), (3) not already shown in this text
          const shouldShow = !excludeTermsSet.has(termKey) && (isScenarioText || !shownTerms.has(termKey)) && !shownInThisText.has(termKey);

          if (shouldShow) {
            elements.push(
              <React.Fragment key={`term-${position}`}>
                <TermTooltip term={termDef.term} definition={termDef}>
                  {match[0]}
                </TermTooltip>
              </React.Fragment>
            );
            shownInThisText.add(termKey);

            // Mark term as shown if we haven't already processed it
            if (!processedTermsRef.current.has(termKey)) {
              processedTermsRef.current.add(termKey);
              // Call addShownTerm synchronously here - it's safe because we're tracking with ref
              setTimeout(() => addShownTerm(termKey), 0);
            }
          } else {
            // Term already shown or excluded, just render plain text
            elements.push(
              <React.Fragment key={`text-${position}`}>
                {match[0]}
              </React.Fragment>
            );
          }

          position += match[0].length;
          remainingText = text.substring(position);
          matched = true;
          break;
        }
      }

      if (matched) continue;

      // No match found, add single character and continue
      elements.push(
        <React.Fragment key={`char-${position}`}>
          {remainingText[0]}
        </React.Fragment>
      );
      position++;
      remainingText = text.substring(position);
    }

    // Report found terms if callback provided
    if (onTermsFound && foundTermsInText.size > 0) {
      // Use setTimeout to avoid calling during render
      setTimeout(() => onTermsFound(foundTermsInText), 0);
    }

    return elements;
  }, [text, terms, excludeTermsSet, shownTerms, isScenarioText, addShownTerm, onTermsFound]);

  return (
    <span className={className}>
      {elements}
    </span>
  );
};
