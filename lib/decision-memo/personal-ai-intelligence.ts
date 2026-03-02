import { PdfMemoData } from '@/lib/pdf/pdf-types';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'RECOMMENDED' | 'OPTIONAL';
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export interface PersonalRecommendation {
  priority: PriorityLevel;
  sectionId: string;
  sectionTitle: string;
  reason: string;
  aiMessage: string;
  icon: string;
  color: string;
  urgency: number; // 1-10
}

export interface PersonalInsight {
  type: 'warning' | 'opportunity' | 'info' | 'success';
  message: string;
  value?: string;
  action?: string;
}

export interface PersonalAnalysisState {
  status: 'initializing' | 'analyzing' | 'ready' | 'complete';
  progress: number;
  currentModule: string;
  insights: PersonalInsight[];
  recommendations: PersonalRecommendation[];
  riskLevel: RiskLevel;
}

/**
 * Personal AI Intelligence Engine
 * Analyzes audit data and provides contextual recommendations
 */
export class PersonalAI {
  private memoData: PdfMemoData;
  private viewedSections: Set<string>;

  constructor(memoData: PdfMemoData, viewedSections: Set<string>) {
    this.memoData = memoData;
    this.viewedSections = viewedSections;
  }

  /**
   * Get overall risk level from audit data
   */
  getRiskLevel(): RiskLevel {
    const verdict = this.memoData.preview_data.structure_optimization?.verdict;
    const exposureClass = this.memoData.preview_data.exposure_class;
    const mistakes = this.memoData.preview_data.all_mistakes || [];

    // Check for DO_NOT_PROCEED verdict
    if (verdict === 'DO_NOT_PROCEED') {
      return 'CRITICAL';
    }

    // Check for high-severity mistakes
    const criticalMistakes = mistakes.filter((m: any) =>
      m.urgency?.toLowerCase().includes('critical')
    );
    if (criticalMistakes.length > 0) {
      return 'CRITICAL';
    }

    // Check exposure class
    if (exposureClass?.toLowerCase().includes('high')) {
      return 'HIGH';
    }

    // Check for multiple high-priority mistakes
    const highMistakes = mistakes.filter((m: any) =>
      m.urgency?.toLowerCase().includes('high')
    );
    if (highMistakes.length >= 3) {
      return 'HIGH';
    }

    if (highMistakes.length > 0) {
      return 'MODERATE';
    }

    return 'LOW';
  }

