"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarRange,
  CircleAlert,
  CircleDashed,
  CircleDollarSign,
  Loader2,
  RefreshCcw,
  Signal,
  TrendingUp,
  UserPlus,
  Waves,
} from "lucide-react"
import { format, formatDistanceToNowStrict } from "date-fns"
import { CrownLoader } from "@/components/ui/crown-loader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { createKatyaEvent, fetchWeeklySurvivalDashboard } from "@/lib/katya-weekly-survival"
import { cn, formatCurrency } from "@/lib/utils"
import type {
  DeviationFlag,
  FunnelConversion,
  FunnelStep,
  KatyaEventInput,
  LiveEvent,
  MetricValue,
  NextMove,
  ScoreValue,
  TopPerson,
  TopPost,
  WeeklySurvivalDashboardResponse,
} from "@/types/katya-weekly-survival"

const AUTO_REFRESH_INTERVAL_MS = 45_000
const REVENUE_TARGET_STORAGE_KEY = "katya-weekly-revenue-target"

const EVENT_OPTIONS = [
  "request_sent",
  "request_accepted",
  "note_sent",
  "dm_sent",
  "reply",
  "multi_reply",
  "doc_sent",
  "call_booked",
  "call_done",
  "scope_requested",
  "audit_requested",
  "decision_review_requested",
  "paid_start",
  "revenue_collected",
  "new_follower",
  "post_like",
  "post_comment",
  "post_repost",
  "profile_view",
  "post_impression",
  "send_more_signal",
  "lets_speak_signal",
  "serious_follow_up",
  "hold",
  "kill",
  "weak_fit",
] as const

const CHANNEL_OPTIONS = ["LinkedIn", "WhatsApp", "call", "email", "post", "manual"] as const

const SCORE_COLOR_MAP: Record<string, string> = {
  green: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-100 border-amber-500/30",
  red: "bg-rose-500/15 text-rose-100 border-rose-500/30",
  rising_fast: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
  rising: "bg-sky-500/15 text-sky-100 border-sky-500/30",
  flat_or_unproven: "bg-slate-500/15 text-slate-200 border-slate-500/30",
  not_logged_yet: "bg-slate-500/10 text-slate-300 border-slate-500/20",
}

const FLAG_COLOR_MAP: Record<string, string> = {
  red: "border-rose-500/35 bg-rose-500/8",
  amber: "border-amber-500/35 bg-amber-500/8",
  green: "border-emerald-500/35 bg-emerald-500/8",
}

const emptyEventForm = (): KatyaEventInput => ({
  timestamp: toLocalDateTimeInputValue(new Date()),
  engine: "HNWI",
  channel: "manual",
  outcome_atom: "request_sent",
  commander_owner: "Katya",
  person_name: "",
  company: "",
  role: "",
  segment: "",
  target_fit_score: 70,
  notes: "",
  revenue_amount: null,
  source_reference: "manual_dashboard_log",
})

