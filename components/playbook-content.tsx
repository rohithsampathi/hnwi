// components/playbook-content.tsx

"use client"

import React, { useState } from "react"
// import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "@/contexts/theme-context"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown,
  Lightbulb,
  Swords,
  BarChart2,
  Brain,
  Users,
  MapPin,
  Rocket,
  Presentation,
  DollarSign,
  Handshake,
  TrendingUp,
  CheckCircle,
} from "lucide-react"
import ChannelPerformanceRating from "./channel-performance-rating"
import MarketData from "./market-data"
import { Heading2, Paragraph } from "@/components/ui/typography"
import { HNWIThinkingSection } from "./hnwi-thinking-section"
import { CompetitiveIntelligence } from "./competitive-intelligence"

interface PlaybookElement {
  type: string
  content: string
  elements: PlaybookElement[]
  sub_bullets?: PlaybookElement[]
}

interface PlaybookSection {
  type: string
  content: string
  elements: PlaybookElement[]
}

interface PlaybookContentProps {
  section: PlaybookSection
  industry?: string
  analysisResult?: any // Add analysisResult prop
}

const getSourceIndices = (content: string, url: string, analysisResult: any) => {
  // Assuming analysisResult is available in the component's props
  return (analysisResult?.supporting_data?.vector_results || [])
    .map((result, index) => ({ index: index + 1, url: result.metadata.url }))
    .filter((source) => source.url === url)
    .map((source) => source.index)
}

