// components/dashboard/trending-insights.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "@/contexts/theme-context"
import { TrendingUp, Diamond, Globe } from "lucide-react"

const insights = [
  { title: "Investments", content: "Top-performing sectors this week.", icon: TrendingUp },
  { title: "Luxury", content: "Emerging trends in HNWI preferences.", icon: Diamond },
  { title: "Market Trends", content: "Key policy changes shaping global markets.", icon: Globe },
]

export function TrendingInsights() {
  const { theme } = useTheme()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {insights.map((insight, index) => (
        <Card
          key={index}
          className={`${
            theme === "dark"
              ? "bg-[#1A1A1A] text-[#E0E0E0] border-[#1C1C1C] shadow-[0_4px_6px_-1px_rgba(13,13,13,0.1),0_2px_4px_-1px_rgba(13,13,13,0.06)]"
              : "bg-white text-[#212121] border-[#E0E0E0] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]"
          } rounded-lg`}
        >
          <CardHeader className="flex flex-row items-center space-x-2">
            <insight.icon className={`w-5 h-5 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#1976D2]"}`} />
            <CardTitle className={`text-lg ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#1976D2]"}`}>
              {insight.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{insight.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

