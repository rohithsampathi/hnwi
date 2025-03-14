"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "@/contexts/theme-context"

interface Section {
  title: string
  content: string[]
}

interface StrategicDashboardProps {
  title: string
  summary: string
  sections: Section[]
  score: {
    value: number
    label: string
  }
  isLoading?: boolean
}

const MotionCard = motion.create(Card)

export function StrategicDashboard({ title, summary, sections, score, isLoading = false }: StrategicDashboardProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const { theme } = useTheme()

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const renderContent = (content: string[]) => {
    if (content.length === 0) {
      return <p className="text-sm text-muted-foreground">No data available</p>
    }
    return (
      <ul className="list-disc pl-5 space-y-2">
        {content.map((item, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="text-base"
          >
            {item}
          </motion.li>
        ))}
      </ul>
    )
  }

  return (
    <div className="grid gap-6 mt-8">
      <div className="mt-4">
        <h2 className="text-2xl font-bold text-primary mb-4">{title}</h2>
        <div className="mb-6">
          {isLoading ? <Skeleton className="w-full h-24" /> : <p className="text-lg leading-relaxed">{summary}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <div
            key={section.title}
            className="col-span-1 md:col-span-2 mb-6"
          >
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-xl font-bold text-primary">{section.title}</h3>
              <Button variant="ghost" size="sm" onClick={() => toggleSection(section.title)}>
                {expandedSections[section.title] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="mt-2">
              <AnimatePresence>
                {expandedSections[section.title] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isLoading ? <Skeleton className="w-full h-24" /> : renderContent(section.content)}
                  </motion.div>
                )}
              </AnimatePresence>
              {!expandedSections[section.title] && (
                <p className="text-sm text-muted-foreground">Click to expand and view details.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-bold text-primary mb-4">Analysis Score</h2>
        <div>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-muted stroke-current"
                  strokeWidth="10"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                />
                <motion.circle
                  className="text-primary stroke-current"
                  strokeWidth="10"
                  strokeLinecap="round"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: isLoading ? 0 : score.value }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  style={{
                    rotate: -90,
                    transformOrigin: "50% 50%",
                  }}
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  {isLoading ? (
                    <Skeleton className="w-16 h-8" />
                  ) : (
                    <span className="text-4xl font-bold text-primary">{(score.value * 100).toFixed(0)}%</span>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            className="text-center mt-4 text-lg font-medium text-muted-foreground"
          >
            {isLoading ? <Skeleton className="w-32 h-6 mx-auto" /> : score.label}
          </motion.p>
        </div>
      </div>
    </div>
  )
}

