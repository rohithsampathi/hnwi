import { PdfMemoData } from '@/lib/pdf/pdf-types';
import { MemoHeader } from '@/components/decision-memo/memo/MemoHeader';
import { Page2AuditVerdict } from '@/components/decision-memo/memo/Page2AuditVerdict';
import RiskRadarChart from '@/components/decision-memo/memo/RiskRadarChart';
import { Page1TaxDashboard } from '@/components/decision-memo/memo/Page1TaxDashboard';
import CrossBorderTaxAudit from '@/components/decision-memo/memo/CrossBorderTaxAudit';
import { RegimeIntelligenceSection } from '@/components/decision-memo/memo/RegimeIntelligenceSection';
import WealthProjectionSection from '@/components/decision-memo/memo/WealthProjectionSection';
import { Page3PeerIntelligence } from '@/components/decision-memo/memo/Page3PeerIntelligence';
import HNWITrendsSection from '@/components/decision-memo/memo/HNWITrendsSection';
import PeerBenchmarkTicker from '@/components/decision-memo/memo/PeerBenchmarkTicker';
import LiquidityTrapFlowchart from '@/components/decision-memo/memo/LiquidityTrapFlowchart';
import { TransparencyRegimeSection } from '@/components/decision-memo/memo/TransparencyRegimeSection';
import RealAssetAuditSection from '@/components/decision-memo/memo/RealAssetAuditSection';
import { CrisisResilienceSection } from '@/components/decision-memo/memo/CrisisResilienceSection';
import GoldenVisaIntelligenceSection from '@/components/decision-memo/memo/GoldenVisaIntelligenceSection';
import GoldenVisaSection from '@/components/decision-memo/memo/GoldenVisaSection';
import { StructureComparisonMatrix } from '@/components/decision-memo/memo/StructureComparisonMatrix';
import HeirManagementSection from '@/components/decision-memo/memo/HeirManagementSection';
import ScenarioTreeSection from '@/components/decision-memo/memo/ScenarioTreeSection';
import ReferencesSection from '@/components/decision-memo/memo/ReferencesSection';
import RegulatorySourcesSection from '@/components/decision-memo/memo/RegulatorySourcesSection';
import { AuditOverviewSection } from '@/components/decision-memo/memo/AuditOverviewSection';
import HouseGradeMemoSection from '@/components/decision-memo/memo/HouseGradeMemoSection';

export type CategoryId =
  | 'executive-summary'
  | 'tax-intelligence'
  | 'peer-intelligence'
  | 'risk-analysis'
  | 'wealth-structuring'
  | 'scenario-planning'
  | 'implementation';

export interface Category {
  id: CategoryId;
  title: string;
  icon: string;
}

export interface SectionDefinition {
  id: string;
  title: string;
  category: CategoryId;
  component: React.ComponentType<any>;
  componentProps?: Record<string, any>;
  shouldRender: (memoData: PdfMemoData) => boolean;
  estimatedReadTime?: number;
  aidaNext?: string[];
  description?: string;
}

const HOUSE_GRADE_WAR_VIEW_SECTION_IDS = [
  'house-signal',
  'house-governing-correction',
  'house-read',
  'house-validated-route',
  'cross-border-audit',
  'transparency-regime',
  'real-asset-audit',
  'house-live-market-crisis',
  'peer-cohort',
  'capital-corridors',
  'geographic-distribution',
  'hnwi-trends',
  'crisis-resilience',
  'house-continuity-office-carry',
  'wealth-projection',
  'scenario-tree',
  'heir-management',
  'house-evidence-ledger',
] as const;

export const CATEGORIES: Category[] = [
  {
    id: 'executive-summary',
    title: 'Executive Summary',
    icon: 'ChartBar',
  },
  {
    id: 'tax-intelligence',
    title: 'Tax Intelligence',
    icon: 'Calculator',
  },
  {
    id: 'peer-intelligence',
    title: 'Peer Intelligence',
    icon: 'Users',
  },
  {
    id: 'risk-analysis',
    title: 'Risk Analysis',
    icon: 'AlertTriangle',
  },
  {
    id: 'wealth-structuring',
    title: 'Wealth Structuring',
    icon: 'Landmark',
  },
  {
    id: 'scenario-planning',
    title: 'Scenario Planning',
    icon: 'Route',
  },
  {
    id: 'implementation',
    title: 'Implementation',
    icon: 'ListChecks',
  },
];

