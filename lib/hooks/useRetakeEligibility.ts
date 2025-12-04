// lib/hooks/useRetakeEligibility.ts
// Check if existing user can retake assessment (30-day limit)

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth-manager';

interface RetakeEligibility {
  canRetake: boolean;
  availableIn: number | null; // days remaining
  lastAssessment: string | null;
  loading: boolean;
  error: string | null;
}

export const useRetakeEligibility = () => {
  const [eligibility, setEligibility] = useState<RetakeEligibility>({
    canRetake: true, // Default to true for new users
    availableIn: null,
    lastAssessment: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkEligibility = async () => {
      // Only check for authenticated users - use getCurrentUser for reliability
      const user = getCurrentUser();
      if (!user) {
        // Unauthenticated users can always take assessment
        setEligibility({
          canRetake: true,
          availableIn: null,
          lastAssessment: null,
          loading: false,
          error: null,
        });
        return;
      }

      try {
        const response = await fetch('/api/assessment/retake-check');

        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated, can take assessment
            setEligibility({
              canRetake: true,
              availableIn: null,
              lastAssessment: null,
              loading: false,
              error: null,
            });
            return;
          }

          throw new Error('Failed to check eligibility');
        }

        const data = await response.json();
        setEligibility({
          canRetake: data.can_retake ?? true,
          availableIn: data.available_in ?? null,
          lastAssessment: data.last_assessment ?? null,
          loading: false,
          error: null,
        });
      } catch (error) {
        // On error, default to allowing assessment
        setEligibility({
          canRetake: true,
          availableIn: null,
          lastAssessment: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    checkEligibility();
  }, []);

  return eligibility;
};
