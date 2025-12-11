// lib/hooks/useValidatedCitations.ts
// Hook to validate Dev IDs and only return citations for existing developments

import { useState, useEffect } from 'react';
import type { Citation } from '@/lib/parse-dev-citations';

interface UseValidatedCitationsConfig {
  devIds: string[];
  isPublic?: boolean;
}

interface UseValidatedCitationsResult {
  validCitations: Citation[];
  loading: boolean;
  validDevIds: Set<string>;
}

export function useValidatedCitations({
  devIds,
  isPublic = true
}: UseValidatedCitationsConfig): UseValidatedCitationsResult {
  const [validCitations, setValidCitations] = useState<Citation[]>([]);
  const [validDevIds, setValidDevIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!devIds || devIds.length === 0) {
      setValidCitations([]);
      setValidDevIds(new Set());
      return;
    }

    const validateDevIds = async () => {
      setLoading(true);
      const validIds = new Set<string>();
      const citations: Citation[] = [];
      let citationNumber = 1;

      // Batch validate all Dev IDs in parallel
      const validationPromises = devIds.map(async (devId) => {
        try {
          // Check if development exists using HEAD request (more efficient)
          const response = await fetch(`/api/developments/public/${devId}`, {
            method: 'HEAD'
          });

          if (response.ok) {
            return devId; // Valid Dev ID
          }
          return null; // Invalid Dev ID
        } catch {
          return null; // Network error or invalid
        }
      });

      // Wait for all validations to complete
      const results = await Promise.all(validationPromises);

      // Build citations only for valid Dev IDs
      results.forEach((devId) => {
        if (devId) {
          validIds.add(devId);
          citations.push({
            id: devId,
            number: citationNumber++,
            originalText: `[Dev ID: ${devId}]`
          });
        }
      });

      setValidDevIds(validIds);
      setValidCitations(citations);
      setLoading(false);
    };

    validateDevIds();
  }, [devIds.join(','), isPublic]); // Depend on stringified array to avoid infinite loops

  return {
    validCitations,
    loading,
    validDevIds
  };
}