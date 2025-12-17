// components/assessment/TermTooltip.tsx
// Premium tooltip for displaying term definitions

"use client";

import { useState, useEffect, useId, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { useTooltip } from './TooltipContext';
import type { TermDefinition } from '@/lib/hooks/useAssessmentState';

interface TermTooltipProps {
  term: string;
  definition: TermDefinition;
  children: React.ReactNode;
}

export const TermTooltip: React.FC<TermTooltipProps> = ({ term, definition, children }) => {
  const tooltipId = useId();
  const { openTooltipId, setOpenTooltipId } = useTooltip();
  const [isHovered, setIsHovered] = useState(false);
  const termRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // This tooltip is open if it's the currently open tooltip in global state
  const isOpen = openTooltipId === tooltipId;
  const isSticky = isOpen && !isHovered; // Sticky if open but not from hover

  // Category colors
  const categoryColors = {
    tax: 'from-red-500/20 to-red-600/10 border-red-500/40',
    legal: 'from-blue-500/20 to-blue-600/10 border-blue-500/40',
    financial: 'from-green-500/20 to-green-600/10 border-green-500/40',
    trust: 'from-purple-500/20 to-purple-600/10 border-purple-500/40',
    regulatory: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/40',
    investment: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/40',
  };

  const categoryLabels = {
    tax: 'Tax',
    legal: 'Legal',
    financial: 'Financial',
    trust: 'Trust',
    regulatory: 'Regulatory',
    investment: 'Investment',
  };

  // Calculate tooltip position to avoid overflow
  const calculateTooltipPosition = useCallback(() => {
    if (!termRef.current || !isOpen) return;

    const termRect = termRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Tooltip dimensions (approximate)
    const tooltipWidth = Math.min(viewportWidth * 0.9, 384); // 90vw or max-w-md
    const tooltipHeight = 250; // Approximate height

    let left = termRect.left + (termRect.width / 2) - (tooltipWidth / 2);
    let top = termRect.bottom + 10; // 10px below the term

    // Prevent overflow on the right
    if (left + tooltipWidth > viewportWidth - 10) {
      left = viewportWidth - tooltipWidth - 10;
    }

    // Prevent overflow on the left
    if (left < 10) {
      left = 10;
    }

    // If tooltip would overflow bottom, position it above the term
    if (top + tooltipHeight > viewportHeight - 10) {
      top = termRect.top - tooltipHeight - 10;
    }

    // If still overflowing top, center it vertically
    if (top < 10) {
      top = (viewportHeight - tooltipHeight) / 2;
    }

    setTooltipPosition({ top, left });
  }, [isOpen]);

  // Update position when tooltip opens or window resizes
  useEffect(() => {
    if (isOpen) {
      calculateTooltipPosition();

      const handleResize = () => calculateTooltipPosition();
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize);
      };
    }
  }, [isOpen, calculateTooltipPosition]);

  // Handle click outside to close tooltip
  useEffect(() => {
    if (isOpen && isSticky) {
      const handleClickOutside = (event: MouseEvent) => {
        // Check if click is outside both the term and the tooltip
        if (
          termRef.current &&
          !termRef.current.contains(event.target as Node) &&
          tooltipRef.current &&
          !tooltipRef.current.contains(event.target as Node)
        ) {
          setOpenTooltipId(null);
        }
      };

      // Add slight delay to avoid immediate close on the same click that opened it
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isOpen, isSticky, setOpenTooltipId]);

  return (
    <span className="relative inline-block group">
      {/* Clickable term - using span instead of button to avoid nesting issues */}
      <span
        ref={termRef}
        onClick={(e) => {
          e.stopPropagation();
          // Toggle: if this tooltip is open, close it; otherwise open it
          if (isOpen) {
            setOpenTooltipId(null);
          } else {
            setOpenTooltipId(tooltipId);
          }
          setIsHovered(false); // Not from hover
        }}
        onMouseEnter={() => {
          // Open on hover (will close any other tooltip)
          setOpenTooltipId(tooltipId);
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          // Only close on mouse leave if not sticky (i.e., was opened by hover)
          if (isHovered) {
            setOpenTooltipId(null);
            setIsHovered(false);
          }
        }}
        className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 border-2 border-primary/60 rounded-md text-primary hover:bg-primary/30 hover:border-primary transition-all cursor-help font-semibold text-sm"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            // Toggle: if this tooltip is open, close it; otherwise open it
            if (isOpen) {
              setOpenTooltipId(null);
            } else {
              setOpenTooltipId(tooltipId);
            }
            setIsHovered(false); // Not from hover
          }
        }}
      >
        {children}
        <Info className="w-3.5 h-3.5" />
      </span>

      {/* Tooltip popup - rendered via portal to avoid invalid HTML nesting */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={tooltipRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed z-[9999] w-[90vw] sm:w-96 max-w-md pointer-events-auto"
              style={{
                left: `${tooltipPosition.left}px`,
                top: `${tooltipPosition.top}px`,
              }}
            >
              <div className="bg-card/98 backdrop-blur-2xl border-2 border-primary/50 rounded-2xl p-4 sm:p-5 shadow-2xl ring-2 ring-primary/30">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl font-bold text-foreground tracking-tight">{definition.term}</span>
                      <span className="text-xs px-2.5 py-1 bg-primary/15 border border-primary/40 rounded-lg text-primary font-semibold uppercase tracking-wider">
                        {categoryLabels[definition.category]}
                      </span>
                    </div>
                    {definition.fullName && (
                      <div className="text-sm text-muted-foreground font-medium italic">
                        {definition.fullName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Definition */}
                <div className="text-sm text-foreground/90 leading-relaxed">
                  {definition.definition}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </span>
  );
};
