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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://uwind.onrender.com"

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
      const response = await fetch(`${API_BASE_URL}/api/strategic-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, time_range: duration }), // Updated to include duration
      })

      if (!response.ok) {
        throw new Error("Failed to fetch analysis")
      }

      const data = await response.json()
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
    <Card className="w-full">
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
              <p className="mt-2 text-center text-sm text-muted-foreground">
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
                  <Paragraph className="mt-6 font-body text-muted-foreground">
                    This analysis is based on HNWI Chronicles Knowledge Base, Expert Validation Insights, and{" "}
                    {analysisResult.supporting_data.vector_results.length} secondary sources. All secondary sources used
                    in the analysis are listed below.
                  </Paragraph>
                  <Card className="mt-2">
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

