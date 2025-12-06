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

  // For scenario text, we want to always show tooltips (ignore shownTerms)
  // Check if this is being called from a scenario by seeing if excludeTerms is provided
  const isScenarioText = excludeTermsSet.size === 0;

  const { elements, foundTerms, newTermsToAdd } = useMemo(() => {
    const elements: React.ReactNode[] = [];
    const foundTerms = new Set<string>();
    const newTermsToAdd = new Set<string>(); // Terms to add after render
    const shownInThisText = new Set<string>(); // Track terms already shown tooltip for in THIS text

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
      'fiscal residence optimization', 'securities-based lending', 'political neutrality',
      'property rights', 'estate tax', 'gift tax', 'capital gains', 'wealth tax',
      'break glass', 'hard assets', 'cold storage', 'gold vault',
      '1031 Exchange', 'Basel III', 'captive finance', 'private credit',
      'credit line', 'credit facility', 'DIP financing', 'credit bidding',
      'hurdle rate', 'investment-grade', 'cap rate', 'core asset',
      'value-add', 'distressed debt', 'Roth IRA', 'Traditional IRA',
      'step-up', 'Chapter 11', 'OECD Pillar Two', 'Pillar Two', 'Portugal NHR',
      'fiscal residence', 'portable income', 'marginal rate', 'Switzerland forfait'
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

            // Skip "trust" when used as a verb (e.g., "I trust their expertise")
            const isTrustAsVerb = termKey === 'TRUST' && (
              // Check if preceded by personal pronouns (I, you, we, they)
              /\b(I|you|we|they|he|she)\s+$/i.test(text.substring(0, position)) ||
              // Check if followed by possessive pronouns or "that"
              /^\s*(their|his|her|your|my|our|that|the)\b/i.test(text.substring(position + match[0].length))
            );

            // Show tooltip only if: (1) not excluded from scenario, (2) not already shown globally (unless this IS the scenario), (3) not already shown in this text, AND (4) not trust used as verb
            const shouldShow = !isTrustAsVerb && !excludeTermsSet.has(termKey) && (isScenarioText || !shownTerms.has(termKey)) && !shownInThisText.has(termKey);
            if (shouldShow) {
              elements.push(
                <React.Fragment key={`term-${position}`}>
                  <TermTooltip term={term} definition={definition}>
                    {match[0]}
                  </TermTooltip>
                </React.Fragment>
              );
              newTermsToAdd.add(termKey); // Queue for state update after render
              shownInThisText.add(termKey); // Mark as shown in this text
              // Also queue related terms
              if (relatedTerms[termKey]) {
                relatedTerms[termKey].forEach(related => {
                  newTermsToAdd.add(related);
                  shownInThisText.add(related);
                });
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

          // Skip "trust" when used as a verb (e.g., "I trust their expertise")
          const isTrustAsVerb = termKey === 'TRUST' && (
            // Check if preceded by personal pronouns (I, you, we, they)
            /\b(I|you|we|they|he|she)\s+$/i.test(text.substring(0, position)) ||
            // Check if followed by possessive pronouns or "that"
            /^\s*(their|his|her|your|my|our|that|the)\b/i.test(text.substring(position + word.length))
          );

          // Show tooltip only if: (1) not excluded from scenario, (2) not already shown globally (unless this IS the scenario), (3) not already shown in this text, AND (4) not trust used as verb
          const shouldShow = !isTrustAsVerb && !excludeTermsSet.has(termKey) && (isScenarioText || !shownTerms.has(termKey)) && !shownInThisText.has(termKey);
          if (shouldShow) {
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
            shownInThisText.add(termKey); // Mark as shown in this text
            // Also queue related terms
            if (relatedTerms[termKey]) {
              relatedTerms[termKey].forEach(related => {
                newTermsToAdd.add(related);
                shownInThisText.add(related);
              });
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
  }, [text, excludeTermsSet, shownTerms, isScenarioText]); // Added isScenarioText

  // Track terms that need to be added - using a string key for stable dependency
  const newTermsKey = useMemo(() => {
    return Array.from(newTermsToAdd).sort().join(',');
  }, [newTermsToAdd]);

  // Update shown terms AFTER render (not during)
  useEffect(() => {
    if (newTermsKey) {
      const terms = newTermsKey.split(',').filter(t => t);
      terms.forEach(term => addShownTerm(term));
    }
  }, [newTermsKey, addShownTerm]);

  // Track found terms with a stable string key
  const foundTermsKey = useMemo(() => {
    return Array.from(foundTerms).sort().join(',');
  }, [foundTerms]);

  // Report found terms only when they actually change
  useEffect(() => {
    if (onTermsFound && foundTermsKey) {
      const reportedTermsStr = Array.from(reportedTermsRef.current).sort().join(',');

      // Only call onTermsFound if terms changed
      if (foundTermsKey !== reportedTermsStr) {
        const termsSet = new Set(foundTermsKey.split(',').filter(t => t));
        onTermsFound(termsSet);
        reportedTermsRef.current = termsSet;
      }
    }
  }, [foundTermsKey, onTermsFound]);

  return (
    <span className={className}>
      {elements}
    </span>
  );
};
