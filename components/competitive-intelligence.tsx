"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DevelopmentStream } from "@/components/development-stream"
import { getIndustryColor } from "@/utils/color-utils"
import { useToast } from "@/components/ui/use-toast"
import { secureApi } from "@/lib/secure-api"
import { isAuthenticated } from "@/lib/auth-utils"

interface CompetitiveIntelligenceProps {
  industry: string
}

export function CompetitiveIntelligence({ industry }: CompetitiveIntelligenceProps) {
  const [timeRange, setTimeRange] = useState("1w")
  const [developments, setDevelopments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // const [developmentCount, setDevelopmentCount] = useState(0)
  // const [developmentDelta, setDevelopmentDelta] = useState(0)
  const { toast } = useToast()

  const fetchDevelopments = useCallback(async () => {
    // Check authentication before making API call
    if (!isAuthenticated()) {
      console.log('User not authenticated - skipping developments fetch in competitive intelligence');
      setDevelopments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true)
    try {
      const data = await secureApi.post('/api/developments', {
        industry: industry, // Use the provided industry
        time_range: timeRange,
        page: 1,
        page_size: 100, // Set to maximum allowed page size
        sort_by: "date",
        sort_order: "desc",
      }, true, { enableCache: true, cacheDuration: 600000 }); // 10 minutes cache for developments
      const allDevelopments = data.developments || []
      setDevelopments(allDevelopments)
    } catch (error: any) {
      console.error("Error fetching developments:", error)
      
      // Check if it's an authentication error
      if (error.message?.includes('Authentication required') || error.status === 401) {
        console.log('Authentication required for competitive intelligence data');
        setDevelopments([]);
        setError(null); // Don't show error to user for auth issues
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      setError(errorMessage)
      toast({
        title: "Error",
        description: `Failed to fetch developments: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [industry, timeRange, toast])

  useEffect(() => {
    fetchDevelopments()
  }, [fetchDevelopments])

  return (
    <Card className="w-full mt-6 overflow-hidden border-none bg-transparent shadow-none transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Select onValueChange={setTimeRange} value={timeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 hours</SelectItem>
              <SelectItem value="1w">Last week</SelectItem>
              <SelectItem value="1m">Last month</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-500 mb-4">
            <p>Error: {error}</p>
            <p>Please try again later or contact support if the issue persists.</p>
          </div>
        )}

        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <Heading3 className="text-3xl font-bold">{developmentCount}</Heading3>
                    <Paragraph className="text-muted-foreground">Total Developments</Paragraph>
                  </div>
                  <div>
                    <Heading3
                      className={`text-2xl font-bold ${developmentDelta >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {developmentDelta > 0 ? "+" : ""}
                      {developmentDelta}
                    </Heading3>
                    <Paragraph className="text-muted-foreground">vs Previous Period</Paragraph>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div> */}

        <DevelopmentStream
          selectedIndustry={industry}
          duration={timeRange}
          getIndustryColor={getIndustryColor}
          expandedDevelopmentId={null}
          developments={developments}
        />
      </CardContent>
    </Card>
  )
}

