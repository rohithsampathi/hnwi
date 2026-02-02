// =============================================================================
// DECISION MEMO PAGE
// Vault Entry Sequence → Landing Page
// Intake form lives at /decision-memo/intake (separate route for refresh safety)
// =============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DecisionMemoLanding } from '@/components/decision-memo/DecisionMemoLanding';
import { VaultEntrySequence } from '@/components/assessment/VaultEntrySequence';
import { usePageTitle } from '@/hooks/use-page-title';

type FlowStage = 'vault' | 'landing';

// Module-level flag to prevent vault from showing multiple times in session
let vaultShownThisSession = false;

export default function DecisionMemoPage() {
  const router = useRouter();
  const [flowStage, setFlowStage] = useState<FlowStage>(() => {
    if (vaultShownThisSession) {
      return 'landing';
    }
    return 'vault';
  });
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [briefCount, setBriefCount] = useState<number>(1875);

  usePageTitle(
    'Decision Posture Audit',
    'IC-ready artifact for high-stakes allocation decisions'
  );

  // Fetch opportunities for the vault map background
  useEffect(() => {
    async function fetchData() {
      try {
        const [oppsRes, countsRes] = await Promise.all([
          fetch('/api/public/assessment/preview-opportunities?show_all=true'),
          fetch('/api/developments/counts')
        ]);

        if (oppsRes.ok) {
          const data = await oppsRes.json();
          let opps = Array.isArray(data) ? data : (data.opportunities || data.data || []);
          setOpportunities(opps.filter((o: any) => o.latitude && o.longitude));
        }

        if (countsRes.ok) {
          const data = await countsRes.json();
          setBriefCount(data.developments?.total_count || data.total || data.count || 1875);
        }
      } catch {
        // Silent fail - use defaults
      }
    }
    fetchData();
  }, []);

  // Handle vault completion
  const handleVaultComplete = () => {
    vaultShownThisSession = true;
    setFlowStage('landing');
  };

  // Handle start audit — navigate to dedicated intake route
  const handleStartAudit = () => {
    router.push('/decision-memo/intake');
  };

  // Vault Entry Sequence
  if (flowStage === 'vault') {
    return (
      <VaultEntrySequence
        onComplete={handleVaultComplete}
        briefCount={briefCount}
        opportunities={opportunities}
      />
    );
  }

  // Landing Page
  return (
    <DecisionMemoLanding onContinue={handleStartAudit} />
  );
}