  /**
   * Get contextual recommendation based on current state
   */
  getRecommendation(): PersonalRecommendation {
    const riskLevel = this.getRiskLevel();
    const totalSavings = this.memoData.preview_data.total_savings;
    const verdict = this.memoData.preview_data.structure_optimization?.verdict;

    // CRITICAL: Risk assessment not viewed
    if (!this.viewedSections.has('risk-radar') && riskLevel === 'CRITICAL') {
      return {
        priority: 'CRITICAL',
        sectionId: 'risk-radar',
        sectionTitle: 'Risk Radar Analysis',
        reason: 'Critical risk factors detected in preliminary analysis',
        aiMessage: 'Sir, I\'ve detected elevated risk factors in the audit data. Immediate review of the Risk Radar recommended.',
        icon: '🔴',
        color: '#EF4444',
        urgency: 10
      };
    }

    // CRITICAL: Verdict is DO_NOT_PROCEED
    if (!this.viewedSections.has('audit-verdict') && verdict === 'DO_NOT_PROCEED') {
      return {
        priority: 'CRITICAL',
        sectionId: 'audit-verdict',
        sectionTitle: 'Audit Verdict',
        reason: 'Structure optimization analysis flagged for immediate review',
        aiMessage: 'Sir, the preliminary verdict requires your immediate attention. Critical structural issues identified.',
        icon: '⚠️',
        color: '#EF4444',
        urgency: 10
      };
    }

    // HIGH: Large tax savings available
    if (!this.viewedSections.has('tax-dashboard-analysis') && totalSavings) {
      const savingsNum = parseFloat(totalSavings.replace(/[^0-9.]/g, ''));
      if (savingsNum > 1000000) {
        return {
          priority: 'HIGH',
          sectionId: 'tax-dashboard-analysis',
          sectionTitle: 'Tax Jurisdiction Analysis',
          reason: `$${(savingsNum / 1000000).toFixed(1)}M in tax optimization detected`,
          aiMessage: `Sir, I've identified significant tax optimization opportunities. ${totalSavings} in potential savings detected across jurisdictions.`,
          icon: '💰',
          color: '#D4A843',
          urgency: 9
        };
      }
    }

    // HIGH: Liquidity trap analysis available
    if (!this.viewedSections.has('liquidity-trap') &&
        this.memoData.preview_data.liquidity_trap_analysis) {
      return {
        priority: 'HIGH',
        sectionId: 'liquidity-trap',
        sectionTitle: 'Liquidity Trap Analysis',
        reason: 'Capital restriction patterns detected',
        aiMessage: 'Sir, analyzing potential liquidity barriers. ABSD and exit restrictions require review.',
        icon: '🔒',
        color: '#F59E0B',
        urgency: 8
      };
    }

    // RECOMMENDED: Cross-border analysis
    if (!this.viewedSections.has('cross-border-audit') &&
        this.memoData.preview_data.cross_border_audit) {
      return {
        priority: 'RECOMMENDED',
        sectionId: 'cross-border-audit',
        sectionTitle: 'Cross-Border Tax Audit',
        reason: 'Multi-jurisdiction compliance analysis available',
        aiMessage: 'Sir, cross-border tax implications are ready for review. Compliance requirements across jurisdictions mapped.',
        icon: '🌍',
        color: '#3B82F6',
        urgency: 7
      };
    }

    // RECOMMENDED: Peer intelligence
    if (!this.viewedSections.has('peer-cohort') &&
        this.memoData.preview_data.peer_benchmarks) {
      return {
        priority: 'RECOMMENDED',
        sectionId: 'peer-cohort',
        sectionTitle: 'Peer Cohort Analysis',
        reason: 'HNWI peer transaction data available',
        aiMessage: 'Sir, peer intelligence analysis is complete. Precedent transactions from similar profiles ready for review.',
        icon: '👥',
        color: '#8B5CF6',
        urgency: 6
      };
    }

    // RECOMMENDED: Golden visa if available
    if (!this.viewedSections.has('golden-visa-intelligence') &&
        this.memoData.preview_data.golden_visa_intelligence?.exists) {
      return {
        priority: 'RECOMMENDED',
        sectionId: 'golden-visa-intelligence',
        sectionTitle: 'Golden Visa Intelligence',
        reason: 'Residency program options analyzed',
        aiMessage: 'Sir, alternative residency pathways have been mapped. Investment migration options available for review.',
        icon: '✈️',
        color: '#10B981',
        urgency: 5
      };
    }

    // DEFAULT: Continue with AIDA flow
    const unviewedSections = this.getUnviewedSections();
    if (unviewedSections.length > 0) {
      const next = unviewedSections[0];
      return {
        priority: 'OPTIONAL',
        sectionId: next.id,
        sectionTitle: next.title,
        reason: 'Continuing systematic analysis',
        aiMessage: `Sir, proceeding with ${next.title}. ${unviewedSections.length} modules remaining in comprehensive analysis.`,
        icon: '📊',
        color: '#6B7280',
        urgency: 3
      };
    }

    // ALL COMPLETE
    return {
      priority: 'OPTIONAL',
      sectionId: 'memo-header',
      sectionTitle: 'Executive Summary',
      reason: 'Analysis complete',
      aiMessage: 'Sir, comprehensive audit analysis is complete. All intelligence modules have been reviewed. Ready for decision synthesis.',
      icon: '✅',
      color: '#22C55E',
      urgency: 1
    };
  }

