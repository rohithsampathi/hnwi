import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "@/contexts/theme-context"
import type { InsightData } from "@/types/strategic-analysis"

interface KeyInsightsProps {
  insights: {
    insight_one: InsightData
    insight_two: InsightData
    insight_three: InsightData
    insight_four: InsightData
  }
  isLoading: boolean
}

export function KeyInsights({ insights, isLoading }: KeyInsightsProps) {
  const { theme } = useTheme()

  const renderInsight = (insight: InsightData) => (
    <Card className={theme === "dark" ? "bg-[#2A2A2A] text-white" : "bg-white text-[#121212]"}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">{insight.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{insight.details}</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {isLoading ? (
        Array(4)
          .fill(0)
          .map((_, index) => (
            <Card key={index} className={theme === "dark" ? "bg-[#2A2A2A]" : "bg-white"}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
      ) : (
        <>
          {renderInsight(insights.insight_one)}
          {renderInsight(insights.insight_two)}
          {renderInsight(insights.insight_three)}
          {renderInsight(insights.insight_four)}
        </>
      )}
    </div>
  )
}

