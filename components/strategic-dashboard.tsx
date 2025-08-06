"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Lightbulb, TrendingUp, Target, Zap } from "lucide-react"
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

  const getSectionIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case 'key findings':
        return Target
      case 'market trends':
        return TrendingUp
      case 'strategic implications':
        return Zap
      default:
        return Lightbulb
    }
  }

  const renderContent = (content: string[]) => {
    if (content.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-body text-muted-foreground italic">No data available</p>
        </div>
      )
    }
    return (
      <div className="space-y-2">
        {content.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className={`relative group p-3 rounded-lg border transition-all duration-300 hover:shadow-md 
              ${theme === "dark" 
                ? "bg-gray-800/30 border-gray-700/50 hover:border-primary/30 hover:bg-gray-800/50" 
                : "bg-white/50 border-gray-200/50 hover:border-primary/30 hover:bg-white/80"
              } backdrop-blur-sm`}
          >
            <div className="flex items-start space-x-3">
              <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 mt-0.5">
                <Lightbulb className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-body font-semibold leading-snug flex-1 text-foreground group-hover:text-primary transition-colors duration-300">
                {item}
              </p>
            </div>
            <div className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 mt-8">
      <div className="mt-4">
        <h2 className="text-title font-bold text-primary mb-4 text-shadow">{title}</h2>
        <div className="mb-6">
          {isLoading ? <Skeleton className="w-full h-24" /> : <p className="text-body-large leading-relaxed">{summary}</p>}
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => {
          const IconComponent = getSectionIcon(section.title)
          const isExpanded = expandedSections[section.title]
          
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative overflow-hidden rounded-2xl backdrop-blur-sm"
            >
              <div 
                className={`flex flex-row items-center justify-between p-6 cursor-pointer group transition-all duration-300
                  ${theme === "dark" 
                    ? "bg-gradient-to-r from-gray-800/80 to-gray-900/80 border border-gray-700/50 hover:border-primary/50" 
                    : "bg-gradient-to-r from-white/80 to-gray-50/80 border border-gray-200/50 hover:border-primary/30"
                  } 
                  ${isExpanded ? 'rounded-t-2xl border-b-0' : 'rounded-2xl'}
                  hover:shadow-xl shadow-lg`}
                onClick={() => toggleSection(section.title)}
              >
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300"
                    whileHover={{ rotate: 5, scale: 1.05 }}
                  >
                    <IconComponent className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h3 className="card-title font-bold text-primary group-hover:text-primary/90 transition-colors text-shadow-sm">
                    {section.title}
                  </h3>
                </div>
                <motion.div
                  className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300"
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-5 w-5 text-primary" />
                </motion.div>
              </div>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className={`border-t-0 rounded-b-2xl overflow-hidden
                      ${theme === "dark" 
                        ? "bg-gradient-to-b from-gray-800/60 to-gray-900/60 border border-gray-700/50" 
                        : "bg-gradient-to-b from-white/60 to-gray-50/60 border border-gray-200/50"
                      }`}
                  >
                    <div className="p-6 pt-0">
                      {isLoading ? (
                        <div className="space-y-4">
                          {Array(3).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-xl" />
                          ))}
                        </div>
                      ) : (
                        renderContent(section.content)
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-12"
      >
        <div className={`relative overflow-hidden rounded-2xl p-8 
          ${theme === "dark" 
            ? "bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50" 
            : "bg-gradient-to-br from-white/60 to-gray-50/60 border border-gray-200/50"
          } backdrop-blur-sm shadow-xl`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
          <div className="relative">
            <h2 className="text-subtitle text-primary mb-8 text-center">Analysis Confidence</h2>
            <div className="flex flex-col items-center">
              <div className="relative w-56 h-56 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className={`${theme === "dark" ? "text-gray-700" : "text-gray-200"} stroke-current`}
                    strokeWidth="8"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  />
                  <motion.circle
                    className="text-primary stroke-current"
                    strokeWidth="8"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: isLoading ? 0 : score.value }}
                    transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                    style={{
                      strokeDasharray: `${2 * Math.PI * 40}`,
                      strokeDashoffset: `${2 * Math.PI * 40 * (1 - (isLoading ? 0 : score.value))}`,
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="text-center"
                  >
                    {isLoading ? (
                      <Skeleton className="w-20 h-12 mx-auto" />
                    ) : (
                      <>
                        <span className="text-5xl md:text-6xl font-bold text-primary bg-gradient-to-b from-primary to-primary/80 bg-clip-text">
                          {(score.value * 100).toFixed(0)}
                        </span>
                        <span className="text-2xl font-bold text-primary/60">%</span>
                      </>
                    )}
                  </motion.div>
                </div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2 }}
                className="text-center"
              >
                {isLoading ? (
                  <Skeleton className="w-40 h-6 mx-auto" />
                ) : (
                  <>
                    <p className="text-body-large font-semibold text-primary mb-2">{score.label}</p>
                    <p className="text-caption text-muted-foreground max-w-md">
                      Based on comprehensive analysis of {score.value >= 0.9 ? 'exceptional' : score.value >= 0.8 ? 'strong' : score.value >= 0.7 ? 'moderate' : 'limited'} data quality and source reliability
                    </p>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

