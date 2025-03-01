"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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

    const insights = analysisResult.supporting_data.insights
    const isLoading =
      !insights.insight_one || !insights.insight_two || !insights.insight_three || !insights.insight_four

    const getSourceIndices = (content: string, url: string) => {
      return analysisResult.supporting_data.vector_results
        .map((result, index) => ({ index: index + 1, url: result.metadata.url }))
        .filter((source) => source.url === url)
        .map((source) => source.index)
    }

    return (
      <>
        <div className="mt-8 mb-6 font-body">
          <Heading2 className={`text-3xl font-bold font-heading ${theme === "dark" ? "text-white" : "text-[#121212]"}`}>
            The 4
          </Heading2>
          <Paragraph className={`mt-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Key insights from the analysis
          </Paragraph>
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
        {analysisResult.supporting_data.vector_results && (
          <>
            <Paragraph className={`mt-6 font-body ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              This analysis is based on HNWI Chronicles Knowledge Base, Expert Validation Insights, and{" "}
              {analysisResult.supporting_data.vector_results.length} secondary sources. All secondary sources used in
              the analysis are listed below.
            </Paragraph>
            <Card className={`mt-2 ${theme === "dark" ? "bg-[#1A1A1A] text-white" : "bg-white text-[#121212]"}`}>
              <CardHeader>
                <CardTitle className="text-xl font-bold font-heading text-primary">Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2">
                  {analysisResult.supporting_data.vector_results.map((source, index) => (
                    <li key={index} className="text-sm">
                      <a
                        href={source.metadata.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {source.metadata.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </>
        )}
      </>
    )
  }

  return (
    <Card className={`w-full ${theme === "dark" ? "bg-[#1A1A1A] text-white" : "bg-white text-[#121212]"}`}>
      <CardHeader>
        <Heading2 className="text-3xl font-bold font-heading text-primary">Tactics Lab</Heading2>
        <Paragraph className="text-sm text-muted-foreground mt-2 leading-tight font-body">
          Your AI-powered strategy assistant
        </Paragraph>
      </CardHeader>
      <CardContent className="font-body">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <Input
              placeholder="What strategy are we solving today?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`flex-grow ${theme === "dark" ? "bg-[#2A2A2A] text-white" : "bg-white text-[#121212]"}`}
            />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className={`w-full md:w-[180px] ${theme === "dark" ? "bg-[#2A2A2A] text-white" : "bg-white text-[#121212]"}`}
              >
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1w">Last 7 days</SelectItem>
                <SelectItem value="1m">Last 1 month</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="1y">Last 1 year</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isAnalyzing} className="w-full md:w-auto">
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </Button>
          </div>
        </form>
        {isFirstQuestion && (
          <Card className="mt-6 mb-4">
            <CardHeader>
              <CardTitle className="text-xl font-semibold font-heading">Latest Update v1.2</CardTitle>
              <CardDescription>Last Updated: January 22, 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <Heading3 className="font-semibold font-heading mb-2">Improvements:</Heading3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Knowledge base now has multiple query capabilities</li>
                <li>Mixture of Experts has been successfully updated with 5 Engines working in sync</li>
                <li>Engine now scores over 87% confidence for queries related to Real Estate and Financial Services</li>
              </ul>
            </CardContent>
          </Card>
        )}
        {isFirstQuestion && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold font-heading">How to Use the Strategy Engine</CardTitle>
            </CardHeader>
            <CardContent>
              <Paragraph className="mb-4">
                The Strategy Engine is designed to assist you with complex strategic questions. Here are some examples
                of questions you can ask:
              </Paragraph>
              <ul className="list-disc pl-6 space-y-2">
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
              <Paragraph className="mt-4">
                Feel free to ask about market trends, investment strategies, regulatory impacts, or any other strategic
                concerns related to high-net-worth individuals and wealth management.
              </Paragraph>
            </CardContent>
          </Card>
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
                className="text-center mt-4 text-lg font-semibold font-heading"
                initial={{ opacity: 1 }}
                animate={{ opacity: showThinking ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                Analyzing... This may take up to 3 minutes for complex queries.
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
              <Heading3 className="font-semibold font-heading">Error:</Heading3>
              <Paragraph>{error}</Paragraph>
              <div className="mt-4 flex justify-between items-center">
                <Paragraph className="text-sm">Please try again or contact support if the issue persists.</Paragraph>
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
      </CardContent>
    </Card>
  )
}

