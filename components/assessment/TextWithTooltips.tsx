// components/assessment/TextWithTooltips.tsx
// Parses text and wraps defined terms with tooltips

"use client";

import React, { useMemo, useEffect, useRef } from 'react';
import { getTermDefinition } from '@/lib/assessment-term-definitions';
import { TermTooltip } from './TermTooltip';
import { useTooltip } from './TooltipContext';

interface TextWithTooltipsProps {
  text: string;
  className?: string;
  excludeTerms?: Set<string>; // Terms to skip (already shown elsewhere)
  onTermsFound?: (terms: Set<string>) => void; // Callback to report found terms
}

// Empty set constant to avoid recreating on every render
const EMPTY_SET = new Set<string>();

export const TextWithTooltips: React.FC<TextWithTooltipsProps> = ({
  text,
  className,
  excludeTerms,
  onTermsFound
}) => {
  const { shownTerms, addShownTerm } = useTooltip();
  const reportedTermsRef = useRef<Set<string>>(new Set());
  const excludeTermsSet = excludeTerms || EMPTY_SET;

  const { elements, foundTerms, newTermsToAdd } = useMemo(() => {
    const elements: React.ReactNode[] = [];
    const foundTerms = new Set<string>();
    const newTermsToAdd = new Set<string>(); // Terms to add after render

    // Related terms: when we show the key, also mark values as used
    const relatedTerms: Record<string, string[]> = {
      'DIP FINANCING': ['DIP'],
      '1031 EXCHANGE': ['1031'],
      'CAPTIVE FINANCE': ['CAPTIVE'],
      'CREDIT LINE': ['CREDIT'],
      'CREDIT FACILITY': ['CREDIT'],
    };

    // Multi-word terms to check (longest first to avoid partial matches)
    const multiWordTerms = [
      'securities-based lending', 'political neutrality', 'property rights',
      'estate tax', 'gift tax', 'capital gains', 'wealth tax',
      'break glass', 'hard assets', 'cold storage', 'gold vault',
      '1031 Exchange', 'Basel III', 'captive finance', 'private credit',
      'credit line', 'credit facility', 'DIP financing', 'credit bidding',
      'hurdle rate', 'investment-grade', 'cap rate', 'core asset',
      'value-add', 'distressed debt', 'Roth IRA', 'Traditional IRA',
      'step-up', 'Chapter 11'
    ];

    let remainingText = text;
    let position = 0;

    while (position < text.length) {
      let matched = false;

      // Check for multi-word terms first
      for (const term of multiWordTerms) {
        const termRegex = new RegExp(`\\b${term}\\b`, 'i');
        const match = remainingText.match(termRegex);

        if (match && match.index === 0) {
          const definition = getTermDefinition(term);

          if (definition) {
            const termKey = term.toUpperCase();
            foundTerms.add(termKey);

            // Show tooltip only if: (1) not excluded from scenario, AND (2) not already shown globally
            if (!excludeTermsSet.has(termKey) && !shownTerms.has(termKey)) {
              elements.push(
                <React.Fragment key={`term-${position}`}>
                  <TermTooltip term={term} definition={definition}>
                    {match[0]}
                  </TermTooltip>
                </React.Fragment>
              );
              newTermsToAdd.add(termKey); // Queue for state update after render
              // Also queue related terms
              if (relatedTerms[termKey]) {
                relatedTerms[termKey].forEach(related => newTermsToAdd.add(related));
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
      }

      if (matched) continue;

      // Check for single-word terms
      const wordMatch = remainingText.match(/^([.,;:!?()\[\]{}"'\s]*)([\w&-]+)([.,;:!?()\[\]{}"'\s]*)/);

      if (wordMatch) {
        const [fullMatch, leadingPunct, word, trailingPunct] = wordMatch;
        const definition = getTermDefinition(word);

        if (definition) {
          const termKey = word.toUpperCase();
          foundTerms.add(termKey);

          // Show tooltip only if: (1) not excluded from scenario, AND (2) not already shown globally
          if (!excludeTermsSet.has(termKey) && !shownTerms.has(termKey)) {
            elements.push(
              <React.Fragment key={`word-${position}`}>
                {leadingPunct}
                <TermTooltip term={word} definition={definition}>
                  {word}
                </TermTooltip>
                {trailingPunct}
              </React.Fragment>
            );
            newTermsToAdd.add(termKey); // Queue for state update after render
            // Also queue related terms
            if (relatedTerms[termKey]) {
              relatedTerms[termKey].forEach(related => newTermsToAdd.add(related));
            }
          } else {
            // Term already shown or excluded, just render plain text
            elements.push(
              <React.Fragment key={`text-${position}`}>
                {fullMatch}
              </React.Fragment>
            );
          }
        } else {
          elements.push(
            <React.Fragment key={`text-${position}`}>
              {fullMatch}
            </React.Fragment>
          );
        }

        position += fullMatch.length;
        remainingText = text.substring(position);
      } else {
        // No match, add single character and continue
        elements.push(
          <React.Fragment key={`char-${position}`}>
            {remainingText[0]}
          </React.Fragment>
        );
        position++;
        remainingText = text.substring(position);
      }
    }

    return { elements, foundTerms, newTermsToAdd };
  }, [text, excludeTermsSet, shownTerms]); // Removed addShownTerm from dependencies

  // Update shown terms AFTER render (not during)
  useEffect(() => {
    if (newTermsToAdd.size > 0) {
      newTermsToAdd.forEach(term => addShownTerm(term));
    }
  }, [newTermsToAdd, addShownTerm]);

  // Report found terms only when they actually change
  useEffect(() => {
    if (onTermsFound && foundTerms.size > 0) {
      // Convert Sets to strings for comparison
      const foundTermsStr = Array.from(foundTerms).sort().join(',');
      const reportedTermsStr = Array.from(reportedTermsRef.current).sort().join(',');

      // Only call onTermsFound if terms changed
      if (foundTermsStr !== reportedTermsStr) {
        onTermsFound(foundTerms);
        reportedTermsRef.current = new Set(foundTerms);
      }
    }
  }, [foundTerms, onTermsFound]);

  return (
    <span className={className}>
      {elements}
    </span>
  );
};
