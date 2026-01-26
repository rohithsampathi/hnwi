// =============================================================================
// DECISION MEMO PAGE
// SFO Pattern Audit flow with Vault Entry Sequence
// =============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { DecisionMemoLanding } from '@/components/decision-memo/DecisionMemoLanding';
import { PatternAuditPage } from '@/components/decision-memo/pattern-audit/PatternAuditPage';
import { VaultEntrySequence } from '@/components/assessment/VaultEntrySequence';
import { usePageTitle } from '@/hooks/use-page-title';

type FlowStage = 'vault' | 'landing' | 'intake';

// Module-level flag to prevent vault from showing multiple times in session
let vaultShownThisSession = false;

export default function DecisionMemoPage() {
  const [flowStage, setFlowStage] = useState<FlowStage>(() => {
    // Check if vault has already been shown this session
    if (vaultShownThisSession) {
      return 'landing';
    }
    return 'vault';
  });
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [briefCount, setBriefCount] = useState<number>(1875);

  usePageTitle(
    flowStage === 'intake' ? 'Pattern Audit - Intake' : 'Decision Posture Audit',
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

  // Handle start audit from landing
  const handleStartAudit = () => {
    setFlowStage('intake');
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
  if (flowStage === 'landing') {
    return (
      <DecisionMemoLanding onContinue={handleStartAudit} />
    );
  }

  // Pattern Audit Intake (split view)
  if (flowStage === 'intake') {
    return <PatternAuditPage />;
  }

  return null;
}
