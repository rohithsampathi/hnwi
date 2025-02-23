"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, BarChart2, Brain, Swords, PieChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlaybookContent } from "@/components/playbook-content"
import { useTheme } from "@/contexts/theme-context"

interface PlaybookSection {
  type: string
  content: string
  elements: any[]
}

interface MobilePlaybookViewProps {
  sections: PlaybookSection[]
  industry?: string
}

export function MobilePlaybookView({ sections, industry }: MobilePlaybookViewProps) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null)
  const { theme } = useTheme()

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index)
  }

  const getIconForSection = (type: string) => {
    switch (type) {
      case "channel_performance_rating":
        return <BarChart2 className="w-4 h-4 flex-shrink-0 text-primary" />
      case "market_data":
        return <PieChart className="w-4 h-4 flex-shrink-0 text-primary" />
      case "competitive_intelligence":
        return <Swords className="w-4 h-4 flex-shrink-0 text-primary" />
      case "hnwi_thinking":
        return <Brain className="w-4 h-4 flex-shrink-0 text-primary" />
      default:
        return null
    }
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-hidden">
      <ScrollArea className="h-full pb-16">
        <div className="px-2 py-4 space-y-2 max-w-[100vw]">
          {sections.map((section, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center p-3 text-left"
                onClick={() => toggleSection(index)}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  {getIconForSection(section.type)}
                  <span className="text-sm font-medium truncate pr-2">{section.content}</span>
                </div>
                {expandedSection === index ? (
                  <ChevronUp className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                )}
              </Button>
              <AnimatePresence>
                {expandedSection === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`border-t overflow-x-hidden ${theme === "dark" ? "bg-[#1E1E1E]" : "bg-white"}`}>
                      <div className="p-2 overflow-x-auto">
                        <PlaybookContent section={section} industry={industry} />
                      </div>
                      <Button variant="ghost" onClick={() => toggleSection(index)} className="w-full mt-2 text-sm">
                        Close
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

