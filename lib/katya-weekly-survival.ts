import { secureApi } from "@/lib/secure-api"
import type {
  KatyaEventInput,
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

const normalizeWeeklySurvivalDashboard = (
  response: unknown,
  _query: WeeklySurvivalQuery,
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
    const message =
      typeof (response as Record<string, any>).message === "string"
        ? (response as Record<string, any>).message
        : "Kingdom returned a compatibility response before the weekly survival adapter is populated."
    throw new Error(`Source unavailable: /api/katya/weekly-survival-dashboard. ${message}`)
  }

  throw new Error("Source unavailable: /api/katya/weekly-survival-dashboard returned an unexpected payload")
}