export const SECTIONS: SectionDefinition[] = [
  {
    id: 'house-signal',
    title: 'Decision Signal',
    category: 'executive-summary',
    component: HouseGradeMemoSection,
    componentProps: { chapterId: 'hero', embedDetailedSchedules: false },
    shouldRender: (data) => !!data.preview_data.house_grade_memo,
    estimatedReadTime: 4,
    aidaNext: ['house-governing-correction'],
    description: 'The governing answer, stop conditions, and immediate proceed requirements',
  },
  {
    id: 'house-governing-correction',
    title: 'The Governing Correction',
    category: 'executive-summary',
    component: HouseGradeMemoSection,
    componentProps: { chapterId: 'governing-correction', embedDetailedSchedules: false },
    shouldRender: (data) => !!data.preview_data.house_grade_memo,
    estimatedReadTime: 5,
    aidaNext: ['house-read'],
    description: 'What the room believed, what is actually true, and the original input frame',
  },
  {
    id: 'house-read',
    title: 'The House Read',
    category: 'risk-analysis',
    component: HouseGradeMemoSection,
    componentProps: { chapterId: 'house-read', embedDetailedSchedules: false },
    shouldRender: (data) => !!data.preview_data.house_grade_memo,
    estimatedReadTime: 5,
    aidaNext: ['house-validated-route'],
    description: 'Authority map, fragmentation, named roles, and the real burden under the move',
  },
  {
    id: 'house-validated-route',
    title: 'The Validated Route',
    category: 'tax-intelligence',
    component: HouseGradeMemoSection,
    componentProps: { chapterId: 'validated-route', embedDetailedSchedules: false },
    shouldRender: (data) => !!data.preview_data.house_grade_memo,
    estimatedReadTime: 8,
    aidaNext: ['house-live-market-crisis'],
    description: 'Route architecture, gates, tax, compliance, and route failure logic',
  },
  {
    id: 'house-live-market-crisis',
    title: 'Live Market And Crisis Read',
    category: 'peer-intelligence',
    component: HouseGradeMemoSection,
    componentProps: { chapterId: 'live-market-crisis', embedDetailedSchedules: false },
    shouldRender: (data) => !!data.preview_data.house_grade_memo,
    estimatedReadTime: 6,
    aidaNext: ['house-continuity-office-carry'],
    description: 'Market witnesses, corridor patterns, and live crisis pressure',
  },
  {
    id: 'house-continuity-office-carry',
    title: 'Continuity And Office Carry',
    category: 'wealth-structuring',
    component: HouseGradeMemoSection,
    componentProps: { chapterId: 'continuity-office-carry', embedDetailedSchedules: false },
    shouldRender: (data) => !!data.preview_data.house_grade_memo,
    estimatedReadTime: 7,
    aidaNext: ['house-evidence-ledger'],
    description: 'G1-G2-G3 consequence, office carry path, succession, and decision follow-through',
  },
  {
    id: 'house-evidence-ledger',
    title: 'Evidence, Unknowns, And Memory',
    category: 'implementation',
    component: HouseGradeMemoSection,
    componentProps: { chapterId: 'evidence', embedDetailedSchedules: false },
    shouldRender: (data) => !!data.preview_data.house_grade_memo,
    estimatedReadTime: 4,
    aidaNext: [],
    description: 'Evidence status, unknowns, disclosure needs, and authority ledger',
  },

  // CATEGORY 0: DECISION THESIS (First Section)
  {
    id: 'audit-overview',
    title: 'Decision Thesis',
    category: 'executive-summary',
    component: AuditOverviewSection,
    shouldRender: () => true,
    estimatedReadTime: 3,
    aidaNext: ['memo-header', 'risk-radar'],
    description: 'Intelligence foundation, decision context, and geographic corridor'
  },

  // CATEGORY 1: EXECUTIVE SUMMARY
  {
    id: 'memo-header',
    title: 'Executive Summary',
    category: 'executive-summary',
    component: MemoHeader,
    shouldRender: () => true,
    estimatedReadTime: 2,
    aidaNext: ['risk-radar', 'audit-verdict'],
    description: 'Key metrics and verdict overview'
  },
  {
    id: 'risk-radar',
    title: 'Risk Radar',
    category: 'executive-summary',
    component: RiskRadarChart,
    shouldRender: () => true,
    estimatedReadTime: 3,
    aidaNext: ['audit-verdict', 'tax-dashboard-analysis'],
    description: '6-axis risk analysis across key dimensions'
  },
  {
    id: 'audit-verdict',
    title: 'Audit Verdict',
    category: 'executive-summary',
    component: Page2AuditVerdict,
    shouldRender: () => true,
    estimatedReadTime: 5,
    aidaNext: ['tax-dashboard-analysis', 'liquidity-trap'],
    description: 'Detailed verdict with risk assessment and due diligence'
  },

  // CATEGORY 2: TAX INTELLIGENCE
  {
    id: 'tax-dashboard-analysis',
    title: 'Tax Jurisdiction Analysis',
    category: 'tax-intelligence',
    component: Page1TaxDashboard,
    componentProps: { sections: ['tax'] },
    // CRITICAL FIX: Always show tax analysis (component handles US worldwide tax display)
    shouldRender: () => true,
    estimatedReadTime: 4,
    aidaNext: ['regime-intelligence', 'wealth-projection'],
    description: 'Comparative tax analysis across jurisdictions'
  },
  {
    id: 'cross-border-audit',
    title: 'Cross-Border Tax Audit',
    category: 'tax-intelligence',
    component: CrossBorderTaxAudit,
    shouldRender: (data) => !!(data.preview_data.cross_border_audit || data.preview_data.wealth_projection_data?.starting_position?.cross_border_audit_summary),
    estimatedReadTime: 5,
    aidaNext: ['regime-intelligence', 'transparency-regime'],
    description: 'Cross-border taxation and compliance analysis'
  },
  {
    id: 'regime-intelligence',
    title: 'Special Tax Regimes',
    category: 'tax-intelligence',
    component: RegimeIntelligenceSection,
    shouldRender: (data) => data.preview_data.regime_intelligence?.has_special_regime === true,
    estimatedReadTime: 4,
    aidaNext: ['wealth-projection', 'tax-implementation'],
    description: 'NHR, 13O, and other preferential tax programs'
  },
  {
    id: 'wealth-projection',
    title: 'Wealth Projection Analysis',
    category: 'tax-intelligence',
    component: WealthProjectionSection,
    // CRITICAL FIX: Match War Room conditional logic - check if data exists
    shouldRender: (data) => {
      return !!(data.preview_data.wealth_projection_analysis ||
               (data.preview_data.wealth_projection_data &&
                Object.keys(data.preview_data.wealth_projection_data).length > 0));
    },
    estimatedReadTime: 5,
    aidaNext: ['peer-drivers', 'scenario-tree'],
    description: '10-year wealth growth projections'
  },

  // CATEGORY 3: PEER INTELLIGENCE
  {
    id: 'peer-drivers',
    title: 'Destination Drivers',
    category: 'peer-intelligence',
    component: Page3PeerIntelligence,
    componentProps: { sections: ['drivers'] },
    shouldRender: () => true,
    estimatedReadTime: 3,
    aidaNext: ['peer-cohort', 'hnwi-trends'],
    description: 'What attracts HNWIs to this jurisdiction'
  },
  {
    id: 'peer-cohort',
    title: 'Peer Cohort Analysis',
    category: 'peer-intelligence',
    component: Page3PeerIntelligence,
    componentProps: { sections: ['peer'] },
    shouldRender: () => true,
    estimatedReadTime: 4,
    aidaNext: ['capital-corridors', 'peer-benchmark-ticker'],
    description: 'HNWI demographic and wealth composition'
  },
  {
    id: 'capital-corridors',
    title: 'Capital Flow Corridors',
    category: 'peer-intelligence',
    component: Page3PeerIntelligence,
    componentProps: { sections: ['corridor'] },
    shouldRender: () => true,
    estimatedReadTime: 3,
    aidaNext: ['geographic-distribution', 'hnwi-trends'],
    description: 'Cross-border capital movement patterns'
  },
  {
    id: 'geographic-distribution',
    title: 'Geographic Distribution',
    category: 'peer-intelligence',
    component: Page3PeerIntelligence,
    componentProps: { sections: ['geographic'] },
    shouldRender: () => true,
    estimatedReadTime: 2,
    aidaNext: ['hnwi-trends'],
    description: 'Regional HNWI concentration analysis'
  },
  {
    id: 'hnwi-trends',
    title: 'HNWI Migration Trends',
    category: 'peer-intelligence',
    component: HNWITrendsSection,
    // CRITICAL FIX: Match War Room conditional logic - check if trends data exists
    shouldRender: (data) => !!(data.preview_data.hnwi_trends && data.preview_data.hnwi_trends.length > 0),
    estimatedReadTime: 4,
    aidaNext: ['peer-benchmark-ticker', 'golden-visa-intelligence'],
    description: 'Global wealth migration patterns and forecasts'
  },
  {
    id: 'peer-benchmark-ticker',
    title: 'Pattern Intelligence',
    category: 'risk-analysis',
    component: PeerBenchmarkTicker,
    shouldRender: (data) => {
      const doctrineMetadata = data.preview_data.scenario_tree_data?.doctrine_metadata;
      const hasFailureModes = !!(doctrineMetadata && doctrineMetadata.failure_modes?.length);
      const hasPatternIntel = !!data.preview_data.pattern_intelligence;
      return hasFailureModes || hasPatternIntel;
    },
    estimatedReadTime: 2,
    aidaNext: ['structure-comparison', 'liquidity-trap'],
    description: 'Corridor intelligence match and failure mode analysis'
  },

  // CATEGORY 4: RISK ANALYSIS
  {
    id: 'liquidity-trap',
    title: 'Liquidity Trap Analysis',
    category: 'risk-analysis',
    component: LiquidityTrapFlowchart,
    // CRITICAL FIX: Match War Room conditional logic - check if acquisition audit exists
    shouldRender: (data) => {
      const crossBorderAudit = data.preview_data.wealth_projection_data?.starting_position?.cross_border_audit_summary;
      return !!crossBorderAudit?.acquisition_audit;
    },
    estimatedReadTime: 4,
    aidaNext: ['transparency-regime', 'real-asset-audit'],
    description: 'ABSD, stamp duty, and exit tax analysis'
  },
  {
    id: 'transparency-regime',
    title: 'Transparency & Compliance',
    category: 'risk-analysis',
    component: TransparencyRegimeSection,
    // CRITICAL FIX: Match War Room conditional logic - check if transparency data exists
    shouldRender: (data) => !!(data.preview_data.transparency_data || data.preview_data.transparency_regime_impact),
    estimatedReadTime: 5,
    aidaNext: ['crisis-resilience', 'real-asset-audit'],
    description: 'FATCA, CRS, and AML reporting requirements'
  },
  {
    id: 'real-asset-audit',
    title: 'Real Asset Audit',
    category: 'risk-analysis',
    component: RealAssetAuditSection,
    // CRITICAL FIX: Match War Room conditional logic - check if real asset audit data exists
    shouldRender: (data) => !!data.preview_data.real_asset_audit,
    estimatedReadTime: 6,
    aidaNext: ['crisis-resilience', 'structure-comparison'],
    description: 'Property-specific risks and loopholes'
  },
  {
    id: 'crisis-resilience',
    title: 'Crisis Stress Test',
    category: 'risk-analysis',
    component: CrisisResilienceSection,
    // CRITICAL FIX: Match War Room conditional logic - check if crisis data exists
    shouldRender: (data) => !!(data.preview_data.crisis_data || data.preview_data.crisis_resilience_stress_test),
    estimatedReadTime: 4,
    aidaNext: ['scenario-tree', 'structure-comparison'],
    description: 'Portfolio resilience under adverse scenarios'
  },

  // CATEGORY 5: WEALTH STRUCTURING
  {
    id: 'golden-visa-intelligence',
    title: 'Golden Visa Intelligence',
    category: 'wealth-structuring',
    component: GoldenVisaIntelligenceSection,
    shouldRender: (data) => Boolean(
      data.preview_data.golden_visa_intelligence?.exists ??
      data.preview_data.golden_visa_intelligence?.program_name
    ),
    estimatedReadTime: 5,
    aidaNext: ['structure-comparison', 'heir-management'],
    description: 'KGv3-powered residency program analysis'
  },
  {
    id: 'golden-visa-basic',
    title: 'Golden Visa Programs',
    category: 'wealth-structuring',
    component: GoldenVisaSection,
    shouldRender: (data) => {
      const hasKGv3 = Boolean(
        data.preview_data.golden_visa_intelligence?.exists ??
        data.preview_data.golden_visa_intelligence?.program_name
      );
      const hasVisaPrograms = !!(data.preview_data.destination_drivers?.visa_programs?.length);
      return !hasKGv3 && hasVisaPrograms;
    },
    estimatedReadTime: 3,
    aidaNext: ['structure-comparison', 'heir-management'],
    description: 'Basic residency program comparison'
  },
  {
    id: 'structure-comparison',
    title: 'Structure Optimization',
    category: 'wealth-structuring',
    component: StructureComparisonMatrix,
    shouldRender: (data) => !!(
      data.preview_data.structure_optimization
      && Array.isArray(data.preview_data.structure_optimization.structures_analyzed)
      && data.preview_data.structure_optimization.structures_analyzed.length > 0
    ),
    estimatedReadTime: 4,
    aidaNext: ['heir-management', 'scenario-tree'],
    description: 'Ownership structure analysis and comparison matrix'
  },
  {
    id: 'heir-management',
    title: 'Succession Planning',
    category: 'wealth-structuring',
    component: HeirManagementSection,
    // CRITICAL FIX: Match War Room conditional logic - check if heir management data exists
    shouldRender: (data) => !!(data.preview_data.heir_management_analysis ||
                              (data.preview_data.heir_management_data &&
                               Object.keys(data.preview_data.heir_management_data).length > 0)),
    estimatedReadTime: 5,
    aidaNext: ['scenario-tree', 'tax-implementation'],
    description: 'Inter-generational wealth transfer strategy'
  },

  // CATEGORY 6: SCENARIO PLANNING
  {
    id: 'scenario-tree',
    title: 'Decision Tree Analysis',
    category: 'scenario-planning',
    component: ScenarioTreeSection,
    // CRITICAL FIX: Match War Room conditional logic - check if scenario tree data exists
    shouldRender: (data) => !!(data.preview_data.scenario_tree_analysis ||
                              (data.preview_data.scenario_tree_data &&
                               Object.keys(data.preview_data.scenario_tree_data).length > 0)),
    estimatedReadTime: 6,
    aidaNext: ['tax-implementation', 'references'],
    description: 'Decision pathways and failure mode analysis'
  },

  // CATEGORY 7: IMPLEMENTATION & SOURCES
  {
    id: 'tax-implementation',
    title: 'Implementation Roadmap',
    category: 'implementation',
    component: Page1TaxDashboard,
    componentProps: { sections: ['implementation'] },
    shouldRender: (data) => !!(data.preview_data.execution_sequence?.length),
    estimatedReadTime: 3,
    aidaNext: ['references', 'regulatory-sources'],
    description: 'Step-by-step execution plan'
  },
  {
    id: 'references',
    title: 'Legal References',
    category: 'implementation',
    component: ReferencesSection,
    // CRITICAL FIX: Match War Room conditional logic - check if legal references exist
    shouldRender: (data) => !!(data.preview_data.legal_references && (data.preview_data.legal_references.total_count ?? 0) > 0),
    estimatedReadTime: 2,
    aidaNext: ['regulatory-sources'],
    description: 'Legal citations and sources'
  },
  {
    id: 'regulatory-sources',
    title: 'Regulatory Sources',
    category: 'implementation',
    component: RegulatorySourcesSection,
    // CRITICAL FIX: Match War Room conditional logic - check if regulatory citations exist
    shouldRender: (data) => {
      const regulatoryCitations = data.preview_data.regulatory_citations ||
                                  data.preview_data.legal_references?.regulatory_sources ||
                                  [];
      return Array.isArray(regulatoryCitations) && regulatoryCitations.length > 0;
    },
    estimatedReadTime: 2,
    aidaNext: [],
    description: 'Official regulatory documentation'
  }
];

