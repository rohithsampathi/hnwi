"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { StrategyAtomAnimation } from "./strategy-atom-animation"
import { KeyInsights } from "./key-insights"
import { StrategicDashboard } from "./strategic-dashboard"
import { Paragraph } from "@/components/ui/typography"
import { secureApi } from "@/lib/secure-api"

interface HNWIThinkingSectionProps {
  industry: string
}

export function HNWIThinkingSection({ industry }: HNWIThinkingSectionProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any | null>(null)
  const [duration, setDuration] = useState<string>("1m") // Added duration state
  const { toast } = useToast()

  const handleAnalyse = useCallback(async () => {
    if (!selectedLocation) {
      toast({
        title: "Error",
        description: "Please select a location before analyzing.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      const query = `What are HNWIs thinking about ${selectedLocation} ${industry}?`
      const data = await secureApi.post('/api/strategic-analysis', { 
        query, 
        time_range: duration 
      }, true, { enableCache: true, cacheDuration: 600000 }); // 10 minutes cache
      setAnalysisResult(data)
    } catch (error) {
      console.error("Error fetching analysis:", error)
      toast({
        title: "Error",
        description: "Failed to fetch analysis. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }, [selectedLocation, industry, toast, duration]) // Added duration to dependencies

  return (
    <Card className="w-full border-none bg-transparent shadow-none">
      {/* Removed CardHeader and CardTitle */}
      <CardContent>
        <div className="space-y-4 pt-6">
          {" "}
          {/* Added pt-6 for more top padding */}
          <Select onValueChange={setSelectedLocation} value={selectedLocation}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mumbai">Mumbai</SelectItem>
              <SelectItem value="Delhi">Delhi</SelectItem>
              <SelectItem value="Bangalore">Bangalore</SelectItem>
              <SelectItem value="Hyderabad">Hyderabad</SelectItem>
              <SelectItem value="Chennai">Chennai</SelectItem>
              <SelectItem value="Pune">Pune</SelectItem>
              <SelectItem value="Goa">Goa</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAnalyse} disabled={isAnalyzing} className="w-full">
            {isAnalyzing ? "Analyzing..." : "Analyse"}
          </Button>
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center mt-4">
              <StrategyAtomAnimation />
              <p className="mt-2 text-center text-caption">
                Analyzing HNWI Preferences. This might take 45 seconds to 3 minutes.
              </p>
            </div>
          )}
          {analysisResult && (
            <div className="mt-6">
              <KeyInsights insights={analysisResult.supporting_data.insights} isLoading={false} />
              <StrategicDashboard
                title={`Analysis: ${analysisResult.query}`}
                summary={analysisResult.executive_summary}
                sections={[
                  { title: "Key Findings", content: analysisResult.key_findings },
                  { title: "Market Trends", content: analysisResult.market_trends },
                  { title: "Strategic Implications", content: analysisResult.strategic_implications },
                ]}
                score={{
                  value: analysisResult.confidence_score,
                  label: "Confidence Score",
                }}
              />
              {analysisResult.supporting_data.vector_results && (
                <>
                  <p className="mt-6 text-body-small text-muted-foreground">
                    This analysis is based on HNWI Chronicles Knowledge Base, Expert Validation Insights, and{" "}
                    {analysisResult.supporting_data.vector_results.length} secondary sources. All secondary sources used
                    in the analysis are listed below.
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

