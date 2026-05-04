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
  return secureApi.get(
    `/api/katya/weekly-survival-dashboard${buildQueryString(query)}`,
    true,
    bustCache,
  ) as Promise<WeeklySurvivalDashboardResponse>
}

export const createKatyaEvent = async (payload: KatyaEventInput) => {
  return secureApi.post("/api/katya/events", payload, true)
}
