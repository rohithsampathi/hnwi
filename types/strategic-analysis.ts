export interface InsightData {
  title: string
  details: string
}

export interface VectorResult {
  id: string
  score: number
  metadata: {
    title: string
    description: string
    url: string
    date: string
    industry: string
    product: string
    summary: string
  }
}

export interface StrategicAnalysisResponse {
  conversation_id: string
  query: string
  timestamp: string
  executive_summary: string
  key_findings: string[]
  market_trends: string[]
  strategic_implications: string[]
  confidence_score: number
  supporting_data: {
    insights: {
      insight_one: InsightData
      insight_two: InsightData
      insight_three: InsightData
      insight_four: InsightData
    }
    vector_results: VectorResult[]
    numerical_data: Array<{
      number: string
      context: string
      unit: string
      industry: string
      product: string
      source: string
      article_date: string
    }>
  }
}

