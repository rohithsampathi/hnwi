// lib/hooks/usePersonalMode.ts
// Shared personal mode state management across Home Dashboard and War Room

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'dashboard_personal_mode';

export function usePersonalMode(hasCompletedAssessment: boolean) {
  // Initialize from localStorage (default to false)
  const [isPersonalMode, setIsPersonalMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });

  // Persist to localStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(isPersonalMode));
    }
  }, [isPersonalMode]);

  // Reset to false if user hasn't completed assessment
  useEffect(() => {
    if (!hasCompletedAssessment && isPersonalMode) {
      setIsPersonalMode(false);
    }
  }, [hasCompletedAssessment, isPersonalMode]);

  const togglePersonalMode = () => {
    if (!hasCompletedAssessment) {
      // Cannot toggle if assessment not completed
      return;
    }
    setIsPersonalMode(prev => !prev);
  };

  return {
    isPersonalMode,
    setIsPersonalMode,
    togglePersonalMode
  };
}
