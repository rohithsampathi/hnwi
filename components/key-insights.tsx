import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "@/contexts/theme-context"
import { motion, AnimatePresence } from "framer-motion"
import { Lightbulb, Sparkles } from "lucide-react"
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

  const renderInsight = (insight: InsightData, index: number) => {
    if (!insight || insight.title === "Insight Parsing Error") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className={`relative overflow-hidden rounded-2xl border-2 border-dashed border-amber-300/50 
            ${theme === "dark" ? "bg-gradient-to-br from-amber-900/20 to-amber-800/10" : "bg-gradient-to-br from-amber-50 to-amber-100/50"} 
            backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent animate-pulse" />
          <div className="relative p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-full bg-amber-500/20 animate-pulse">
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="card-title font-bold text-amber-600 dark:text-amber-400">Processing Insight</h3>
            </div>
            <p className="text-body font-medium text-amber-700 dark:text-amber-300 opacity-90">
              Additional insight data is being processed. Please check back in a moment.
            </p>
          </div>
        </motion.div>
      )
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className={`relative overflow-hidden rounded-2xl border 
          ${theme === "dark" 
            ? "bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 hover:border-primary/50" 
            : "bg-gradient-to-br from-white to-gray-50/50 border-gray-200/50 hover:border-primary/30"
          } 
          backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative p-6">
          <div className="flex items-start space-x-4 mb-4">
            <motion.div 
              className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300"
              whileHover={{ rotate: 5, scale: 1.05 }}
            >
              <Lightbulb className="h-6 w-6 text-primary" />
            </motion.div>
            <div className="flex-1">
              <h3 className="card-title font-bold text-primary mb-2 group-hover:text-primary/90 transition-colors">
                {insight.title}
              </h3>
            </div>
          </div>
          <p className="text-body font-medium leading-relaxed text-foreground group-hover:text-foreground transition-colors duration-300">
            {insight.details}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>
    )
  }

  return (
    <div className="relative mb-12">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl" />
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
        {isLoading ? (
          Array(4)
            .fill(0)
            .map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`rounded-2xl border p-6 
                  ${theme === "dark" ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"} 
                  backdrop-blur-sm shadow-lg`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <Skeleton className="h-6 w-2/3" />
                </div>
                <Skeleton className="h-20 w-full" />
              </motion.div>
            ))
        ) : (
          <>
            {renderInsight(insights.insight_one, 0)}
            {renderInsight(insights.insight_two, 1)}
            {renderInsight(insights.insight_three, 2)}
            {renderInsight(insights.insight_four, 3)}
          </>
        )}
      </div>
    </div>
  )
}

