// =============================================================================
// DECISION MEMO INTAKE PAGE
// Dedicated route so refresh preserves intake form state
// =============================================================================

"use client";

import React from 'react';
import { PatternAuditPage } from '@/components/decision-memo/pattern-audit/PatternAuditPage';
import { usePageTitle } from '@/hooks/use-page-title';

export default function DecisionMemoIntakePage() {
  usePageTitle('Pattern Audit - Intake', 'IC-ready artifact for high-stakes allocation decisions');

  return <PatternAuditPage />;
}
