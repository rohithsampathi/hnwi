export type SourceStatus = "logged" | "logged_zero" | "not_logged_yet"

export interface MetricValue {
  value: number | null
  unit: string
  source_status: SourceStatus
}

export interface ScoreValue {
  value: number | null
  source_status: SourceStatus
  components: Record<string, number>
  interpretation: string
}

export interface FunnelStep extends MetricValue {
  key: string
}

export interface FunnelConversion {
  from: string
  to: string
  rate: MetricValue
}

export interface FunnelData {
  steps: FunnelStep[]
  conversions: FunnelConversion[]
}

export interface TopPerson {
  person_name: string
  person_url: string
  company: string
  role: string
  segment: string
  target_fit_score: number | null
  event_count: number
  last_outcome_atom: string
  last_timestamp: string
}

export interface TopPost {
  post_id: string
  post_title: string
  source_reference: string
  event_count: number
  target_fit_engagement: number
  weak_fit_engagement: number
}

export interface DeviationFlag {
  flag: string
  severity: string
  what_happened: string
  why_it_matters: string
  owner: string
  next_correction: string
}

export interface NextMove {
  owner: string
  action: string
  proof_condition: string
  kill_or_advance_condition: string
  next_review_time: string
}

export interface LiveEvent {
  id: string
  timestamp: string
  engine: string
  channel: string
  event_type: string
  person_name: string
  person_url: string
  company: string
  role: string
  segment: string
  target_fit_score: number | null
  target_fit_reason: string
  commander_owner: string
  action_taken: string
  expected_signal: string
  actual_signal: string
  outcome_atom: string
  revenue_amount: number
  notes: string
  source_reference: string
  post_id: string
  post_title: string
  call_id: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface TargetQualitySummary {
  strongest_profiles_engaged: TopPerson[]
  weak_profiles_seen: TopPerson[]
  rooms_getting_warmer: Array<[string, number]>
}

export interface WeeklyMetricGroup {
  period: {
    start: string
    end: string
  }
  status: string
  money_proof: Record<string, MetricValue>
  commercial_pull: Record<string, MetricValue>
  popularity_momentum: Record<string, MetricValue>
  target_quality: TargetQualitySummary
  funnel: FunnelData
  paying_off_score: ScoreValue
  popularity_score: ScoreValue
  deviation_flags: DeviationFlag[]
  top_people: TopPerson[]
  top_posts: TopPost[]
  next_3_moves: NextMove[]
  live_event_stream: LiveEvent[]
}

export interface WeekComparisonItem {
  current: number | null
  previous: number | null
  delta: number | null
}

export interface WeeklySurvivalDashboardResponse {
  screen_name: string
  generated_at: string
  source: Record<string, unknown>
  week: {
    start: string
    end: string
    timezone: string
    event_count: number
    coverage_status: string
  }
  current_week_metrics: WeeklyMetricGroup
  previous_week_metrics: WeeklyMetricGroup
  week_comparison: Record<string, WeekComparisonItem>
  funnel: FunnelData
  paying_off_score: ScoreValue
  popularity_score: ScoreValue
  deviation_flags: DeviationFlag[]
  top_people: TopPerson[]
  top_posts: TopPost[]
  next_3_moves: NextMove[]
  live_event_stream: LiveEvent[]
}

export interface KatyaEventInput {
  timestamp: string
  engine: string
  channel: string
  event_type?: string
  outcome_atom: string
  person_name?: string
  person_url?: string
  company?: string
  role?: string
  segment?: string
  target_fit_score?: number | null
  target_fit_reason?: string
  commander_owner?: string
  action_taken?: string
  expected_signal?: string
  actual_signal?: string
  revenue_amount?: number | null
  notes?: string
  source_reference?: string
  post_id?: string
  post_title?: string
  call_id?: string
  metadata?: Record<string, unknown>
}