const ExpandableSection: React.FC<{ element: PlaybookElement; theme: string; level: number; isFirst?: boolean }> = ({
  element,
  theme,
  level,
  isFirst = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const headingClass = level === 1 ? "text-xl" : "text-lg"
  const paddingClass = `pl-${level * 4}`
  const marginClass = isFirst ? "" : "mt-4"

  return (
    <div className={`${paddingClass} ${marginClass}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 rounded-3xl ${theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100"} transition-colors border-0 shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)]`}
      >
        {level === 1 ? (
          <h2
            className="text-xl font-bold font-heading text-left line-clamp-2"
            dangerouslySetInnerHTML={{ __html: element.content }}
          />
        ) : (
          <h3
            className={`${headingClass} font-bold font-heading text-left line-clamp-2`}
            dangerouslySetInnerHTML={{ __html: element.content }}
          />
        )}
        <div className="clickable-arrow">
          <ChevronDown className={`w-5 h-5 transform transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-transparent shadow-none bg-transparent"
          >
            <div className="p-4">
              {element.elements?.map((subElement, index) => (
                <React.Fragment key={index}>{renderElement(subElement, theme, level + 1)}</React.Fragment>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const renderBulletList = (elements: PlaybookElement[], isSubBullet = false) => {
  return (
    <ul className={`space-y-2 ${isSubBullet ? "mt-2" : "mt-4"}`}>
      {elements.map((item, index) => (
        <li key={index} className="flex items-start">
          <Lightbulb className="w-5 h-5 mr-2 flex-shrink-0 mt-1 text-primary" />
          <div>
            {item.content.includes(":") ? (
              <Paragraph>
                <span className="font-bold">{item.content.split(":")[0]}:</span>
                {item.content
                  .split(":")
                  .slice(1)
                  .join(":")
                  .replace(/^Example:/g, "<strong>Example:</strong>")
                  .replace(/^- /g, "<strong>- </strong>")}
              </Paragraph>
            ) : (
              <Paragraph
                dangerouslySetInnerHTML={{
                  __html: item.content
                    .replace(/^Example:/g, "<strong>Example:</strong>")
                    .replace(/^- /g, "<strong>- </strong>"),
                }}
              />
            )}
            {item.sub_bullets && item.sub_bullets.length > 0 && renderBulletList(item.sub_bullets, true)}
          </div>
        </li>
      ))}
    </ul>
  )
}

const renderElement = (element: PlaybookElement, theme: string, level = 0, industry?: string, isFirst = false) => {
  // Skip rendering if the element is empty
  if (!element.content && (!element.elements || element.elements.length === 0)) {
    return null
  }

  switch (element.type) {
    case "main_heading":
      return <h2 className={`text-2xl font-bold mb-4 text-primary`}>{element.content}</h2>
    case "subheading":
      return (
        <ExpandableSection
          element={{
            ...element,
            content: element.content.replace(/^Goal:\s*/, "<strong>Goal:</strong> "),
          }}
          theme={theme}
          level={level}
          isFirst={isFirst}
        />
      )
    case "paragraph":
      if (element.elements && element.elements.length > 0) {
        return <ExpandableSection element={element} theme={theme} level={level} isFirst={isFirst} />
      }
      return (
        <p
          className="mb-4"
          dangerouslySetInnerHTML={{
            __html: element.content
              .replace(/^Goal:\s*/, "<strong>Goal:</strong> ")
              .replace(/^Example:/g, "<strong>Example:</strong>")
              .replace(/^- /g, "<strong>- </strong>"),
          }}
        />
      )
    case "bullet_list":
      return renderBulletList(element.elements)
    case "channel_performance_rating":
      return (
        <div className="mb-4 px-5">
          <div className="flex items-center mb-2">
            <BarChart2 className="w-6 h-6 mr-2 text-primary" />
            <Heading2 className="text-2xl font-bold text-primary">Channel Performance Rating</Heading2>
          </div>
          <div className="mb-4">
            <Paragraph className="text-sm text-muted-foreground">
              Real-Time performance rating from other companies targeting HNWIs of various marketing and sales channels
              that's working for them
            </Paragraph>
            <div className="mt-2">
            </div>
          </div>
          <ChannelPerformanceRating />
        </div>
      )
    case "market_data":
      return (
        <div className="mb-4 px-5">
          <MarketData />
        </div>
      )
    case "competitive_intelligence":
      return (
        <div className="mb-4 px-5">
          <div className="flex items-center mb-2">
            <Swords className="w-6 h-6 mr-2 text-primary" />
            <Heading2 className="text-2xl font-bold text-primary">Competitive Intelligence</Heading2>
          </div>
          <div className="mb-4">
            <Paragraph className="text-sm text-muted-foreground">
              Real-Time Competitive Intelligence & Strategies of Companies working for HNWIs
            </Paragraph>
            <div className="mt-2">
            </div>
          </div>
          <CompetitiveIntelligence industry={industry || "Real Estate"} />
        </div>
      )
    case "hnwi_thinking":
      return (
        <div className="mb-4 px-5">
          <div className="flex items-center mb-2">
            <Brain className="w-6 h-6 mr-2 text-primary" />
            <Heading2 className="text-2xl font-bold text-primary">What HNWIs are Thinking?</Heading2>
          </div>
          <div className="mb-4">
            <Paragraph className="text-sm text-muted-foreground">
              Real-Time Insights into HNWI Thoughts and Preferences
            </Paragraph>
            <div className="mt-2">
            </div>
          </div>
          <HNWIThinkingSection industry={industry || "Real Estate"} />
        </div>
      )
    case "analysis_summary":
      return (
        <div className="w-full bg-transparent">
          <div className="px-3 py-3">
            <div className="space-y-2">
              <h4 className="text-base font-semibold">Analysis summary</h4>
              <div className="text-sm text-muted-foreground max-h-60 overflow-y-auto pr-2">
                {formatAnalysis(element.content)
                  .summary.split("\n")
                  .map((paragraph, index) => (
                    <p key={`summary-${index}`} className="mb-2 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )
    case "market_overview":
      return (
        <div className="mb-4 px-5">
          <div className="flex items-center mb-2">
            <BarChart2 className="w-6 h-6 mr-2 text-primary" />
            <Heading2 className="text-2xl font-bold text-primary">Market Overview</Heading2>
          </div>
          {/* Add content for Market Overview */}
        </div>
      )
    case "target_audience":
      return (
        <div className="mb-4 px-5">
          <div className="flex items-center mb-2">
            <Users className="w-6 h-6 mr-2 text-primary" />
            <Heading2 className="text-2xl font-bold text-primary">Target Audience</Heading2>
          </div>
          {/* Add content for Target Audience */}
        </div>
      )
    case "ideal_locations":
      return (
        <div className="mb-4 px-5">
          <div className="flex items-center mb-2">
            <MapPin className="w-6 h-6 mr-2 text-primary" />
            <Heading2 className="text-2xl font-bold text-primary">Ideal Locations</Heading2>
          </div>
          {/* Add content for Ideal Locations */}
        </div>
      )
    case "go_to_market_strategy":
      return (
        <div className="mb-4 px-5">
          <div className="flex items-center mb-2">
            <Rocket className="w-6 h-6 mr-2 text-primary" />
            <Heading2 className="text-2xl font-bold text-primary">Go To Market Strategy</Heading2>
          </div>
          {/* Add content for Go To Market Strategy */}
        </div>
      )
    case "sales_pitch_frameworks":
      return (
        <div className="mb-4 px-5">
          <div className="flex items-center mb-2">
            <Presentation className="w-6 h-6 mr-2 text-primary" />
            <Heading2 className="text-2xl font-bold text-primary">Sales Pitch Frameworks</Heading2>
          </div>
          {/* Add content for Sales Pitch Frameworks */}
        </div>
      )
    case "pricing_strategy":
      return (
        <div className="mb-4 px-5">
          <div className="flex items-center mb-2">
            <DollarSign className="w-6 h-6 mr-2 text-primary" />
            <Heading2 className="text-2xl font-bold text-primary">Pricing Strategy</Heading2>
          </div>
          {/* Add content for Pricing Strategy */}
        </div>
      )
    case "strategic_partnership":
      return (
        <div className="mb-4 px-5">
          <div className="flex items-center mb-2">
            <Handshake className="w-6 h-6 mr-2 text-primary" />
            <Heading2 className="text-2xl font-bold text-primary">Strategic Partnership</Heading2>
          </div>
          {/* Add content for Strategic Partnership */}
        </div>
      )
    case "performance_metrics":
      return (
        <div className="mb-4 px-5">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-6 h-6 mr-2 text-primary" />
            <Heading2 className="text-2xl font-bold text-primary">Performance Metrics</Heading2>
          </div>
          {/* Add content for Performance Metrics */}
        </div>
      )
    case "closing":
      return (
        <div className="mb-4 px-5">
          <div className="flex items-center mb-2">
            <CheckCircle className="w-6 h-6 mr-2 text-primary" />
            <Heading2 className="text-2xl font-bold text-primary">Closing</Heading2>
          </div>
          {/* Add content for Closing */}
        </div>
      )
    case "key_findings":
    case "market_trends":
    case "strategic_implications":
      return (
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">
            {element.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            {element.elements.map((item, index) => {
              const [content, sourceIndex] = item.content.split(" [")
              return (
                <li key={index}>
                  {content} [{sourceIndex.replace("]", "")}]
                </li>
              )
            })}
          </ul>
        </div>
      )
    default:
      return <Paragraph className="mb-2">{element.content}</Paragraph>
  }
}

export function PlaybookContent({ section, industry, analysisResult }: PlaybookContentProps) {
  const { theme } = useTheme()

  // Filter out empty elements
  const nonEmptyElements = section.elements.filter(
    (element) => element.content || (element.elements && element.elements.length > 0),
  )

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="w-full md:w-[calc(100%+2rem)] md:-ml-4 border-0"
      >
        <div className="p-3 md:p-6">
          <div className="w-full space-y-6 px-0 md:px-4">
            {nonEmptyElements.map((element, elementIndex) => (
              <React.Fragment key={elementIndex}>{renderElement(element, theme, 0, industry)}</React.Fragment>
            ))}
          </div>
          {analysisResult && analysisResult.supporting_data && analysisResult.supporting_data.vector_results && (
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-2">Sources</h3>
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
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Placeholder for formatAnalysis function.  Replace with your actual implementation.
const formatAnalysis = (content: string) => ({ summary: content })

