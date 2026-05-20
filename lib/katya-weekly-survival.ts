import { secureApi } from "@/lib/secure-api"
import type {
  KatyaEventInput,
  ScoreValue,
  WeeklyMetricGroup,
  WeeklySurvivalDashboardResponse,
} from "@/types/katya-weekly-survival"

export interface WeeklySurvivalQuery {
  week_start?: string
  weekly_revenue_target?: number | null
}

const buildQueryString = (query: WeeklySurvivalQuery = {}) => {
  const params = new URLSearchParams()

  if (query.week_start) {
    params.set("week_start", query.week_start)
  }

  if (typeof query.weekly_revenue_target === "number" && Number.isFinite(query.weekly_revenue_target)) {
    params.set("weekly_revenue_target", String(query.weekly_revenue_target))
  }

  const encoded = params.toString()
  return encoded ? `?${encoded}` : ""
}

export const fetchWeeklySurvivalDashboard = async (
  query: WeeklySurvivalQuery = {},
  bustCache = false,
): Promise<WeeklySurvivalDashboardResponse> => {
  const response = await secureApi.get(
    `/api/katya/weekly-survival-dashboard${buildQueryString(query)}`,
    true,
    bustCache,
  )

  return normalizeWeeklySurvivalDashboard(response, query)
}

export const createKatyaEvent = async (payload: KatyaEventInput) => {
  return secureApi.post("/api/katya/events", payload, true)
}

const notLoggedScore = (): ScoreValue => ({
  value: null,
  source_status: "not_logged_yet",
  components: {},
  interpretation: "not_logged_yet",
})

const getDefaultWeekRange = (weekStart?: string) => {
  const start = weekStart ? new Date(weekStart) : new Date()

  if (Number.isNaN(start.getTime())) {
    return getDefaultWeekRange()
  }

  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

const emptyMetricGroup = (start: string, end: string): WeeklyMetricGroup => ({
  period: { start, end },
  status: "not_logged_yet",
  money_proof: {},
  commercial_pull: {},
  popularity_momentum: {},
  target_quality: {
    strongest_profiles_engaged: [],
    weak_profiles_seen: [],
    rooms_getting_warmer: [],
  },
  funnel: {
    steps: [],
    conversions: [],
  },
  paying_off_score: notLoggedScore(),
  popularity_score: notLoggedScore(),
  deviation_flags: [],
  top_people: [],
  top_posts: [],
  next_3_moves: [],
  live_event_stream: [],
})

const emptyWeeklySurvivalDashboard = (
  response: Record<string, any>,
  query: WeeklySurvivalQuery,
): WeeklySurvivalDashboardResponse => {
  const week = getDefaultWeekRange(query.week_start)
  const current = emptyMetricGroup(week.start, week.end)

  return {
    screen_name: "weekly_survival_proof",
    generated_at: response.generatedAt || new Date().toISOString(),
    source: {
      status: response.status || "kingdom_native_compatibility",
      kingdom_native: response.kingdom_native ?? true,
      message:
        response.message ||
        "Kingdom returned a compatibility response before the weekly survival adapter is populated.",
    },
    week: {
      start: week.start,
      end: week.end,
      timezone: "Asia/Kolkata",
      event_count: 0,
      coverage_status: "not_logged_yet",
    },
    current_week_metrics: current,
    previous_week_metrics: emptyMetricGroup(week.start, week.end),
    week_comparison: {},
    funnel: current.funnel,
    paying_off_score: current.paying_off_score,
    popularity_score: current.popularity_score,
    deviation_flags: [],
    top_people: [],
    top_posts: [],
    next_3_moves: [],
    live_event_stream: [],
  }
}

const normalizeWeeklySurvivalDashboard = (
  response: unknown,
  query: WeeklySurvivalQuery,
): WeeklySurvivalDashboardResponse => {
  if (response && typeof response === "object" && "current_week_metrics" in response) {
    return response as WeeklySurvivalDashboardResponse
  }

  if (
    response &&
    typeof response === "object" &&
    (response as Record<string, any>).kingdom_native === true &&
    (response as Record<string, any>).status === "kingdom_native_compatibility"
  ) {
    return emptyWeeklySurvivalDashboard(response as Record<string, any>, query)
  }

  throw new Error("Weekly survival dashboard payload did not match the expected contract")
}