// Helper functions
export function getSectionsByCategory(categoryId: CategoryId, memoData: PdfMemoData): SectionDefinition[] {
  if (memoData.preview_data.house_grade_memo) {
    return HOUSE_GRADE_WAR_VIEW_SECTION_IDS
      .map((id) => SECTIONS.find((section) => section.id === id))
      .filter((section): section is SectionDefinition => section !== undefined)
      .filter((section) => section.category === categoryId && section.shouldRender(memoData));
  }
  return SECTIONS.filter(
    section => section.category === categoryId && section.shouldRender(memoData)
  );
}

export function getSectionById(sectionId: string): SectionDefinition | undefined {
  if (sectionId === 'house-governed-memo') {
    return SECTIONS.find(section => section.id === 'house-signal');
  }
  return SECTIONS.find(section => section.id === sectionId);
}

export function getAllVisibleSections(memoData: PdfMemoData): SectionDefinition[] {
  if (memoData.preview_data.house_grade_memo) {
    return HOUSE_GRADE_WAR_VIEW_SECTION_IDS
      .map((id) => SECTIONS.find((section) => section.id === id))
      .filter((section): section is SectionDefinition => section !== undefined)
      .filter((section) => section.shouldRender(memoData));
  }
  return SECTIONS.filter(section => section.shouldRender(memoData));
}

export function getNextSuggestion(currentSectionId: string, memoData: PdfMemoData): SectionDefinition | undefined {
  const currentSection = getSectionById(currentSectionId);
  if (!currentSection || !currentSection.aidaNext || currentSection.aidaNext.length === 0) {
    return undefined;
  }

  // Find first suggested section that can render
  for (const nextId of currentSection.aidaNext) {
    const nextSection = getSectionById(nextId);
    if (nextSection && nextSection.shouldRender(memoData)) {
      return nextSection;
    }
  }

  return undefined;
}
