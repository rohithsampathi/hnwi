// types/assessment-report.ts
// Enhanced Assessment Report Data Structures

export interface EnhancedReportData {
  session_id: string;
  user_id: string;
  generated_at: string;

  // Executive Summary
  executive_summary: ExecutiveSummary;

  // Spider Graphs
  spider_graphs: {
    peer_comparison: SpiderGraphData;
    opportunity_alignment: SpiderGraphData;
  };

  // Missed Opportunities
  missed_opportunities: MissedOpportunitiesData;

  // Celebrity Opportunities
  celebrity_opportunities: CelebrityOpportunity[];

  // Peer Analysis
  peer_analysis: PeerComparisonData;

  // Visual Analytics
  visualizations: {
    performance_timeline: TimelineData[];
    geographic_heatmap: GeographicData;
  };

  // Actionable Insights
  strategic_insights: StrategicInsight[];
}

export interface ExecutiveSummary {
  tier: string;
  percentile: number;
  net_worth_estimate: string;
  peer_group_size: number; // Real: HNWI World development count
  opportunities_accessible: number;
  opportunities_missed: number;
  optimization_potential: number; // 0-1 scale - calculated from actual spider graph gaps
  confidence_score: number;
  mental_models_applied?: string | null; // e.g., "14 out of 15 mental models"
  sophistication_score?: string | null; // Average from forensic validation
}

export interface SpiderGraphData {
  dimensions: string[];
  user_scores: number[]; // 0-1 scale
  peer_average: number[];
  top_performers: number[];
  improvement_areas: ImprovementArea[];
  hnwi_world_count?: number; // Number of HNWI World developments used for benchmarking
  overall_score?: number;
  peer_rank_percentile?: number;
  tier?: string;
}

export interface ImprovementArea {
  dimension: string;
  current_score: number;
  target_score: number;
  gap: number;
  improvement_potential: number; // percentage
  actionable_steps: string[];
}

export interface MissedOpportunitiesData {
  top_missed: MissedOpportunity[];
  total_missed_value: number;
  missed_by_category: Record<string, number>;
  total_opportunities_analyzed: number;
}

export interface MissedOpportunity {
  opportunity: {
    id: string;
    title: string;
    category: string;
    location: string;
    tier: string;
    value: string;
    risk: string;
  };
  question_context: {
    question_id: string;
    question_title: string;
    your_choice: string;
    winning_choice: string;
  };
  peer_performance: {
    adoption_count: number;
    adoption_rate: number; // percentage
    avg_roi: number;
    success_rate: number;
  };
  financial_impact: {
    missed_value: number;
    potential_roi: number;
    time_to_roi: string;
  };
  why_missed: string;
  action_required: string;
}

export interface CelebrityOpportunity {
  opportunity: {
    id: string;
    title: string;
    category: string;
    location: string;
    value: string;
  };
  top_performer_stats: {
    adopter_count: number;
    avg_performance_percentile: number;
    success_stories: string[];
  };
  financial_metrics: {
    avg_roi: number;
    median_investment: number;
    time_horizon: string;
  };
  alignment_score: number;
  why_valuable: string[];
}

export interface PeerComparisonData {
  cohort_definition: {
    size: number;
    tier: string;
    net_worth_range: string;
    age_range: string;
    geographic_region: string;
  };
  your_percentile: number;
  performance_metrics: {
    [metric: string]: MetricComparison;
  };
  behavioral_insights: BehavioralComparison;
}

export interface MetricComparison {
  metric_name: string;
  your_value: number;
  peer_median: number;
  peer_top_quartile: number;
  peer_top_decile: number;
  percentile: number;
  trend: 'above' | 'at' | 'below';
}

export interface BehavioralComparison {
  decision_speed: MetricComparison;
  risk_appetite: MetricComparison;
  diversification_index: MetricComparison;
  network_leverage: MetricComparison;
}

export interface TimelineData {
  year: number;
  projected_roi: number;
  confidence_interval: {
    low: number;
    high: number;
  };
  peer_benchmark: number;
  opportunities_available: number;
  key_milestones: string[];
}

export interface GeographicData {
  regions: {
    [region: string]: RegionMetrics;
  };
  recommended_regions: string[];
  underexplored_regions: string[];
}

export interface RegionMetrics {
  opportunity_count: number;
  avg_roi: number;
  alignment_score: number;
  peer_activity: number;
  risk_level: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface StrategicInsight {
  type: 'opportunity' | 'risk' | 'timing' | 'network' | 'optimization';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: {
    financial: number;
    strategic: string;
  };
  action_items: ActionItem[];
  time_sensitivity: string;
}

export interface ActionItem {
  step: string;
  estimated_time: string;
  difficulty: 'easy' | 'moderate' | 'complex';
  expected_outcome: string;
}

// Visualization Helper Types
export interface ChartDimension {
  label: string;
  value: number;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

export interface ComparisonBar {
  category: string;
  your_value: number;
  peer_average: number;
  top_performer: number;
  unit: string;
}
