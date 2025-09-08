"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Crown, Target, Globe, RefreshCw } from "lucide-react"
import { secureApi } from "@/lib/secure-api"

export function SimpleIntelligenceTest() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Use secure API - NO direct backend URL exposure
      const data = await secureApi.get('/api/hnwi/intelligence/dashboard/59363d04-eb97-4224-94cf-16ca0d4f746e', false)
      setData(data)
      setLoading(false)
    } catch (error: any) {
      setError(error.message || 'Failed to fetch data')
      setLoading(false)
    }
  }

  // Old fetch code removed - keeping this comment for reference
  const fetchDataOldWay = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/debug/ruscha-raw')

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Data received:', result)
      setData(result)
      setError(null)
    } catch (err: any) {
      console.error('❌ Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading intelligence data...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-red-600 font-semibold mb-2">Error</h3>
          <p className="mb-4">{error}</p>
          <Button onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-6">Executive Intelligence Summary</h3>
          
          {/* Elite Pulse Analysis */}
          {data?.intelligence?.elite_pulse?.data && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Elite Pulse Analysis
              </h4>
              
              {data.intelligence.elite_pulse.data.wealth_migration && (
                <div className="mb-6">
                  <h5 className="font-semibold mb-2">Wealth Migration Intelligence</h5>
                  <div className="space-y-2 text-sm">
                    <p><strong>Migration Pattern:</strong> {data.intelligence.elite_pulse.data.wealth_migration.from} → {data.intelligence.elite_pulse.data.wealth_migration.to}</p>
                    <p><strong>Volume:</strong> {data.intelligence.elite_pulse.data.wealth_migration.volume}</p>
                    <p><strong>Timeline:</strong> {data.intelligence.elite_pulse.data.wealth_migration.timeline}</p>
                    <p><strong>Confidence:</strong> {Math.round((data.intelligence.elite_pulse.data.wealth_migration.confidence_score || 0) * 100)}%</p>
                  </div>
                </div>
              )}

              {data.intelligence.elite_pulse.data.arbitrage_gap && (
                <div className="mb-6">
                  <h5 className="font-semibold mb-2">Arbitrage Opportunity Analysis</h5>
                  <div className="space-y-2 text-sm">
                    <p><strong>Current Discount:</strong> {data.intelligence.elite_pulse.data.arbitrage_gap.current_discount}</p>
                    <p><strong>Entry Window:</strong> {data.intelligence.elite_pulse.data.arbitrage_gap.capture_window}</p>
                    <p><strong>Required Capital:</strong> {data.intelligence.elite_pulse.data.arbitrage_gap.required_capital_usd}</p>
                  </div>
                </div>
              )}

              {data.intelligence.elite_pulse.data.pattern_recognition && (
                <div className="mb-6">
                  <h5 className="font-semibold mb-2">Pattern Recognition</h5>
                  <div className="space-y-2 text-sm">
                    <p><strong>Mega Trend:</strong> {data.intelligence.elite_pulse.data.pattern_recognition.mega_trend}</p>
                    <p><strong>Conviction:</strong> {data.intelligence.elite_pulse.data.pattern_recognition.conviction}/10</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Debug Info */}
          <div className="mt-8 p-4 bg-gray-100 rounded text-xs">
            <strong>Debug Info:</strong>
            <pre className="mt-2 whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}