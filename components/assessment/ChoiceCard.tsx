// components/assessment/ChoiceCard.tsx
// Premium mobile-first choice card with ecosystem colors

"use client";

import { motion } from 'framer-motion';
import { TextWithTooltips } from './TextWithTooltips';
import type { TermDefinition } from '@/lib/hooks/useAssessmentState';

interface Choice {
  id: string;
  text: string;
  dna_traits?: string[];
}

interface ChoiceCardProps {
  choice: Choice;
  label: string; // A, B, C, D
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  terms?: TermDefinition[]; // Terms provided by backend
  excludeTerms?: Set<string>; // Terms already shown in scenario
}

export const ChoiceCard: React.FC<ChoiceCardProps> = ({
  choice,
  label,
  isSelected,
  onSelect,
  disabled,
  terms,
  excludeTerms
}) => {
  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      className="w-full"
    >
      <button
        onClick={onSelect}
        disabled={disabled}
        className={`
          w-full text-left rounded-2xl border transition-all duration-300
          p-3 sm:p-4 md:p-5
          ${isSelected
            ? 'bg-primary/10 backdrop-blur-xl border-primary/40'
            : 'bg-card/60 backdrop-blur-xl border-primary/20 hover:border-primary/40 hover:bg-card/70'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Label - Mobile optimized */}
          <div className={`
            flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm
            ${isSelected
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
            }
          `}>
            {label}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`
              text-sm sm:text-base leading-relaxed
              ${isSelected ? 'text-foreground font-medium' : 'text-foreground'}
            `}>
              <TextWithTooltips text={choice.text} terms={terms} excludeTerms={excludeTerms} />
            </p>
          </div>

          {/* Selection indicator */}
          {isSelected && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center"
            >
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-foreground rounded-full" />
            </motion.div>
          )}
        </div>
      </button>
    </motion.div>
  );
};
