// components/assessment/TooltipContext.tsx
// Global tooltip state management - ensures only one tooltip open at a time
// Also tracks which terms have been shown to prevent duplicates

"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface TooltipContextType {
  openTooltipId: string | null;
  setOpenTooltipId: (id: string | null) => void;
  shownTerms: Set<string>;
  addShownTerm: (term: string) => void;
  resetShownTerms: () => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export const TooltipProvider = ({ children }: { children: ReactNode }) => {
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);
  const [shownTerms, setShownTerms] = useState<Set<string>>(new Set());

  const addShownTerm = useCallback((term: string) => {
    setShownTerms(prev => {
      const next = new Set(prev);
      next.add(term.toUpperCase());
      return next;
    });
  }, []);

  const resetShownTerms = useCallback(() => {
    setShownTerms(new Set());
  }, []);

  return (
    <TooltipContext.Provider value={{
      openTooltipId,
      setOpenTooltipId,
      shownTerms,
      addShownTerm,
      resetShownTerms
    }}>
      {children}
    </TooltipContext.Provider>
  );
};

export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (context === undefined) {
    throw new Error('useTooltip must be used within TooltipProvider');
  }
  return context;
};
