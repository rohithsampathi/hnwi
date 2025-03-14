"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { API_BASE_URL } from "@/config/api"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"
import { StrategicDashboard } from "./strategic-dashboard"
import { KeyInsights } from "./key-insights"
import type { StrategicAnalysisResponse } from "@/types/strategic-analysis"
import { useTheme } from "@/contexts/theme-context"
import { StrategyAtomAnimation } from "./strategy-atom-animation"
import { Heading2, Heading3, Paragraph } from "@/components/ui/typography"

const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 180000, retries = 3) => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(id)
      return response
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i))) // Exponential backoff
    }
  }
}

export function TacticsLab() {
  const [query, setQuery] = useState("")
  const [timeRange, setTimeRange] = useState("1w")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<StrategicAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFirstQuestion, setIsFirstQuestion] = useState(true)
  const [showThinking, setShowThinking] = useState(true)
  const { toast } = useToast()
  const { theme } = useTheme()

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsAnalyzing(true)
      setAnalysisResult(null)
      setError(null)
      setIsFirstQuestion(false)

      try {
        const response = await fetchWithTimeout(
          `${API_BASE_URL}/api/strategic-analysis`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query, time_range: timeRange }),
          },
          180000, // Updated timeout to 3 minutes
          3,
        )

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }

        const data: StrategicAnalysisResponse = await response.json()
        if (!data || typeof data !== "object") {
          throw new Error("Invalid response format")
        }
        setAnalysisResult(data)
      } catch (error) {
        console.error("Error fetching strategic analysis:", error)
        let errorMessage = "An unknown error occurred"
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            errorMessage = "Request timed out. Please try again."
          } else if (error.message.includes("Failed to fetch")) {
            errorMessage = "Network error. Please check your internet connection and try again."
          } else {
            errorMessage = error.message
          }
        }
        setError(errorMessage)
        toast({
          title: "Error",
          description: `Failed to fetch strategic analysis: ${errorMessage}`,
          variant: "destructive",
        })
      } finally {
        setIsAnalyzing(false)
      }
    },
    [query, timeRange, toast],
  )

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAnalyzing) {
      interval = setInterval(() => {
        setShowThinking((prev) => !prev)
      }, 1667) // Blink every 1667ms (500ms * 3.33, which is 70% slower)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isAnalyzing])

  const renderAnalysisContent = () => {
    if (!analysisResult) return null

    // Ensure insights exist and have the right structure
    const insights = analysisResult.supporting_data?.insights || {
      insight_one: { title: "Insight Parsing Error", details: "Unable to parse insights" },
      insight_two: { title: "Insight Parsing Error", details: "Unable to parse insights" },
      insight_three: { title: "Insight Parsing Error", details: "Unable to parse insights" },
      insight_four: { title: "Insight Parsing Error", details: "Unable to parse insights" }
    }
    
    const isLoading =
      !insights.insight_one || !insights.insight_two || !insights.insight_three || !insights.insight_four ||
      insights.insight_one.title === "Insight Parsing Error" ||
      insights.insight_two.title === "Insight Parsing Error" ||
      insights.insight_three.title === "Insight Parsing Error" ||
      insights.insight_four.title === "Insight Parsing Error"

    const getSourceIndices = (content: string, url: string) => {
      if (!analysisResult.supporting_data?.vector_results?.length) {
        return []
      }
      
      return analysisResult.supporting_data.vector_results
        .map((result, index) => ({ index: index + 1, url: result.metadata.url }))
        .filter((source) => source.url === url)
        .map((source) => source.index)
    }

    return (
      <>
        <div className="mt-8 mb-6 font-body">
          <h2 className={`text-title ${theme === "dark" ? "text-white" : "text-[#121212]"}`}>
            The 4
          </h2>
          <p className={`mt-2 text-body-small ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Key insights from the analysis
          </p>
        </div>
        <KeyInsights insights={insights} isLoading={isLoading} />
        <StrategicDashboard
          title={`Analysis: ${analysisResult.query}`}
          summary={analysisResult.executive_summary}
          sections={[
            {
              title: "Key Findings",
              content: analysisResult.key_findings.map((finding) => {
                const parts = finding.split(" [")
                const content = parts[0]
                const url = parts[1] ? parts[1].slice(0, -1) : ""
                const sourceIndices = url ? getSourceIndices(content, url) : []
                return `${content} [${sourceIndices.join(", ")}]`
              }),
            },
            {
              title: "Market Trends",
              content: analysisResult.market_trends.map((trend) => {
                const parts = trend.split(" [")
                const content = parts[0]
                const url = parts[1] ? parts[1].slice(0, -1) : ""
                const sourceIndices = url ? getSourceIndices(content, url) : []
                return `${content} [${sourceIndices.join(", ")}]`
              }),
            },
            { title: "Strategic Implications", content: analysisResult.strategic_implications },
          ]}
          score={{
            value: analysisResult.confidence_score,
            label: "Confidence Score",
          }}
        />
        {analysisResult.supporting_data?.vector_results?.length > 0 && (
          <>
            <p className={`mt-6 text-body-small ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              This analysis is based on HNWI Chronicles Knowledge Base, Expert Validation Insights, and{" "}
              {analysisResult.supporting_data.vector_results.length} secondary sources. All secondary sources used in
              the analysis are listed below.
            </p>
            <div className="mt-6">
              <h2 className="text-subtitle text-primary mb-4">Sources</h2>
              <div className="space-y-1">
                {analysisResult.supporting_data.vector_results.map((source, index) => (
                  <a
                    key={index}
                    href={source.metadata?.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-1 rounded-md text-blue-500 dark:text-blue-400 
                    hover:underline hover:text-blue-700 dark:hover:text-blue-300 transition-all text-body"
                  >
                    <span className="mr-2 font-semibold text-muted-foreground">{index + 1}.</span>
                    <span>{source.metadata?.title || `Source ${index + 1}`}</span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </>
    )
  }

  return (
    <div className="w-full p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-headline text-primary">Tactics Lab</h1>
          <Badge className="bg-primary">Beta</Badge>
        </div>
        <p className="text-body-large text-muted-foreground mt-2 mb-4">
          Your AI-powered strategy assistant
        </p>
      </div>
      <div className="font-body w-full">
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="flex flex-col max-w-5xl ml-0">
            <Textarea
              placeholder="What would you like to analyze today?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`flex-grow ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-[#121212]"} font-semibold placeholder:font-semibold text-body-large p-4 border-2 border-primary/20 focus:border-primary/70 shadow-lg h-[120px] resize-none mb-4`}
            />
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger
                  className={`w-full md:w-[180px] ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-[#121212]"} font-semibold h-[40px]`}
                >
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1w">Last 7 days</SelectItem>
                  <SelectItem value="1m">Last 1 month</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                  <SelectItem value="1y">Last 1 year</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={isAnalyzing} className="w-full md:w-auto h-[40px] px-6 text-sm font-bold">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
          </div>
        </form>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-6 text-sm opacity-75">
        {isFirstQuestion && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="mb-6">
              <h3 className="text-subtitle mb-3 text-primary/80">Latest Update v1.2</h3>
              <div className="flex justify-between items-center mb-3">
                <p className="text-caption">Last Updated: January 22, 2024</p>
                <Badge className="bg-primary">New</Badge>
              </div>
              <div className="border-l border-gray-200 dark:border-gray-700 pl-4 py-3 my-4">
                <p className="text-label mb-2">Improvements:</p>
                <ul className="list-disc pl-5 space-y-1 text-body-small">
                  <li>Knowledge base now has multiple query capabilities</li>
                  <li>Mixture of Experts has been successfully updated with 5 Engines working in sync</li>
                  <li>Engine now scores over 87% confidence for queries related to Real Estate and Financial Services</li>
                </ul>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-subtitle mb-3 text-primary/80">How to Use the Tactics Lab</h3>
              <div className="border-l border-primary/40 pl-3 mb-4">
                <p className="text-body-small mb-2">
                  The Tactics Lab is designed to assist you with complex strategic questions. Here are some examples:
                </p>
              </div>
              <div className="bg-gray-50/50 dark:bg-gray-800/20 p-3 rounded-md">
                <ul className="list-disc pl-5 space-y-2 text-caption">
                  <li>
                    "What are the emerging trends in luxury real estate for high-net-worth individuals in major global
                    cities?"
                  </li>
                  <li>
                    "How might changes in global tax regulations impact wealth management strategies for international
                    HNWIs?"
                  </li>
                  <li>
                    "What are the potential implications of increasing ESG focus on investment strategies for
                    ultra-high-net-worth families?"
                  </li>
                  <li>
                    "How can wealth managers leverage AI and machine learning to provide more personalized services to
                    HNWI clients?"
                  </li>
                </ul>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-3">
                <p className="text-caption italic text-muted-foreground">
                  Feel free to ask the Tactics Lab about market trends, investment strategies, regulatory impacts, or any other strategic
                  concerns related to high-net-worth individuals and wealth management.
                </p>
              </div>
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mt-6"
            >
              <StrategyAtomAnimation />
              <motion.p
                className="text-center mt-4 text-body-large font-semibold font-heading"
                initial={{ opacity: 1 }}
                animate={{ opacity: showThinking ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                Tactics Lab analyzing... This may take up to 3 minutes for complex queries.
              </motion.p>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className={`mt-4 p-4 ${
                theme === "dark" ? "bg-red-900 text-red-100" : "bg-red-100 text-red-700"
              } rounded-md`}
            >
              <h3 className="text-subtitle font-heading">Error:</h3>
              <p className="text-body">{error}</p>
              <div className="mt-4 flex justify-between items-center">
                <p className="text-caption">Please try again or contact support if the issue persists.</p>
                <Button
                  onClick={handleSubmit}
                  variant="outline"
                  size="sm"
                  className={theme === "dark" ? "bg-red-800 hover:bg-red-700" : "bg-red-200 hover:bg-red-300"}
                >
                  Retry
                </Button>
              </div>
            </motion.div>
          )}
          {analysisResult && (
            <motion.div
              key={analysisResult.conversation_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {renderAnalysisContent()}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

