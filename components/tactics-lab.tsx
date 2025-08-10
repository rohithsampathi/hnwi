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
import { getValidToken } from "@/lib/auth-utils"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Lightbulb, ExternalLink, FileText, ChevronRight, Brain, Sparkles, Zap, TrendingUp } from "lucide-react"
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

const CyclingIcons = () => {
  const [currentIcon, setCurrentIcon] = useState(0)
  const icons = [Brain, Sparkles, Zap, TrendingUp, Lightbulb]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon(prev => (prev + 1) % icons.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [icons.length])
  
  const CurrentIcon = icons[currentIcon]
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIcon}
        initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
        transition={{ duration: 0.5 }}
      >
        <CurrentIcon className="h-12 w-12 text-primary" />
      </motion.div>
    </AnimatePresence>
  )
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
        const token = getValidToken();
        if (!token) {
          throw new Error("Authentication required. Please log in to use Strategy Engine.");
        }

        const response = await fetchWithTimeout(
          `${API_BASE_URL}/api/chat/strategic-analysis`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              query: query,
              time_range: timeRange
            }),
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-12 mb-8 text-center"
        >
          <div className="relative inline-block">
            <h2 className="text-title font-bold text-primary relative z-10 drop-shadow-sm">
              The 4
            </h2>
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-lg animate-pulse" />
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-lg" />
          </div>
          <p className="mt-4 text-body text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Key strategic insights extracted from comprehensive analysis
          </p>
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent max-w-xs mx-auto" />
        </motion.div>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
          >
            <div className={`relative overflow-hidden rounded-2xl p-8 
              ${theme === "dark" 
                ? "bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/30" 
                : "bg-gradient-to-br from-white/60 to-gray-50/40 border border-gray-200/30"
              } backdrop-blur-sm shadow-lg`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
              <div className="relative">
                <div className="text-center mb-8">
                  <h2 className="text-subtitle text-primary mb-4 flex items-center justify-center space-x-2">
                    <FileText className="h-6 w-6" />
                    <span>Research Foundation</span>
                  </h2>
                  <p className="text-body text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    This analysis is grounded in HNWI Chronicles Knowledge Base, Expert Validation Insights, and{" "}
                    <span className="font-semibold text-primary">
                      {analysisResult.supporting_data.vector_results.length} curated secondary sources
                    </span>
                    {" "}providing comprehensive market intelligence.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysisResult.supporting_data.vector_results.map((source, index) => (
                    <motion.a
                      key={index}
                      href={source.metadata?.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
                        ${theme === "dark" 
                          ? "bg-gray-800/60 border border-gray-700/50 hover:border-primary/50 hover:bg-gray-800/80" 
                          : "bg-white/80 border border-gray-200/50 hover:border-primary/50 hover:bg-white"
                        }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                              ${theme === "dark" ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}`}>
                              {index + 1}
                            </span>
                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:translate-x-1" />
                        </div>
                        <h3 className="text-body font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                          {source.metadata?.title || `Research Source ${index + 1}`}
                        </h3>
                        {source.metadata?.url && (
                          <p className="mt-2 text-caption text-muted-foreground truncate">
                            {new URL(source.metadata.url).hostname}
                          </p>
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.a>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full 
                    ${theme === "dark" ? "bg-primary/10 text-primary" : "bg-primary/5 text-primary"}`}>
                    <span className="text-caption font-medium">
                      Sources verified and cross-referenced for accuracy
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </>
    )
  }

  return (
    <div className="w-full p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Heading2 className="text-primary">Tactics Lab</Heading2>
          <Badge className="bg-primary">Beta</Badge>
        </div>
        <Paragraph className="font-body tracking-wide text-xl text-muted-foreground">
          Your AI-powered strategy assistant
        </Paragraph>
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
        <div className={`relative mt-8 pt-8 text-sm opacity-90
          ${theme === "dark" ? "border-t border-gray-700/50" : "border-t border-gray-200/50"}`}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        {isFirstQuestion && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className={`relative overflow-hidden rounded-2xl p-6 
                ${theme === "dark" 
                  ? "bg-gradient-to-br from-gray-800/40 to-gray-900/20 border border-gray-700/30" 
                  : "bg-gradient-to-br from-white/60 to-gray-50/40 border border-gray-200/30"
                } backdrop-blur-sm shadow-lg`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-subtitle text-primary font-bold">Current Version: v1.6</h3>
                  <Badge className="bg-primary shadow-lg">Updated</Badge>
                </div>
                <p className="text-caption text-muted-foreground mb-6">
                  <strong>Last Updated:</strong> August 10, 2025
                </p>
                <div className={`relative rounded-xl p-4 
                  ${theme === "dark" ? "bg-gray-800/50" : "bg-white/50"} 
                  border-l-4 border-primary/50`}
                >
                  <p className="text-label mb-4 font-bold text-primary">Latest Improvements:</p>
                  <div className="space-y-3">
                    {[
                      "Improved knowledge base response confidence with enhanced accuracy scoring",
                      "Expanded knowledge base capacity for more comprehensive market intelligence",
                      "Smarter answering engine using state-of-the-art LLMs for superior analysis",
                      "Enhanced multi-industry query capabilities across all major sectors",
                      "Upgraded Mixture of Experts—7 Agentic Engines now work in perfect sync",
                      "Advanced AI models now leverage Opus 4.1, Sonnet 4.0, DeepSeek R3, and GPT-5"
                    ].map((improvement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start space-x-3 group"
                      >
                        <div className={`p-1 rounded-full 
                          ${theme === "dark" ? "bg-primary/20" : "bg-primary/10"} 
                          group-hover:bg-primary/30 transition-colors duration-300`}
                        >
                          <Lightbulb className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-body-small leading-relaxed group-hover:text-foreground transition-colors duration-300">
                          {improvement}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`relative overflow-hidden rounded-2xl p-6 
                ${theme === "dark" 
                  ? "bg-gradient-to-br from-gray-800/40 to-gray-900/20 border border-gray-700/30" 
                  : "bg-gradient-to-br from-white/60 to-gray-50/40 border border-gray-200/30"
                } backdrop-blur-sm shadow-lg`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
              <div className="relative">
                <h3 className="text-subtitle mb-4 text-primary font-bold">How to Use the Tactics Lab</h3>
                <div className={`rounded-xl p-4 mb-6 
                  ${theme === "dark" ? "bg-primary/10" : "bg-primary/5"} 
                  border-l-4 border-primary/50`}
                >
                  <p className="text-body-small leading-relaxed">
                    The Tactics Lab is designed to assist you with complex strategic questions. Here are some examples:
                  </p>
                </div>
                <div className="space-y-4">
                  {[
                    "What are the emerging trends in luxury real estate for high-net-worth individuals in major global cities?",
                    "How might changes in global tax regulations impact wealth management strategies for international HNWIs?",
                    "What are the potential implications of increasing ESG focus on investment strategies for ultra-high-net-worth families?",
                    "How can wealth managers leverage AI and machine learning to provide more personalized services to HNWI clients?"
                  ].map((question, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`group relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:shadow-md cursor-pointer
                        ${theme === "dark" 
                          ? "bg-gray-800/30 border border-gray-700/30 hover:border-primary/30 hover:bg-gray-800/50" 
                          : "bg-white/50 border border-gray-200/30 hover:border-primary/30 hover:bg-white/80"
                        }`}
                      onClick={() => setQuery(question)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 transition-all duration-300
                          ${theme === "dark" ? "bg-primary/20 group-hover:bg-primary/30" : "bg-primary/10 group-hover:bg-primary/20"}`}
                        >
                          <Lightbulb className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-caption leading-relaxed group-hover:text-foreground transition-colors duration-300">
                          "{question}"
                        </p>
                      </div>
                      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                  ))}
                </div>
                <div className={`mt-6 pt-4 border-t 
                  ${theme === "dark" ? "border-gray-700/50" : "border-gray-200/50"}`}
                >
                  <p className="text-caption italic text-muted-foreground leading-relaxed">
                    Feel free to ask the Tactics Lab about market trends, investment strategies, regulatory impacts, or any other strategic
                    concerns related to high-net-worth individuals and wealth management.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        <AnimatePresence mode="wait">
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mt-12"
            >
              <div className={`relative overflow-hidden rounded-3xl p-12 
                ${theme === "dark" 
                  ? "bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/30" 
                  : "bg-gradient-to-br from-white/90 to-gray-50/80 border border-gray-200/30"
                } backdrop-blur-xl shadow-2xl`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 animate-pulse" />
                <div className="relative">
                  {/* Premium animated loader */}
                  <div className="flex justify-center mb-8">
                    <div className="relative">
                      {/* Central container with changing icons */}
                      <motion.div
                        animate={{ 
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                        className={`p-8 rounded-full relative
                          ${theme === "dark" ? "bg-primary/20" : "bg-primary/10"} 
                          border-2 border-primary/30 shadow-xl`}
                      >
                        <CyclingIcons />
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Progress indicators */}
                  <div className="flex justify-center space-x-2 mb-8">
                    {Array.from({ length: 7 }, (_, i) => (
                      <motion.div
                        key={i}
                        className={`h-2 w-8 rounded-full 
                          ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
                        animate={{
                          backgroundColor: [
                            theme === "dark" ? "#374151" : "#e5e7eb",
                            "#3b82f6",
                            theme === "dark" ? "#374151" : "#e5e7eb"
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Dynamic status text */}
                  <div className="text-center">
                    <motion.h3
                      className="text-title text-primary mb-4 font-bold"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      Tactics Lab Analyzing
                    </motion.h3>
                    
                    <motion.div
                      animate={{ opacity: showThinking ? 1 : 0.6 }}
                      transition={{ duration: 0.8 }}
                      className="space-y-3"
                    >
                      <p className="text-body text-muted-foreground">
                        AI engines are processing your strategic query
                      </p>
                      <div className="flex items-center justify-center space-x-6 text-caption">
                        <motion.div 
                          className="flex items-center space-x-2"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        >
                          <div className={`w-2 h-2 rounded-full 
                            ${theme === "dark" ? "bg-green-400" : "bg-green-500"}`} />
                          <span>Knowledge Base</span>
                        </motion.div>
                        <motion.div 
                          className="flex items-center space-x-2"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        >
                          <div className={`w-2 h-2 rounded-full 
                            ${theme === "dark" ? "bg-blue-400" : "bg-blue-500"}`} />
                          <span>Expert Insights</span>
                        </motion.div>
                        <motion.div 
                          className="flex items-center space-x-2"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                        >
                          <div className={`w-2 h-2 rounded-full 
                            ${theme === "dark" ? "bg-purple-400" : "bg-purple-500"}`} />
                          <span>Market Data</span>
                        </motion.div>
                      </div>
                      <p className="text-caption text-muted-foreground italic mt-4">
                        Complex queries may take up to 3 minutes • Powered by 7 Agentic Engines
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
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