export function WeeklySurvivalDashboard() {
  const [dashboard, setDashboard] = useState<WeeklySurvivalDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSuccessAt, setLastSuccessAt] = useState<string | null>(null)
  const [revenueTargetInput, setRevenueTargetInput] = useState("")
  const [appliedRevenueTarget, setAppliedRevenueTarget] = useState<number | null>(null)
  const [eventForm, setEventForm] = useState<KatyaEventInput>(emptyEventForm)
  const [eventPending, setEventPending] = useState(false)
  const [eventStatus, setEventStatus] = useState<string | null>(null)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const stored = window.localStorage.getItem(REVENUE_TARGET_STORAGE_KEY)
    if (stored) {
      setRevenueTargetInput(stored)
      const parsed = Number(stored)
      setAppliedRevenueTarget(Number.isFinite(parsed) ? parsed : null)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    if (revenueTargetInput.trim()) {
      window.localStorage.setItem(REVENUE_TARGET_STORAGE_KEY, revenueTargetInput.trim())
    } else {
      window.localStorage.removeItem(REVENUE_TARGET_STORAGE_KEY)
    }
  }, [revenueTargetInput])

  const weeklyRevenueTarget = useMemo(() => {
    const trimmed = revenueTargetInput.trim()
    if (!trimmed) {
      return null
    }

    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : null
  }, [revenueTargetInput])

  const loadDashboard = useCallback(async (bustCache = false, targetOverride?: number | null) => {
    const isFirstLoad = !hasLoadedRef.current

    if (isFirstLoad) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }

    try {
      const response = await fetchWeeklySurvivalDashboard(
        {
          weekly_revenue_target: targetOverride ?? appliedRevenueTarget,
        },
        bustCache,
      )

      setDashboard(response)
      setError(null)
      const stamp = new Date().toISOString()
      setLastSuccessAt(stamp)
    } catch (loadError: any) {
      const detail = loadError?.detail?.error || loadError?.message || "Failed to load weekly survival proof"
      setError(detail)
    } finally {
      hasLoadedRef.current = true
      setLoading(false)
      setRefreshing(false)
    }
  }, [appliedRevenueTarget])

  useEffect(() => {
    loadDashboard(true)
  }, [loadDashboard])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadDashboard(true)
    }, AUTO_REFRESH_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [loadDashboard])

  const handleEventField = <K extends keyof KatyaEventInput>(key: K, value: KatyaEventInput[K]) => {
    setEventForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleLogEvent = async () => {
    setEventPending(true)
    setEventStatus(null)

    try {
      const payload: KatyaEventInput = {
        ...eventForm,
        event_type: eventForm.outcome_atom,
        actual_signal: eventForm.actual_signal || eventForm.outcome_atom,
        timestamp: new Date(eventForm.timestamp).toISOString(),
        revenue_amount:
          typeof eventForm.revenue_amount === "number" && Number.isFinite(eventForm.revenue_amount)
            ? eventForm.revenue_amount
            : undefined,
        target_fit_score:
          typeof eventForm.target_fit_score === "number" && Number.isFinite(eventForm.target_fit_score)
            ? eventForm.target_fit_score
            : undefined,
      }

      await createKatyaEvent(payload)
      setEventStatus("Event logged.")
      setEventForm(emptyEventForm())
      await loadDashboard(true)
    } catch (submitError: any) {
      const detail = submitError?.detail?.detail || submitError?.detail?.error || submitError?.message || "Failed to log event"
      setEventStatus(detail)
    } finally {
      setEventPending(false)
    }
  }

  if (loading && !dashboard) {
    return (
      <div className="flex min-h-[calc(100dvh-5rem)] items-center justify-center px-6">
        <CrownLoader size="lg" text="Loading Weekly Survival Proof..." />
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-3xl items-center justify-center px-6">
        <Card className="w-full rounded-2xl border border-rose-500/25 bg-slate-950/75">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <CircleAlert className="h-10 w-10 text-rose-300" />
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-white">Weekly survival proof unavailable</h1>
              <p className="text-sm text-slate-300">{error || "No dashboard payload returned."}</p>
            </div>
            <Button onClick={() => loadDashboard(true)}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const current = dashboard.current_week_metrics
  const statusTone = current.status || dashboard.paying_off_score.interpretation || "not_logged_yet"

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-[#061018] text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <header className="grid gap-4 border-b border-white/8 pb-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={cn("rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em]", SCORE_COLOR_MAP[statusTone] || SCORE_COLOR_MAP.not_logged_yet)}>
                {statusTone.replaceAll("_", " ")}
              </Badge>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CalendarRange className="h-4 w-4" />
                <span>{formatWeekRange(dashboard.week.start, dashboard.week.end)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <RefreshCcw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                <span>{lastSuccessAt ? `Last refresh ${formatDistanceToNowStrict(new Date(lastSuccessAt), { addSuffix: true })}` : "Waiting for first refresh"}</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Weekly Survival Proof</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                This is the operating screen. It shows whether the week is producing money, whether the right room is warming, and where the funnel is leaking.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <HeaderMetric
              icon={CircleDollarSign}
              label="Weekly revenue target"
              value={appliedRevenueTarget ? formatCurrency(appliedRevenueTarget) : "Not set"}
              detail="Used to weight the paying-off score"
            />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                Revenue target input
              </label>
              <div className="flex gap-2">
                <Input
                  inputMode="decimal"
                  placeholder="5000"
                  value={revenueTargetInput}
                  onChange={(event) => setRevenueTargetInput(event.target.value)}
                  className="h-11 rounded-2xl border border-white/10 bg-slate-950/70 text-white"
                />
                <Button
                  className="h-11 rounded-2xl px-5"
                  onClick={() => {
                    setAppliedRevenueTarget(weeklyRevenueTarget)
                    loadDashboard(true, weeklyRevenueTarget)
                  }}
                >
                  Apply
                </Button>
              </div>
              {error ? (
                <p className="mt-2 text-xs text-amber-200">Showing last good state. Refresh issue: {error}</p>
              ) : null}
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <PayingOffPanel metrics={current.money_proof} score={dashboard.paying_off_score} />
          <PopularityPanel metrics={current.popularity_momentum} score={dashboard.popularity_score} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
          <FunnelPanel funnel={dashboard.funnel} />
          <ComparisonPanel comparison={dashboard.week_comparison} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <DeviationPanel flags={dashboard.deviation_flags} />
          <NextMovesPanel moves={dashboard.next_3_moves} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <TargetQualityPanel
            strongestProfiles={dashboard.current_week_metrics.target_quality.strongest_profiles_engaged}
            weakProfiles={dashboard.current_week_metrics.target_quality.weak_profiles_seen}
            rooms={dashboard.current_week_metrics.target_quality.rooms_getting_warmer}
          />
          <TopPostsPanel posts={dashboard.top_posts} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <LiveEventStream events={dashboard.live_event_stream} />
          <QuickLogPanel
            eventForm={eventForm}
            eventPending={eventPending}
            eventStatus={eventStatus}
            onFieldChange={handleEventField}
            onSubmit={handleLogEvent}
          />
        </section>
      </div>
    </div>
  )
}

function HeaderMetric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof CircleDollarSign
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</p>
          <p className="mt-2 text-xl font-semibold text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{detail}</p>
        </div>
        <Icon className="h-5 w-5 text-slate-300" />
      </div>
    </div>
  )
}

function PayingOffPanel({
  metrics,
  score,
}: {
  metrics: Record<string, MetricValue>
  score: ScoreValue
}) {
  return (
    <Card className="rounded-2xl border border-white/10 bg-[#0d1825]">
      <CardHeader className="border-b border-white/8 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Money proof</p>
            <CardTitle className="mt-2 text-2xl text-white">Is the week paying off?</CardTitle>
          </div>
          <ScoreBadge score={score} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <MetricTile icon={CircleDollarSign} label="Revenue collected" metric={metrics.revenue_collected} />
          <MetricTile icon={TrendingUp} label="Paid starts" metric={metrics.paid_starts} />
          <MetricTile icon={CalendarRange} label="Calls booked" metric={metrics.calls_booked} />
          <MetricTile icon={Signal} label="Calls completed" metric={metrics.calls_completed} />
          <MetricTile icon={Waves} label="Scope requests" metric={metrics.scope_requests} />
          <MetricTile icon={Activity} label="Open commercial conversations" metric={metrics.open_commercial_conversations} />
        </div>
        <ScoreBreakdown components={score.components} />
      </CardContent>
    </Card>
  )
}

function PopularityPanel({
  metrics,
  score,
}: {
  metrics: Record<string, MetricValue>
  score: ScoreValue
}) {
  return (
    <Card className="rounded-2xl border border-white/10 bg-[#0d1825]">
      <CardHeader className="border-b border-white/8 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Popularity momentum</p>
            <CardTitle className="mt-2 text-2xl text-white">Are the right people noticing us?</CardTitle>
          </div>
          <ScoreBadge score={score} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
        <MetricTile icon={UserPlus} label="New followers" metric={metrics.new_followers} compact />
        <MetricTile icon={TrendingUp} label="Post likes" metric={metrics.post_likes} compact />
        <MetricTile icon={Activity} label="Comments" metric={metrics.comments} compact />
        <MetricTile icon={Signal} label="Reposts" metric={metrics.reposts} compact />
        <MetricTile icon={Waves} label="Profile views" metric={metrics.profile_views} compact />
        <MetricTile icon={CircleDashed} label="Post impressions" metric={metrics.post_impressions} compact />
        <MetricTile icon={CircleDollarSign} label="Target-fit engagement" metric={metrics.target_fit_engagement} compact />
        <MetricTile icon={AlertTriangle} label="Weak-fit engagement" metric={metrics.weak_fit_engagement} compact />
      </CardContent>
    </Card>
  )
}

function MetricTile({
  icon: Icon,
  label,
  metric,
  compact = false,
}: {
  icon: typeof CircleDollarSign
  label: string
  metric?: MetricValue
  compact?: boolean
}) {
  return (
    <div className={cn("rounded-2xl border border-white/8 bg-slate-950/55 p-4", compact && "min-h-[108px]")}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</p>
          <p className="text-2xl font-semibold text-white">{renderMetricValue(metric)}</p>
          <SourceStatusLabel metric={metric} />
        </div>
        <Icon className="h-5 w-5 text-slate-300" />
      </div>
    </div>
  )
}

function ScoreBadge({ score }: { score: ScoreValue }) {
  return (
    <div className={cn("rounded-full border px-3 py-1.5 text-right text-sm font-semibold", SCORE_COLOR_MAP[score.interpretation] || SCORE_COLOR_MAP.not_logged_yet)}>
      <div>{score.value ?? "Not logged yet"}</div>
      <div className="text-[10px] uppercase tracking-[0.16em] opacity-80">{score.interpretation.replaceAll("_", " ")}</div>
    </div>
  )
}

function ScoreBreakdown({ components }: { components: Record<string, number> }) {
  const rows = Object.entries(components)

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/35 p-4 text-sm text-slate-400">
        Score breakdown not logged yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">Score components</p>
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Weighted contribution</p>
      </div>
      <div className="space-y-2">
        {rows.map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-300">{humanizeKey(key)}</span>
              <span className="font-medium text-white">{value.toFixed(1)}</span>
            </div>
            <div className="h-2 rounded-full bg-white/6">
              <div className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400" style={{ width: `${Math.min(value, 30) / 30 * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FunnelPanel({ funnel }: { funnel: { steps: FunnelStep[]; conversions: FunnelConversion[] } }) {
  return (
    <Card className="rounded-2xl border border-white/10 bg-[#0d1825]">
      <CardHeader className="border-b border-white/8 pb-4">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Main funnel</p>
        <CardTitle className="mt-2 text-2xl text-white">Where the week is leaking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {funnel.steps.map((step, index) => (
            <div key={step.key} className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{index + 1 < 10 ? `0${index + 1}` : index + 1}</p>
                  <p className="mt-1 text-sm font-medium text-slate-300">{humanizeKey(step.key)}</p>
                </div>
                <p className="text-2xl font-semibold text-white">{renderMetricValue(step)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {funnel.conversions.map((conversion) => (
            <div key={`${conversion.from}-${conversion.to}`} className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
              <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
                <span>{humanizeKey(conversion.from)}</span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
                <span>{humanizeKey(conversion.to)}</span>
              </div>
              <p className="mt-3 text-xl font-semibold text-white">{renderMetricValue(conversion.rate, { ratioAsPercent: true })}</p>
              <SourceStatusLabel metric={conversion.rate} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ComparisonPanel({
  comparison,
}: {
  comparison: WeeklySurvivalDashboardResponse["week_comparison"]
}) {
  const priorityKeys = [
    "revenue_collected",
    "paid_starts",
    "calls_booked",
    "replies_received",
    "target_fit_engagement",
    "paying_off_score",
    "popularity_score",
  ]

  return (
    <Card className="rounded-2xl border border-white/10 bg-[#0d1825]">
      <CardHeader className="border-b border-white/8 pb-4">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Week over week</p>
        <CardTitle className="mt-2 text-2xl text-white">Current vs previous week</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        {priorityKeys.map((key) => {
          const item = comparison[key]
          if (!item) {
            return null
          }

          return (
            <div key={key} className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] gap-3 rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3 text-sm">
              <div className="text-slate-300">{humanizeKey(key)}</div>
              <div className="text-right text-white">{renderComparisonValue(key, item.current)}</div>
              <div className="text-right text-slate-400">{renderComparisonValue(key, item.previous)}</div>
              <div className={cn("text-right font-medium", deltaTone(item.delta))}>
                {renderComparisonDelta(key, item.delta)}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function DeviationPanel({ flags }: { flags: DeviationFlag[] }) {
  return (
    <Card className="rounded-2xl border border-white/10 bg-[#0d1825]">
      <CardHeader className="border-b border-white/8 pb-4">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Deviation flags</p>
        <CardTitle className="mt-2 text-2xl text-white">What is breaking the week</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        {flags.map((flag) => (
          <div key={flag.flag} className={cn("rounded-2xl border p-4", FLAG_COLOR_MAP[flag.severity] || "border-white/8 bg-slate-950/35")}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white">
                {flag.flag.replaceAll("_", " ")}
              </Badge>
              <span className="text-xs uppercase tracking-[0.14em] text-slate-400">{flag.owner}</span>
            </div>
            <p className="mt-3 text-sm font-medium text-white">{flag.what_happened}</p>
            <p className="mt-2 text-sm text-slate-300">{flag.why_it_matters}</p>
            <p className="mt-3 text-sm text-slate-200">
              <span className="font-medium text-white">Correction:</span> {flag.next_correction}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function NextMovesPanel({ moves }: { moves: NextMove[] }) {
  return (
    <Card className="rounded-2xl border border-white/10 bg-[#0d1825]">
      <CardHeader className="border-b border-white/8 pb-4">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Next 3 moves</p>
        <CardTitle className="mt-2 text-2xl text-white">What to do next</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        {moves.map((move, index) => (
          <div key={`${move.owner}-${index}`} className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">{move.action}</p>
              <Badge className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-slate-200">
                {move.owner}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              <span className="font-medium text-white">Proof:</span> {move.proof_condition}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              <span className="font-medium text-white">Kill / advance:</span> {move.kill_or_advance_condition}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-500">{move.next_review_time}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function TargetQualityPanel({
  strongestProfiles,
  weakProfiles,
  rooms,
}: {
  strongestProfiles: TopPerson[]
  weakProfiles: TopPerson[]
  rooms: Array<[string, number]>
}) {
  return (
    <Card className="rounded-2xl border border-white/10 bg-[#0d1825]">
      <CardHeader className="border-b border-white/8 pb-4">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Target quality</p>
        <CardTitle className="mt-2 text-2xl text-white">Who is warming and who is noise</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <Tabs defaultValue="strong" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-slate-950/55">
            <TabsTrigger value="strong">Strong</TabsTrigger>
            <TabsTrigger value="weak">Weak</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
          </TabsList>
          <TabsContent value="strong" className="space-y-3">
            {strongestProfiles.length ? strongestProfiles.map((person) => <PersonRow key={person.person_url || person.person_name} person={person} />) : <EmptyState text="No strong profile interactions logged yet." />}
          </TabsContent>
          <TabsContent value="weak" className="space-y-3">
            {weakProfiles.length ? weakProfiles.map((person) => <PersonRow key={person.person_url || person.person_name} person={person} />) : <EmptyState text="No weak-fit profile interactions logged yet." />}
          </TabsContent>
          <TabsContent value="rooms" className="space-y-3">
            {rooms.length ? rooms.map(([segment, eventCount]) => (
              <div key={segment} className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{segment || "Unsegmented"}</p>
                  <p className="text-sm text-slate-200">{eventCount} events</p>
                </div>
                <p className="mt-2 text-sm text-slate-300">Target-fit room concentration this week.</p>
              </div>
            )) : <EmptyState text="No room concentration logged yet." />}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function PersonRow({ person }: { person: TopPerson }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">{person.person_name || "Unnamed profile"}</p>
          <p className="mt-1 text-sm text-slate-300">
            {[person.role, person.company].filter(Boolean).join(" · ") || "Context not logged yet"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-white">{person.target_fit_score ?? "—"}</p>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Target fit</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
        <span>{person.segment || "No segment"}</span>
        <span>{person.event_count} events</span>
        <span>{humanizeKey(person.last_outcome_atom || "not_logged_yet")}</span>
      </div>
    </div>
  )
}

function TopPostsPanel({ posts }: { posts: TopPost[] }) {
  return (
    <Card className="rounded-2xl border border-white/10 bg-[#0d1825]">
      <CardHeader className="border-b border-white/8 pb-4">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Popularity detail</p>
        <CardTitle className="mt-2 text-2xl text-white">Top posts and pressure sources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        {posts.length ? posts.map((post, index) => (
          <div key={post.post_id || `${post.source_reference}-${index}`} className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
            <p className="text-sm font-medium text-white">{post.post_title || post.source_reference || "Untitled post"}</p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-lg font-semibold text-white">{post.event_count}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Events</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-emerald-200">{post.target_fit_engagement}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Target-fit</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-amber-200">{post.weak_fit_engagement}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Weak-fit</p>
              </div>
            </div>
          </div>
        )) : <EmptyState text="No post engagement logged yet." />}
      </CardContent>
    </Card>
  )
}

function LiveEventStream({ events }: { events: LiveEvent[] }) {
  return (
    <Card className="rounded-2xl border border-white/10 bg-[#0d1825]">
      <CardHeader className="border-b border-white/8 pb-4">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Live event stream</p>
        <CardTitle className="mt-2 text-2xl text-white">Latest outcome atoms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        {events.length ? events.map((event) => (
          <div key={event.id} className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">{humanizeKey(event.outcome_atom)}</p>
                <p className="mt-1 text-sm text-slate-300">
                  {event.person_name || "Unnamed profile"}
                  {event.company ? ` · ${event.company}` : ""}
                  {event.role ? ` · ${event.role}` : ""}
                </p>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>{formatTimestamp(event.timestamp)}</p>
                <p className="mt-1 uppercase tracking-[0.14em]">{event.channel}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
              <span>{event.commander_owner || "Unowned"}</span>
              <span>Fit {event.target_fit_score ?? "—"}</span>
              {event.revenue_amount ? <span>{formatCurrency(event.revenue_amount)}</span> : null}
              {event.source_reference ? <span>{event.source_reference}</span> : null}
            </div>
          </div>
        )) : <EmptyState text="No events logged yet." />}
      </CardContent>
    </Card>
  )
}

function QuickLogPanel({
  eventForm,
  eventPending,
  eventStatus,
  onFieldChange,
  onSubmit,
}: {
  eventForm: KatyaEventInput
  eventPending: boolean
  eventStatus: string | null
  onFieldChange: <K extends keyof KatyaEventInput>(key: K, value: KatyaEventInput[K]) => void
  onSubmit: () => void
}) {
  return (
    <Card className="rounded-2xl border border-white/10 bg-[#0d1825]">
      <CardHeader className="border-b border-white/8 pb-4">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Manual event logging</p>
        <CardTitle className="mt-2 text-2xl text-white">Log the next real signal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.14em] text-slate-400">Outcome atom</label>
            <Select value={eventForm.outcome_atom} onValueChange={(value) => onFieldChange("outcome_atom", value)}>
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-slate-950/60 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_OPTIONS.map((eventType) => (
                  <SelectItem key={eventType} value={eventType}>
                    {humanizeKey(eventType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.14em] text-slate-400">Channel</label>
            <Select value={eventForm.channel} onValueChange={(value) => onFieldChange("channel", value)}>
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-slate-950/60 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANNEL_OPTIONS.map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {channel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Field label="Timestamp">
            <Input
              type="datetime-local"
              value={eventForm.timestamp}
              onChange={(event) => onFieldChange("timestamp", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/60 text-white"
            />
          </Field>
          <Field label="Commander">
            <Input
              value={eventForm.commander_owner || ""}
              onChange={(event) => onFieldChange("commander_owner", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/60 text-white"
            />
          </Field>
          <Field label="Person name">
            <Input
              value={eventForm.person_name || ""}
              onChange={(event) => onFieldChange("person_name", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/60 text-white"
            />
          </Field>
          <Field label="Company">
            <Input
              value={eventForm.company || ""}
              onChange={(event) => onFieldChange("company", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/60 text-white"
            />
          </Field>
          <Field label="Role">
            <Input
              value={eventForm.role || ""}
              onChange={(event) => onFieldChange("role", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/60 text-white"
            />
          </Field>
          <Field label="Segment">
            <Input
              value={eventForm.segment || ""}
              onChange={(event) => onFieldChange("segment", event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/60 text-white"
            />
          </Field>
          <Field label="Target-fit score">
            <Input
              inputMode="numeric"
              value={eventForm.target_fit_score ?? ""}
              onChange={(event) => onFieldChange("target_fit_score", event.target.value ? Number(event.target.value) : null)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/60 text-white"
            />
          </Field>
          <Field label="Revenue amount">
            <Input
              inputMode="decimal"
              value={eventForm.revenue_amount ?? ""}
              onChange={(event) => onFieldChange("revenue_amount", event.target.value ? Number(event.target.value) : null)}
              className="h-11 rounded-2xl border border-white/10 bg-slate-950/60 text-white"
            />
          </Field>
        </div>
        <Field label="Notes">
          <Textarea
            value={eventForm.notes || ""}
            onChange={(event) => onFieldChange("notes", event.target.value)}
            className="min-h-[110px] rounded-2xl border border-white/10 bg-slate-950/60 text-white"
          />
        </Field>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">{eventStatus || "Write the actual event, not a synthetic number."}</p>
          <Button className="rounded-2xl px-5" onClick={onSubmit} disabled={eventPending}>
            {eventPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Log event
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</label>
      {children}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/25 p-4 text-sm text-slate-400">
      {text}
    </div>
  )
}

function SourceStatusLabel({ metric }: { metric?: MetricValue }) {
  if (!metric) {
    return <p className="text-xs text-slate-500">Not logged yet</p>
  }

  if (metric.source_status === "not_logged_yet") {
    return <p className="text-xs text-slate-500">Not logged yet</p>
  }

  if (metric.source_status === "logged_zero") {
    return <p className="text-xs text-amber-200">Measured zero</p>
  }

  return <p className="text-xs text-emerald-200">Logged</p>
}

function renderMetricValue(metric?: MetricValue, options?: { ratioAsPercent?: boolean }) {
  if (!metric || metric.source_status === "not_logged_yet" || metric.value === null) {
    return "Not logged yet"
  }

  return renderRawValue(metric.value, metric.unit, options)
}

function renderRawValue(value: number | null, unit: string, options?: { ratioAsPercent?: boolean }) {
  if (value === null || value === undefined) {
    return "Not logged yet"
  }

  if (unit === "usd" || unit === "money") {
    return formatCurrency(value)
  }

  if (options?.ratioAsPercent || unit === "ratio") {
    return `${(value * 100).toFixed(1)}%`
  }

  if (Number.isInteger(value)) {
    return Intl.NumberFormat("en-US").format(value)
  }

  return Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)
}

function renderDelta(value: number | null, unit: string) {
  if (value === null || value === undefined) {
    return "—"
  }

  if (unit === "usd" || unit === "money") {
    return `${value >= 0 ? "+" : ""}${formatCurrency(value)}`
  }

  if (unit === "ratio") {
    return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`
  }

  return `${value >= 0 ? "+" : ""}${value}`
}

function renderComparisonValue(key: string, value: number | null) {
  if (value === null || value === undefined) {
    return "—"
  }

  if (key === "revenue_collected") {
    return formatCurrency(value)
  }

  if (key === "paying_off_score" || key === "popularity_score") {
    return value.toFixed(1)
  }

  return Number.isInteger(value)
    ? Intl.NumberFormat("en-US").format(value)
    : Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)
}

function renderComparisonDelta(key: string, value: number | null) {
  if (value === null || value === undefined) {
    return "—"
  }

  if (key === "revenue_collected") {
    return `${value >= 0 ? "+" : ""}${formatCurrency(value)}`
  }

  return `${value >= 0 ? "+" : ""}${Number.isInteger(value) ? value : value.toFixed(2)}`
}

function deltaTone(value: number | null) {
  if (value === null || value === undefined || value === 0) {
    return "text-slate-400"
  }
  return value > 0 ? "text-emerald-200" : "text-rose-200"
}

function humanizeKey(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatWeekRange(start: string, end: string) {
  try {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return `${format(startDate, "dd MMM")} - ${format(new Date(endDate.getTime() - 1), "dd MMM yyyy")}`
  } catch {
    return `${start} - ${end}`
  }
}

function formatTimestamp(value: string) {
  try {
    return format(new Date(value), "dd MMM, h:mm a")
  } catch {
    return value
  }
}

function toLocalDateTimeInputValue(value: Date) {
  const localValue = new Date(value.getTime() - value.getTimezoneOffset() * 60_000)
  return localValue.toISOString().slice(0, 16)
}