  /**
   * Get key insights from audit data
   */
  getInsights(): PersonalInsight[] {
    const insights: PersonalInsight[] = [];
    const totalSavings = this.memoData.preview_data.total_savings;
    const verdict = this.memoData.preview_data.structure_optimization?.verdict;
    const mistakes = this.memoData.preview_data.all_mistakes || [];

    // Tax savings insight
    if (totalSavings) {
      insights.push({
        type: 'opportunity',
        message: 'Tax optimization potential',
        value: totalSavings,
        action: 'Review tax analysis'
      });
    }

    // Risk insights
    const criticalMistakes = mistakes.filter((m: any) =>
      m.urgency?.toLowerCase().includes('critical')
    );
    if (criticalMistakes.length > 0) {
      insights.push({
        type: 'warning',
        message: `${criticalMistakes.length} critical risk factors detected`,
        action: 'View risk assessment'
      });
    }

    // Verdict insight
    if (verdict === 'DO_NOT_PROCEED') {
      insights.push({
        type: 'warning',
        message: 'Structure not recommended',
        action: 'Review verdict details'
      });
    } else if (verdict === 'PROCEED') {
      insights.push({
        type: 'success',
        message: 'Structure optimization passed',
        action: 'View recommendations'
      });
    }

    // Peer data insight
    const precedentCount = this.memoData.memo_data?.kgv3_intelligence_used?.precedents || 0;
    if (precedentCount > 0) {
      insights.push({
        type: 'info',
        message: `${precedentCount} precedent transactions analyzed`,
        action: 'View peer intelligence'
      });
    }

    return insights;
  }

  /**
   * Get unviewed sections
   */
  private getUnviewedSections(): Array<{ id: string; title: string }> {
    // Simplified - would use actual section map
    const allSections = [
      { id: 'memo-header', title: 'Executive Summary' },
      { id: 'audit-verdict', title: 'Audit Verdict' },
      { id: 'risk-radar', title: 'Risk Radar' },
      { id: 'tax-dashboard-analysis', title: 'Tax Analysis' },
      // ... etc
    ];

    return allSections.filter(s => !this.viewedSections.has(s.id));
  }

  /**
   * Get time-appropriate greeting
   */
  static getGreeting(firstName?: string): string {
    const hour = new Date().getHours();
    let timeGreeting = 'Good evening';

    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 18) timeGreeting = 'Good afternoon';

    if (firstName) {
      return `${timeGreeting}, ${firstName}`;
    }
    return `${timeGreeting}, Sir`;
  }

  /**
   * Get analysis status message
   */
  getAnalysisStatus(): string {
    const total = 24; // Total sections
    const viewed = this.viewedSections.size;
    const remaining = total - viewed;

    if (viewed === 0) {
      return 'Initializing comprehensive audit analysis...';
    } else if (viewed < total / 4) {
      return `Preliminary analysis in progress. ${remaining} modules queued.`;
    } else if (viewed < total / 2) {
      return `Analysis ${Math.round((viewed / total) * 100)}% complete. Patterns emerging.`;
    } else if (viewed < total) {
      return `Deep analysis phase. ${remaining} modules remaining.`;
    } else {
      return 'Comprehensive analysis complete. Ready for decision synthesis.';
    }
  }
}

/**
 * Get risk-aware UI theme
 */
export function getRiskTheme(riskLevel: RiskLevel) {
  switch (riskLevel) {
    case 'CRITICAL':
      return {
        borderColor: 'rgba(239, 68, 68, 0.3)',
        glowColor: 'rgba(239, 68, 68, 0.2)',
        accentColor: '#EF4444',
        textColor: 'text-red-500',
        bgColor: 'bg-red-500/10',
        message: 'CRITICAL RISK FACTORS DETECTED'
      };
    case 'HIGH':
      return {
        borderColor: 'rgba(245, 158, 11, 0.3)',
        glowColor: 'rgba(245, 158, 11, 0.2)',
        accentColor: '#F59E0B',
        textColor: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        message: 'ELEVATED RISK PROFILE'
      };
    case 'MODERATE':
      return {
        borderColor: 'rgba(59, 130, 246, 0.3)',
        glowColor: 'rgba(59, 130, 246, 0.2)',
        accentColor: '#3B82F6',
        textColor: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        message: 'MODERATE RISK FACTORS'
      };
    case 'LOW':
      return {
        borderColor: 'rgba(34, 197, 94, 0.3)',
        glowColor: 'rgba(34, 197, 94, 0.2)',
        accentColor: '#22C55E',
        textColor: 'text-green-500',
        bgColor: 'bg-green-500/10',
        message: 'LOW RISK PROFILE'
      };
  }
}
